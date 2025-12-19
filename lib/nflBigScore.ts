// lib/nflBigScore.ts
// Live NFL: fetch all completed games from ESPN scoreboard (last N days)
// and output FAIR cards (score + simple RAI + blowout-aware PAI)

export type Lever = { lever: string; value: number };

export type NFLBigScoreMatch = {
  matchup: string;
  finalScore: string;
  raiEdge: {
    team: string;
    value: number;
    levers: Lever[];
  };
  pai: {
    teamA: { team: string; score: string; levers: Lever[] };
    teamB: { team: string; score: string; levers: Lever[] };
  };
};

export type NFLBigScoreSnapshot = {
  sport: "nfl";
  updatedAt: string;
  matches: NFLBigScoreMatch[];
};

type ESPNCompetitor = {
  homeAway?: "home" | "away";
  team?: { displayName?: string };
  score?: string; // often string "28"
  records?: { summary?: string }[]; // e.g. "10-4"
};

type ESPNEvent = {
  id?: string;
  name?: string; // "Team A vs Team B"
  competitions?: Array<{
    competitors?: ESPNCompetitor[];
    status?: { type?: { completed?: boolean } };
  }>;
};

function yyyymmdd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function safeNum(x: unknown): number | null {
  const n = typeof x === "string" ? Number(x) : typeof x === "number" ? x : NaN;
  return Number.isFinite(n) ? n : null;
}

function parseRecordSummary(summary: string | undefined): { wins: number; losses: number } | null {
  if (!summary) return null;
  // NFL typically "10-4" or "10-4-0"
  const parts = summary.split("-").map((p) => Number(p));
  if (parts.length < 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return null;
  return { wins: parts[0], losses: parts[1] };
}

function winPct(rec: { wins: number; losses: number } | null): number {
  if (!rec) return 0.5;
  const total = rec.wins + rec.losses;
  if (total <= 0) return 0.5;
  return rec.wins / total;
}

/**
 * Blowout amplification factor for PAI magnitude (score-margin aware)
 */
function blowoutFactor(margin: number): number {
  if (margin < 7) return 1.0;   // one-score
  if (margin < 14) return 1.4;  // solid
  if (margin < 21) return 1.9;  // strong
  if (margin < 28) return 2.6;  // blowout
  return 3.3;                  // massacre
}

function computePAILevers(winner: boolean, margin: number): Lever[] {
  const f = blowoutFactor(margin);
  const s = winner ? 1 : -1;

  // Keep it interpretable and stable
  return [
    { lever: "Early-down efficiency", value: Number((s * 0.45 * f).toFixed(2)) },
    { lever: "Pass protection integrity", value: Number((s * 0.35 * f).toFixed(2)) },
    { lever: "Coverage matchup stress", value: Number((s * 0.40 * f).toFixed(2)) },
  ];
}

/**
 * Simple (free) comparative RAI proxy from records + home field.
 * Not “prediction”, just structural context.
 */
function computeRAI(
  homeTeam: string,
  awayTeam: string,
  homeRecSummary?: string,
  awayRecSummary?: string
): { team: string; delta: number; levers: Lever[] } {
  const homeRec = parseRecordSummary(homeRecSummary);
  const awayRec = parseRecordSummary(awayRecSummary);

  const homeWp = winPct(homeRec);
  const awayWp = winPct(awayRec);

  const winPctDiff = (homeWp - awayWp) * 10; // scale
  const homeField = 0.4; // small structural edge

  const delta = winPctDiff + homeField;

  const edgeTeam = delta >= 0 ? homeTeam : awayTeam;

  return {
    team: edgeTeam,
    delta: Number(delta.toFixed(2)),
    levers: [
      { lever: "Win% differential (scaled)", value: Number(winPctDiff.toFixed(2)) },
      { lever: "Home field context", value: Number(homeField.toFixed(2)) },
    ],
  };
}

async function fetchESPNScoreboard(dateYYYYMMDD: string): Promise<ESPNEvent[]> {
  const url =
    `https://site.web.api.espn.com/apis/v2/sports/football/nfl/scoreboard?dates=${dateYYYYMMDD}`;

  const res = await fetch(url, {
    // avoid Next cache surprises
    cache: "no-store",
    headers: { "accept": "application/json" },
  });

  if (!res.ok) return [];
  const json = (await res.json()) as { events?: ESPNEvent[] };
  return Array.isArray(json.events) ? json.events : [];
}

export async function computeNFLBigScoreSnapshot(daysBack: number = 7): Promise<NFLBigScoreSnapshot> {
  const now = new Date();
  const dates: string[] = [];
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(yyyymmdd(d));
  }

  const matches: NFLBigScoreMatch[] = [];
  const seen = new Set<string>();

  for (const date of dates) {
    let events: ESPNEvent[] = [];
    try {
      events = await fetchESPNScoreboard(date);
    } catch {
      events = [];
    }

    for (const ev of events) {
      const comp = ev.competitions?.[0];
      const completed = !!comp?.status?.type?.completed;
      if (!completed) continue;

      const competitors = comp?.competitors ?? [];
      const home = competitors.find((c) => c.homeAway === "home");
      const away = competitors.find((c) => c.homeAway === "away");

      const homeName = home?.team?.displayName ?? "Home";
      const awayName = away?.team?.displayName ?? "Away";

      const hs = safeNum(home?.score);
      const as = safeNum(away?.score);

      if (hs === null || as === null) continue;

      // dedupe by event id or by matchup+date
      const key = ev.id ?? `${date}-${homeName}-${awayName}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const finalScore = `${hs} – ${as}`;
      const margin = Math.abs(hs - as);
      const homeWon = hs > as;

      const homeRec = home?.records?.[0]?.summary;
      const awayRec = away?.records?.[0]?.summary;

      const rai = computeRAI(homeName, awayName, homeRec, awayRec);

      matches.push({
        matchup: `${homeName} vs ${awayName}`,
        finalScore,

        raiEdge: {
          team: rai.team,
          value: rai.delta,
          levers: [
            { lever: rai.delta >= 0 ? "Win% differential (home−away)" : "Win% differential (away−home)", value: rai.levers[0].value },
            { lever: "Home field context", value: rai.levers[1].value },
          ],
        },

        pai: {
          teamA: {
            team: homeName,
            score: finalScore,
            levers: computePAILevers(homeWon, margin),
          },
          teamB: {
            team: awayName,
            score: finalScore,
            levers: computePAILevers(!homeWon, margin),
          },
        },
      });
    }
  }

  // newest first (roughly)
  matches.reverse();

  return {
    sport:
