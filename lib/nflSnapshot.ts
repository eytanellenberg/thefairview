import { getLastGame, getRecentGames } from "@/lib/providers/espn";

/* ===================== TYPES ===================== */

type TeamRef = {
  id: string;
  name: string;
};

type RAILever = {
  lever: string;
  advantage: string;
  value: number;
};

type PAILever = {
  lever: string;
  value: number;
  status: "Outperformed vs expectation" | "Confirmed as expected" | "Weakened vs expectation";
};

export type NFLMatchCard = {
  match: string;
  finalScore: string;
  dateUtc: string;

  pregame: {
    edgeTeam: string;
    delta: number;
    levers: RAILever[];
  };

  postgame: {
    teams: {
      team: string;
      lastScore: string;
      levers: PAILever[];
    }[];
    conclusion: string;
  };
};

/* ===================== CONFIG ===================== */

const NFL_TEAMS: TeamRef[] = [
  { id: "1", name: "Atlanta Falcons" },
  { id: "2", name: "Buffalo Bills" },
  { id: "3", name: "Chicago Bears" },
  { id: "4", name: "Cincinnati Bengals" },
  { id: "5", name: "Cleveland Browns" },
  { id: "6", name: "Dallas Cowboys" },
  { id: "7", name: "Denver Broncos" },
  { id: "8", name: "Green Bay Packers" },
  { id: "9", name: "Kansas City Chiefs" },
  { id: "10", name: "Las Vegas Raiders" },
  { id: "11", name: "Los Angeles Chargers" },
  { id: "12", name: "Los Angeles Rams" },
  { id: "13", name: "Miami Dolphins" },
  { id: "14", name: "Minnesota Vikings" },
  { id: "15", name: "New England Patriots" },
  { id: "16", name: "New Orleans Saints" },
  { id: "17", name: "New York Giants" },
  { id: "18", name: "New York Jets" },
  { id: "19", name: "Philadelphia Eagles" },
  { id: "20", name: "Pittsburgh Steelers" },
  { id: "21", name: "San Francisco 49ers" },
  { id: "22", name: "Seattle Seahawks" },
  { id: "23", name: "Tampa Bay Buccaneers" },
  { id: "24", name: "Tennessee Titans" },
  { id: "25", name: "Washington Commanders" },
];

/* ===================== HELPERS ===================== */

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function matchKey(dateUtc: string, a: string, b: string) {
  return `${dateUtc}-${[a, b].sort().join("-")}`;
}

function statusFromValue(v: number): PAILever["status"] {
  if (v >= 1) return "Outperformed vs expectation";
  if (v <= -1) return "Weakened vs expectation";
  return "Confirmed as expected";
}

/* ===================== RAI ===================== */
/**
 * REAL comparative RAI (A − B)
 * proxy: recent net points / game (last 3)
 */
function computeComparativeRAI(
  A: { name: string; net3: number },
  B: { name: string; net3: number }
) {
  const diff = A.net3 - B.net3;
  const delta = Math.round(diff);

  const edgeTeam = diff >= 0 ? A.name : B.name;

  const levers: RAILever[] = [
    {
      lever: "Early-down efficiency",
      advantage: diff >= 0 ? A.name : B.name,
      value: clamp(Math.round(diff * 0.6), -6, 6),
    },
    {
      lever: "Pass protection integrity",
      advantage: diff >= 0 ? A.name : B.name,
      value: clamp(Math.round(diff * 0.4), -4, 4),
    },
    {
      lever: "Coverage matchup stress",
      advantage: diff >= 0 ? B.name : A.name,
      value: clamp(Math.round(Math.abs(diff) * 0.5), 0, 5),
    },
  ];

  return {
    edgeTeam,
    delta: Math.abs(delta),
    levers,
  };
}

/* ===================== PAI ===================== */

function buildPAI(teamId: string, teamName: string, last: any) {
  const isHome = last.home.id === teamId;
  const forPts = isHome ? last.home.score : last.away.score;
  const agPts = isHome ? last.away.score : last.home.score;

  const lastScore =
    typeof forPts === "number" && typeof agPts === "number"
      ? `${forPts} – ${agPts}`
      : "—";

  if (typeof forPts !== "number" || typeof agPts !== "number") {
    return {
      team: teamName,
      lastScore,
      levers: [],
    };
  }

  const margin = forPts - agPts;

  const earlyDown = clamp((forPts - 24) / 7, -3, 3);
  const protection = clamp(margin / 7, -3, 3);
  const coverage = clamp((24 - agPts) / 7, -3, 3);

  const levers: PAILever[] = [
    {
      lever: "Early-down efficiency",
      value: Number(earlyDown.toFixed(2)),
      status: statusFromValue(earlyDown),
    },
    {
      lever: "Pass protection integrity",
      value: Number(protection.toFixed(2)),
      status: statusFromValue(protection),
    },
    {
      lever: "Coverage matchup stress",
      value: Number(coverage.toFixed(2)),
      status: statusFromValue(coverage),
    },
  ];

  return { team: teamName, lastScore, levers };
}

/* ===================== MAIN ===================== */

export async function buildNFLSnapshot(): Promise<{
  sport: string;
  updatedAt: string;
  matches: NFLMatchCard[];
}> {
  const entries: {
    team: TeamRef;
    last: any;
    net3: number;
  }[] = [];

  for (const team of NFL_TEAMS) {
    try {
      const last = await getLastGame("nfl", team.id);
      if (!last) continue;

      const recent = await getRecentGames("nfl", team.id, 3);
      let net = 0;
      let n = 0;

      for (const g of recent) {
        const isHome = g.home.id === team.id;
        const fp = isHome ? g.home.score : g.away.score;
        const ap = isHome ? g.away.score : g.home.score;
        if (typeof fp === "number" && typeof ap === "number") {
          net += fp - ap;
          n++;
        }
      }

      entries.push({
        team,
        last,
        net3: n ? net / n : 0,
      });
    } catch {}
  }

  const grouped: Record<string, typeof entries> = {};

  for (const e of entries) {
    const oppId =
      e.last.home.id === e.team.id ? e.last.away.id : e.last.home.id;
    if (!oppId) continue;

    const key = matchKey(e.last.dateUtc, e.team.id, oppId);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  }

  const matches: NFLMatchCard[] = [];

  for (const pair of Object.values(grouped)) {
    if (pair.length !== 2) continue;

    const A = pair[0];
    const B = pair[1];

    const hs = A.last.home.score;
    const as = A.last.away.score;

    const finalScore =
      typeof hs === "number" && typeof as === "number"
        ? `${hs} – ${as}`
        : "—";

    const rai = computeComparativeRAI(
      { name: A.team.name, net3: A.net3 },
      { name: B.team.name, net3: B.net3 }
    );

    const paiA = buildPAI(A.team.id, A.team.name, A.last);
    const paiB = buildPAI(B.team.id, B.team.name, B.last);

    matches.push({
      match: `${A.last.home.name} vs ${A.last.away.name}`,
      finalScore,
      dateUtc: A.last.dateUtc,
      pregame: rai,
      postgame: {
        teams: [paiA, paiB],
        conclusion:
          "Outcome interpreted through execution deltas relative to pregame structural expectations.",
      },
    });
  }

  return {
    sport: "NFL",
    updatedAt: new Date().toISOString(),
    matches,
  };
          }
