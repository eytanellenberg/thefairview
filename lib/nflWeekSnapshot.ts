// lib/nflWeekSnapshot.ts
// NFL — last completed week (automatic) → match-based FAIR cards

export type Lever = { lever: string; value: number };

export type NFLWeekMatch = {
  matchup: string;
  finalScore: string;

  rai: {
    edgeTeam: string;
    edgeValue: number;
    levers: Lever[];
  };

  pai: {
    teamA: { team: string; score: string; levers: Lever[] };
    teamB: { team: string; score: string; levers: Lever[] };
  };
};

export type NFLWeekSnapshot = {
  sport: "nfl";
  seasonYear: number;
  seasonType: number;
  week: number;
  updatedAt: string;
  matches: NFLWeekMatch[];
};

type ESPNRecord = { summary?: string };
type ESPNTeam = { displayName?: string };

type ESPNCompetitor = {
  homeAway?: "home" | "away";
  team?: ESPNTeam;
  score?: string; // "28"
  records?: ESPNRecord[]; // [ { summary: "10-4" } ]
};

type ESPNStatusType = {
  completed?: boolean;
};

type ESPNCompetition = {
  competitors?: ESPNCompetitor[];
  status?: { type?: ESPNStatusType };
};

type ESPNEvent = {
  id?: string;
  competitions?: ESPNCompetition[];
};

type ESPNScoreboard = {
  season?: { year?: number; type?: number };
  week?: { number?: number };
  events?: ESPNEvent[];
};

const ESPN_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (compatible; FAIR-Analytics/1.0; +https://thefairview.app)",
  Accept: "application/json",
};

function safeNum(x: unknown): number | null {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function parseRecordSummary(summary?: string): { wins: number; losses: number } | null {
  if (!summary) return null;
  // typical: "10-4" or "10-4-0"
  const parts = summary.split("-").map((p) => Number(p));
  if (parts.length < 2) return null;
  const wins = parts[0];
  const losses = parts[1];
  if (!Number.isFinite(wins) || !Number.isFinite(losses)) return null;
  return { wins, losses };
}

function winPct(rec: { wins: number; losses: number } | null): number {
  if (!rec) return 0.5;
  const total = rec.wins + rec.losses;
  if (total <= 0) return 0.5;
  return rec.wins / total;
}

function blowoutFactor(margin: number): number {
  if (margin < 7) return 1.0;
  if (margin < 14) return 1.5;
  if (margin < 21) return 2.0;
  if (margin < 28) return 2.7;
  return 3.3;
}

function computePAILevers(won: boolean, margin: number): Lever[] {
  const f = blowoutFactor(margin);
  const s = won ? 1 : -1;

  return [
    { lever: "Early-down efficiency", value: Number((s * 0.40 * f).toFixed(2)) },
    { lever: "Pass protection integrity", value: Number((s * 0.32 * f).toFixed(2)) },
    { lever: "Coverage matchup stress", value: Number((s * 0.36 * f).toFixed(2)) },
  ];
}

/**
 * FREE comparative RAI proxy:
 * - Win% differential (scaled)
 * - Home field context
 */
function computeComparativeRAI(
  homeTeam: string,
  awayTeam: string,
  homeRecSummary?: string,
  awayRecSummary?: string
): { edgeTeam: string; edgeValue: number; levers: Lever[] } {
  const homeRec = parseRecordSummary(homeRecSummary);
  const awayRec = parseRecordSummary(awayRecSummary);

  const homeWp = winPct(homeRec);
  const awayWp = winPct(awayRec);

  const winPctDiffScaled = (homeWp - awayWp) * 10; // scale for readability
  const homeField = 0.4;

  const edgeValue = winPctDiffScaled + homeField;
  const edgeTeam = edgeValue >= 0 ? homeTeam : awayTeam;

  // Present levers as (A − B) where A=home, B=away
  return {
    edgeTeam,
    edgeValue: Number(edgeValue.toFixed(2)),
    levers: [
      { lever: "Record strength (home−away, scaled)", value: Number(winPctDiffScaled.toFixed(2)) },
      { lever: "Home field context", value: Number(homeField.toFixed(2)) },
    ],
  };
}

async function fetchScoreboard(params: Record<string, string | number | undefined>): Promise<ESPNScoreboard> {
  const base = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
  const usp = new URLSearchParams();

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    usp.set(k, String(v));
  }

  const url = usp.toString() ? `${base}?${usp.toString()}` : base;

  const res = await fetch(url, {
    cache: "no-store",
    headers: ESPN_HEADERS,
  });

  if (!res.ok) {
    throw new Error(`ESPN scoreboard fetch failed (${res.status})`);
  }

  const json = (await res.json()) as ESPNScoreboard;
  return json;
}

function allEventsCompleted(events: ESPNEvent[]): boolean {
  if (!events.length) return false;
  return events.every((ev) => {
    const comp = ev.competitions?.[0];
    return comp?.status?.type?.completed === true;
  });
}

function extractMatchFromEvent(ev: ESPNEvent): {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeRecord?: string;
  awayRecord?: string;
} | null {
  const comp = ev.competitions?.[0];
  if (!comp || comp.status?.type?.completed !== true) return null;

  const competitors = comp.competitors ?? [];
  const home = competitors.find((c) => c.homeAway === "home");
  const away = competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const homeTeam = home.team?.displayName ?? "";
  const awayTeam = away.team?.displayName ?? "";
  if (!homeTeam || !awayTeam) return null;

  const hs = safeNum(home.score);
  const as = safeNum(away.score);
  if (hs === null || as === null) return null;

  const homeRecord = home.records?.[0]?.summary;
  const awayRecord = away.records?.[0]?.summary;

  return { homeTeam, awayTeam, homeScore: hs, awayScore: as, homeRecord, awayRecord };
}

/**
 * Main: compute last completed week snapshot
 */
export async function computeNFLWeekSnapshot(): Promise<NFLWeekSnapshot> {
  // 1) Get current context
  const current = await fetchScoreboard({});
  const seasonYear = current.season?.year ?? new Date().getUTCFullYear();
  const seasonType = current.season?.type ?? 2; // usually 2=regular season, 3=postseason
  const currentWeek = current.week?.number ?? 1;

  // 2) Find last completed week (walk backwards)
  let lastCompletedWeek = currentWeek;
  let lastWeekBoard: ESPNScoreboard | null = null;

  for (let w = currentWeek; w >= 1; w--) {
    const board = await fetchScoreboard({
      year: seasonYear,
      seasontype: seasonType,
      week: w,
    });

    const events = Array.isArray(board.events) ? board.events : [];
    if (allEventsCompleted(events)) {
      lastCompletedWeek = w;
      lastWeekBoard = board;
      break;
    }
  }

  if (!lastWeekBoard) {
    return {
      sport: "nfl",
      seasonYear,
      seasonType,
      week: lastCompletedWeek,
      updatedAt: new Date().toISOString(),
      matches: [],
    };
  }

  const events = Array.isArray(lastWeekBoard.events) ? lastWeekBoard.events : [];
  const matches: NFLWeekMatch[] = [];

  for (const ev of events) {
    const m = extractMatchFromEvent(ev);
    if (!m) continue;

    const finalScore = `${m.homeScore} – ${m.awayScore}`;
    const margin = Math.abs(m.homeScore - m.awayScore);
    const homeWon = m.homeScore > m.awayScore;

    const rai = computeComparativeRAI(
      m.homeTeam,
      m.awayTeam,
      m.homeRecord,
      m.awayRecord
    );

    matches.push({
      matchup: `${m.homeTeam} vs ${m.awayTeam}`,
      finalScore,

      rai: {
        edgeTeam: rai.edgeTeam,
        edgeValue: rai.edgeValue,
        levers: rai.levers,
      },

      pai: {
        teamA: {
          team: m.homeTeam,
          score: finalScore,
          levers: computePAILevers(homeWon, margin),
        },
        teamB: {
          team: m.awayTeam,
          score: finalScore,
          levers: computePAILevers(!homeWon, margin),
        },
      },
    });
  }

  return {
    sport: "nfl",
    seasonYear,
    seasonType,
    week: lastCompletedWeek,
    updatedAt: new Date().toISOString(),
    matches,
  };
}
