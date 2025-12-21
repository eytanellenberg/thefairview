import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import {
  getLastAndNextGame,
  getRecentGames,
} from "@/lib/providers/espn";

/* ---------- utils ---------- */

function daysBetween(aUtc: string, bUtc: string) {
  const a = new Date(aUtc).getTime();
  const b = new Date(bUtc).getTime();
  return (b - a) / (1000 * 60 * 60 * 24);
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

/* ---------- RECENT FORM (REAL) ---------- */

function computeFormFromRecent(teamId: string, recent: any[]) {
  let net = 0;
  let played = 0;

  for (const g of recent) {
    const isHome = g.home.id === teamId;
    const forPts = isHome ? g.home.score : g.away.score;
    const agPts = isHome ? g.away.score : g.home.score;

    if (forPts == null || agPts == null) continue;
    played += 1;
    net += forPts - agPts;
  }

  return {
    netPerGame: played ? net / played : 0,
    played,
  };
}

/* ---------- RAI (REAL, OBSERVABLE) ---------- */

function computeRAI(ctx: {
  restDays: number;
  isHomeNext: boolean;
  formTeam: number;
  formOpp: number;
}) {
  const restEdge = clamp((ctx.restDays - 2) / 2, -1.5, 1.5);
  const homeEdge = ctx.isHomeNext ? 0.4 : -0.4;
  const formEdge = clamp((ctx.formTeam - ctx.formOpp) / 6, -2, 2);

  const total = 1.1 * formEdge + 0.8 * restEdge + 0.5 * homeEdge;

  return {
    total,
    levers: [
      { lever: "Recent form (net pts/game)", value: 1.1 * formEdge },
      { lever: "Rest advantage", value: 0.8 * restEdge },
      { lever: "Home/Away context", value: 0.5 * homeEdge },
    ],
  };
}

/* ---------- PAI (LAST GAME, TEAM-SPECIFIC) ---------- */

function buildPAI(teamId: string, last: any) {
  const isHome = last.home.id === teamId;
  const forPts = isHome ? last.home.score : last.away.score;
  const agPts = isHome ? last.away.score : last.home.score;

  if (forPts == null || agPts == null) {
    return {
      lastScore: "—",
      levers: [{ lever: "Data", status: "Missing score" }],
      conclusion: "Postgame execution not assessable (missing data).",
    };
  }

  const margin = forPts - agPts;

  return {
    lastScore: `${forPts} – ${agPts}`,
    levers: [
      { lever: "Result", status: margin > 0 ? "Win" : "Loss" },
      {
        lever: "Margin",
        status:
          margin >= 10
            ? "Comfortable"
            : margin <= -10
            ? "Blowout"
            : "Close",
      },
      {
        lever: "Execution vs baseline",
        status: margin > 0 ? "Above baseline" : "Below baseline",
      },
    ],
    conclusion:
      margin > 0
        ? "Postgame execution sufficient to secure the result."
        : "Postgame execution insufficient relative to baseline.",
  };
}

/* ---------- SNAPSHOT ---------- */

export async function buildNBASnapshot() {
  const upcoming: Record<string, any[]> = {};

  for (const team of NBA_TEAMS) {
    const { last, next } = await getLastAndNextGame("nba", team.id);
    if (!last || !next) continue;

    const isHomeNext = next.home.id === team.id;
    const opp = isHomeNext ? next.away : next.home;
    if (!opp?.id || opp.id === team.id) continue;

    const key = [team.id, opp.id].sort().join("-");
    if (!upcoming[key]) upcoming[key] = [];
    upcoming[key].push({ team, last, next, oppId: opp.id, isHomeNext });
  }

  const snapshot: any[] = [];

  for (const pair of Object.values(upcoming)) {
    if (pair.length !== 2) continue;

    const A = pair[0];
    const B = pair[1];
    if (A.oppId !== B.team.id) continue;

    const recentA = await getRecentGames("nba", A.team.id, 5);
    const recentB = await getRecentGames("nba", B.team.id, 5);

    const formA = computeFormFromRecent(A.team.id, recentA);
    const formB = computeFormFromRecent(B.team.id, recentB);

    const raiA = computeRAI({
      restDays: daysBetween(A.last.dateUtc, A.next.dateUtc),
      isHomeNext: A.isHomeNext,
      formTeam: formA.netPerGame,
      formOpp: formB.netPerGame,
    });

    const raiB = computeRAI({
      restDays: daysBetween(B.last.dateUtc, B.next.dateUtc),
      isHomeNext: B.isHomeNext,
      formTeam: formB.netPerGame,
      formOpp: formA.netPerGame,
    });

    const delta = raiA.total - raiB.total;
    const favoredTeam = delta >= 0 ? A.team.name : B.team.name;

    snapshot.push({
      matchup: `${A.team.name} vs ${B.team.name}`,
      nextGameUtc: A.next.dateUtc,

      pregameRAI: {
        delta,
        favoredTeam,
        levers: raiA.levers.map((l, i) => ({
          lever: l.lever,
          value: l.value - raiB.levers[i].value,
        })),
      },

      postgamePAI: {
        note:
          "PAI is assessed on each team's own last game (not necessarily the same match).",
        A: { team: A.team.name, ...buildPAI(A.team.id, A.last) },
        B: { team: B.team.name, ...buildPAI(B.team.id, B.last) },
      },
    });
  }

  snapshot.sort(
    (a, b) =>
      new Date(a.nextGameUtc).getTime() -
      new Date(b.nextGameUtc).getTime()
  );

  return {
    sport: "NBA",
    updatedAt: new Date().toISOString(),
    snapshot,
  };
}
