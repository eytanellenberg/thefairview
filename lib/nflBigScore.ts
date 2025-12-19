// lib/nflBigScore.ts
// NFL — LAST GAME PER TEAM (one card per team)

export type Lever = { lever: string; value: number };

export type NFLTeamLastGame = {
  team: string;
  opponent: string;
  matchup: string;
  finalScore: string;

  rai: {
    value: number;
    levers: Lever[];
  };

  pai: {
    levers: Lever[];
  };
};

export type NFLBigScoreSnapshot = {
  sport: "nfl";
  updatedAt: string;
  teams: NFLTeamLastGame[];
};

type ESPNEvent = {
  competitions?: {
    competitors?: {
      team?: { displayName?: string };
      score?: string;
      homeAway?: "home" | "away";
    }[];
    status?: { type?: { completed?: boolean } };
  }[];
};

function yyyymmdd(d: Date) {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}${String(d.getUTCDate()).padStart(2, "0")}`;
}

function num(x: any): number | null {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function blowoutFactor(margin: number) {
  if (margin < 7) return 1;
  if (margin < 14) return 1.5;
  if (margin < 21) return 2;
  return 3;
}

function computePAI(margin: number, won: boolean): Lever[] {
  const f = blowoutFactor(margin);
  const s = won ? 1 : -1;

  return [
    { lever: "Early-down efficiency", value: +(s * 0.4 * f).toFixed(2) },
    { lever: "Pass protection integrity", value: +(s * 0.3 * f).toFixed(2) },
    { lever: "Coverage matchup stress", value: +(s * 0.35 * f).toFixed(2) },
  ];
}

function computeRAI(): { value: number; levers: Lever[] } {
  // FREE version: neutral baseline (real data comes in premium)
  return {
    value: 0,
    levers: [
      { lever: "Structural baseline", value: 0 },
      { lever: "Context balance", value: 0 },
    ],
  };
}

async function fetchScoreboard(date: string): Promise<ESPNEvent[]> {
  const url = `https://site.web.api.espn.com/apis/v2/sports/football/nfl/scoreboard?dates=${date}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.events ?? [];
}

export async function computeNFLBigScoreSnapshot(): Promise<NFLBigScoreSnapshot> {
  const collected = new Map<string, NFLTeamLastGame>();

  const today = new Date();

  for (let i = 0; i < 14 && collected.size < 32; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const date = yyyymmdd(d);

    const events = await fetchScoreboard(date);

    for (const ev of events) {
      const comp = ev.competitions?.[0];
      if (!comp?.status?.type?.completed) continue;

      const c = comp.competitors ?? [];
      if (c.length !== 2) continue;

      const A = c[0];
      const B = c[1];

      const teamA = A.team?.displayName;
      const teamB = B.team?.displayName;
      const sA = num(A.score);
      const sB = num(B.score);

      if (!teamA || !teamB || sA === null || sB === null) continue;

      const margin = Math.abs(sA - sB);

      const Awon = sA > sB;
      const Bwon = sB > sA;

      if (!collected.has(teamA)) {
        collected.set(teamA, {
          team: teamA,
          opponent: teamB,
          matchup: `${teamA} vs ${teamB}`,
          finalScore: `${sA} – ${sB}`,
          rai: computeRAI(),
          pai: { levers: computePAI(margin, Awon) },
        });
      }

      if (!collected.has(teamB)) {
        collected.set(teamB, {
          team: teamB,
          opponent: teamA,
          matchup: `${teamB} vs ${teamA}`,
          finalScore: `${sB} – ${sA}`,
          rai: computeRAI(),
          pai: { levers: computePAI(margin, Bwon) },
        });
      }

      if (collected.size >= 32) break;
    }
  }

  return {
    sport: "nfl",
    updatedAt: new Date().toISOString(),
    teams: Array.from(collected.values()),
  };
}
