    import { getLastGame, getRecentGames } from "@/lib/providers/espn";

type TeamRef = { id: string; name: string };

type RAILever = {
  lever: string;
  advantage: string;
  value: number;
};

type PAILever = {
  lever: string;
  value: number; // numeric delta
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

/**
 * IMPORTANT:
 * - This is FAIR-lite.
 * - We build "played matches" by pairing each team's LAST game.
 * - PAI numbers are computed only from last-game points for/against + margin (real).
 * - RAI uses recent net points/game (last 3) (real) as a simple pregame proxy.
 */

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
  { id: "26", name: "Jacksonville Jaguars" },
  { id: "27", name: "Houston Texans" },
  { id: "28", name: "Arizona Cardinals" },
  { id: "29", name: "Carolina Panthers" },
  { id: "30", name: "Baltimore Ravens" },
];

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function sign(n: number) {
  return n >= 0 ? "+" : "";
}

function matchKey(dateUtc: string, a: string, b: string) {
  return `${dateUtc}-${[a, b].sort().join("-")}`;
}

function computeNetPerGame(teamId: string, recent: any[]) {
  let net = 0;
  let n = 0;

  for (const g of recent) {
    const isHome = g.home.id === teamId;
    const forPts = isHome ? g.home.score : g.away.score;
    const agPts = isHome ? g.away.score : g.home.score;

    if (typeof forPts !== "number" || typeof agPts !== "number") continue;
    net += forPts - agPts;
    n += 1;
  }

  return n ? net / n : 0;
}

// RAI = simple structural proxy from recent net points/game (last 3)
function computeComparativeRAI(
  teamA: { id: string; name: string; net3: number },
  teamB: { id: string; name: string; net3: number }
) {
  // Scale to something readable
  const formEdge = clamp(teamA.net3 - teamB.net3, -10, 10); // points/game edge
  const delta = Math.round(formEdge); // integer like your NFL +4 style

  const edgeTeam = delta >= 0 ? teamA.name : teamB.name;

  const levers: RAILever[] = [
    {
      lever: "Early-down efficiency",
      advantage: delta >= 0 ? teamA.name : teamB.name,
      value: clamp(Math.round(delta * 0.6), -6, 6),
    },
    {
      lever: "Pass protection integrity",
      advantage: delta >= 0 ? teamA.name : teamB.name,
      value: clamp(Math.round(delta * 0.4), -4, 4),
    },
    {
      lever: "Coverage matchup stress",
      advantage: delta >= 0 ? teamB.name : teamA.name,
      value: clamp(Math.round(Math.abs(delta) * 0.5), 0, 5),
    },
  ];

  return {
    edgeTeam,
    delta: Math.abs(delta),
    levers,
  };
}

function statusFromValue(v: number): PAILever["status"] {
  if (v >= 1.0) return "Outperformed vs expectation";
  if (v <= -1.0) return "Weakened vs expectation";
  return "Confirmed as expected";
}

/**
 * PAI numeric deltas (real, from last game only):
 * - Early-down efficiency proxy: (pointsFor - 24) / 7  (clamped)
 * - Pass protection integrity proxy: margin / 7 (clamped)
 * - Coverage matchup stress proxy: (24 - pointsAgainst) / 7 (clamped)
 *
 * Baseline 24 is a simple NFL-lite reference point.
 */
function buildPAIFromLastGame(teamId: string, teamName: string, last: any) {
  const isHome = last.home.id === teamId;
  const forPts = isHome ? last.home.score : last.away.score;
  const agPts = isHome ? last.away.score : last.home.score;

  const safeFor = typeof forPts === "number" ? forPts : null;
  const safeAg = typeof agPts === "number" ? agPts : null;

  const lastScore =
    safeFor == null || safeAg == null ? "—" : `${safeFor} – ${safeAg}`;

  if (safeFor == null || safeAg == null) {
    const levers: PAILever[] = [
      { lever: "Early-down efficiency", value: 0, status: "Confirmed as expected" },
      { lever: "Pass protection integrity", value: 0, status: "Confirmed as expected" },
      { lever: "Coverage matchup stress", value: 0, status: "Confirmed as expected" },
    ];
    return { team: teamName, lastScore, levers };
  }

  const margin = safeFor - safeAg;

  const earlyDown = clamp((safeFor - 24) / 7, -3, 3);
  const protection = clamp(margin / 7, -3, 3);
  const coverage = clamp((24 - safeAg) / 7, -3, 3);

  const levers: PAILever[] = [
    { lever: "Early-down efficiency", value: Number(earlyDown.toFixed(2)), status: statusFromValue(earlyDown) },
    { lever: "Pass protection integrity", value: Number(protection.toFixed(2)), status: statusFromValue(protection) },
    { lever: "Coverage matchup stress", value: Number(coverage.toFixed(2)), status: statusFromValue(coverage) },
  ];

  return { team: teamName, lastScore, levers };
}

function summarizeConclusion(paiA: { levers: PAILever[] }, paiB: { levers: PAILever[] }, raiEdgeTeam: string) {
  const scoreA = paiA.levers.reduce((s, l) => s + l.value, 0);
  const scoreB = paiB.levers.reduce((s, l) => s + l.value, 0);
  const betterPAI = scoreA >= scoreB ? "Team A" : "Team B";

  // Keep it short like your style
  return `Outcome interpreted via execution deltas (PAI). Structural edge pregame pointed to ${raiEdgeTeam}; postgame signals suggest ${betterPAI} executed better vs baseline.`;
}

export async function buildNFLSnapshot(): Promise<{
  sport: string;
  updatedAt: string;
  matches: NFLMatchCard[];
}> {
  try {
    const entries: {
      team: TeamRef;
      last: any;
      net3: number;
    }[] = [];

    // 1) Gather last games + recent form (last 3)
    for (const team of NFL_TEAMS) {
      try {
        const last = await getLastGame("nfl", team.id);
        if (!last) continue;

        const recent = await getRecentGames("nfl", team.id, 3);
        const net3 = computeNetPerGame(team.id, recent);

        // Must have opponent id to pair
        const oppId = last.home.id === team.id ? last.away.id : last.home.id;
        if (!oppId) continue;

        entries.push({ team, last, net3 });
      } catch {
        // skip team on ESPN error
      }
    }

    // 2) Group by actual match key (date + sorted ids)
    const grouped: Record<string, typeof entries> = {};

    for (const e of entries) {
      const teamId = e.team.id;
      const oppId = e.last.home.id === teamId ? e.last.away.id : e.last.home.id;
      if (!oppId) continue;

      const key = matchKey(e.last.dateUtc, teamId, oppId);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    }

    // 3) Build match cards when we have exactly 2 sides
    const cards: NFLMatchCard[] = [];

    for (const pair of Object.values(grouped)) {
      if (pair.length !== 2) continue;

      const A = pair[0];
      const B = pair[1];

      // Build final score from "match view": show home-away once (not team-oriented)
      const homeName = A.last.home.name;
      const awayName = A.last.away.name;

      const hs = A.last.home.score;
      const as = A.last.away.score;

      const finalScore =
        typeof hs === "number" && typeof as === "number" ? `${hs} – ${as}` : "—";

      // RAI comparative
      const rai = computeComparative
