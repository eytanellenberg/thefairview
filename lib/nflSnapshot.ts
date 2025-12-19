import { getLastGame, getRecentGames } from "@/lib/providers/espn";

/* ===================== TYPES ===================== */

type TeamRef = { id: string };

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
/**
 * ✅ Important: only IDs here.
 * Names come from ESPN game object (home/away) to avoid mismatches.
 */
const NFL_TEAMS: TeamRef[] = [
  { id: "1" },
  { id: "2" },
  { id: "3" },
  { id: "4" },
  { id: "5" },
  { id: "6" },
  { id: "7" },
  { id: "8" },
  { id: "9" },
  { id: "10" },
  { id: "11" },
  { id: "12" },
  { id: "13" },
  { id: "14" },
  { id: "15" },
  { id: "16" },
  { id: "17" },
  { id: "18" },
  { id: "19" },
  { id: "20" },
  { id: "21" },
  { id: "22" },
  { id: "23" },
  { id: "24" },
  { id: "25" },
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
 * ✅ Clamp delta to keep it readable.
 */
function computeComparativeRAI(
  A: { name: string; net3: number },
  B: { name: string; net3: number }
) {
  const diff = A.net3 - B.net3;

  // readable delta
  const rawDelta = Math.round(diff);
  const delta = clamp(Math.abs(rawDelta), 0, 12);

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

  return { edgeTeam, delta, levers };
}

/* ===================== PAI ===================== */
/**
 * PAI numeric deltas from last game only:
 * baseline points = 24 (NFL-lite)
 */
function buildPAI(teamId: string, teamName: string, last: any) {
  const isHome = last.home.id === teamId;
  const forPts = isHome ? last.home.score : last.away.score;
  const agPts = isHome ? last.away.score : last.home.score;

  const lastScore =
    typeof forPts === "number" && typeof agPts === "number"
      ? `${forPts} – ${agPts}`
      : "—";

  if (typeof forPts !== "number" || typeof agPts !== "number") {
    return { team: teamName, lastScore, levers: [] as PAILever[] };
  }

  const margin = forPts - agPts;

  const earlyDown = clamp((forPts - 24) / 7, -3, 3);
  const protection = clamp(margin / 7, -3, 3);
  const coverage = clamp((24 - agPts) / 7, -3, 3);

  const levers: PAILever[] = [
    { lever: "Early-down efficiency", value: Number(earlyDown.toFixed(2)), status: statusFromValue(earlyDown) },
    { lever: "Pass protection integrity", value: Number(protection.toFixed(2)), status: statusFromValue(protection) },
    { lever: "Coverage matchup stress", value: Number(coverage.toFixed(2)), status: statusFromValue(coverage) },
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
    teamId: string;
    teamName: string; // ✅ from ESPN game
    last: any;
    net3: number;
  }[] = [];

  for (const t of NFL_TEAMS) {
    try {
      const last = await getLastGame("nfl", t.id);
      if (!last) continue;

      // ✅ derive teamName from the last game object
      const isHome = last.home.id === t.id;
      const teamName = isHome ? last.home.name : last.away.name;

      const recent = await getRecentGames("nfl", t.id, 3);
      let net = 0;
      let n = 0;

      for (const g of recent) {
        const home = g.home.id === t.id;
        const fp = home ? g.home.score : g.away.score;
        const ap = home ? g.away.score : g.home.score;
        if (typeof fp === "number" && typeof ap === "number") {
          net += fp - ap;
          n++;
        }
      }

      entries.push({
        teamId: t.id,
        teamName,
        last,
        net3: n ? net / n : 0,
      });
    } catch {}
  }

  // group by match
  const grouped: Record<string, typeof entries> = {};
  for (const e of entries) {
    const oppId = e.last.home.id === e.teamId ? e.last.away.id : e.last.home.id;
    if (!oppId) continue;

    const key = matchKey(e.last.dateUtc, e.teamId, oppId);
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
      typeof hs === "number" && typeof as === "number" ? `${hs} – ${as}` : "—";

    // ✅ Get correct A/B names for the matchup from ESPN home/away
    const homeId = A.last.home.id;
    const awayId = A.last.away.id;

    const homeName = A.last.home.name;
    const awayName = A.last.away.name;

    // Identify which entry corresponds to home/away in this grouped pair
    const entryHome = pair.find((x) => x.teamId === homeId) ?? pair[0];
    const entryAway = pair.find((x) => x.teamId === awayId) ?? pair[1];

    const rai = computeComparativeRAI(
      { name: entryHome.teamName, net3: entryHome.net3 },
      { name: entryAway.teamName, net3: entryAway.net3 }
    );

    const paiHome = buildPAI(entryHome.teamId, entryHome.teamName, entryHome.last);
    const paiAway = buildPAI(entryAway.teamId, entryAway.teamName, entryAway.last);

    matches.push({
      match: `${homeName} vs ${awayName}`,
      finalScore,
      dateUtc: A.last.dateUtc,
      pregame: rai,
      postgame: {
        teams: [paiHome, paiAway],
        conclusion:
          "Outcome interpreted through execution deltas relative to pregame structural expectations.",
      },
    });
  }

  // newest first
  matches.sort((a, b) => new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime());

  return {
    sport: "NFL",
    updatedAt: new Date().toISOString(),
    matches,
  };
    }
