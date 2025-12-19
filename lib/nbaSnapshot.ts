import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame, getRecentGames } from "@/lib/providers/espn";

function daysBetween(aUtc: string, bUtc: string) {
  const a = new Date(aUtc).getTime();
  const b = new Date(bUtc).getTime();
  return (b - a) / (1000 * 60 * 60 * 24);
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

// calcule une “forme récente” réelle à partir des N derniers matchs
function computeFormFromRecent(teamId: string, recent: any[]) {
  // Net points = pointsFor - pointsAgainst sur N matchs
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

  const netPerGame = played ? net / played : 0;
  return { netPerGame, played };
}

// RAI “réel” = combinaison de features observables
function computeRAI(teamName: string, teamId: string, oppName: string, oppId: string, ctx: {
  restDays: number;
  isHomeNext: boolean;
  recentTeam: { netPerGame: number; played: number };
  recentOpp: { netPerGame: number; played: number };
}) {
  // Features (toutes réelles / observables)
  const restEdge = clamp((ctx.restDays - 2) / 2, -1.5, 1.5); // >0 = bien reposé
  const homeEdge = ctx.isHomeNext ? 0.4 : -0.4; // petit effet domicile
  const formEdge = clamp((ctx.recentTeam.netPerGame - ctx.recentOpp.netPerGame) / 6, -2, 2); // diff net rating proxy

  // Score global (pondéré)
  const total = 1.1 * formEdge + 0.8 * restEdge + 0.5 * homeEdge;

  // Leviers signés (interprétables)
  const levers = [
    { lever: "Recent form (net pts/game)", value: 1.1 * formEdge },
    { lever: "Rest advantage", value: 0.8 * restEdge },
    { lever: "Home/Away context", value: 0.5 * homeEdge },
  ];

  return { total, levers, teamName, oppName };
}

export async function buildNBASnapshot() {
  // 1) construire les “next matchups” par paire (A/B) à partir de nextGame
  const upcomingByPair: Record<string, any[]> = {};

  for (const team of NBA_TEAMS) {
    const { last, next } = await getLastAndNextGame("nba", team.id);
    if (!last || !next) continue;

    // opponent dans le NEXT (pregame)
    const isHomeNext = next.home.id === team.id;
    const oppNext = isHomeNext ? next.away : next.home;

    if (!oppNext?.id || oppNext.id === team.id) continue;

    // clé paire stable A/B
    const key = [team.id, oppNext.id].sort().join("-");
    if (!upcomingByPair[key]) upcomingByPair[key] = [];
    upcomingByPair[key].push({
      team,
      last,
      next,
      oppId: oppNext.id,
      oppName: oppNext.name,
      isHomeNext,
    });
  }

  // 2) ne garder que les paires complètes (A et B présents)
  const pairs = Object.values(upcomingByPair).filter((arr) => arr.length === 2);

  const snapshot: any[] = [];

  for (const pair of pairs) {
    const A = pair[0];
    const B = pair[1];

    // sécurité : s’assurer qu’ils se pointent l’un l’autre
    if (A.oppId !== B.team.id || B.oppId !== A.team.id) continue;

    // recent games réels pour forme
    const recentA = await getRecentGames("nba", A.team.id, 5);
    const recentB = await getRecentGames("nba", B.team.id, 5);

    const formA = computeFormFromRecent(A.team.id, recentA);
    const formB = computeFormFromRecent(B.team.id, recentB);

    // repos réel = jours entre last et next
    const restA = daysBetween(A.last.dateUtc, A.next.dateUtc);
    const restB = daysBetween(B.last.dateUtc, B.next.dateUtc);

    // RAI réels (observables)
    const raiA = computeRAI(A.team.name, A.team.id, B.team.name, B.team.id, {
      restDays: restA,
      isHomeNext: A.isHomeNext,
      recentTeam: formA,
      recentOpp: formB,
    });

    const raiB = computeRAI(B.team.name, B.team.id, A.team.name, A.team.id, {
      restDays: restB,
      isHomeNext: B.isHomeNext,
      recentTeam: formB,
      recentOpp: formA,
    });

    // delta comparatif réel
    const delta = raiA.total - raiB.total;
    const favoredTeam = delta >= 0 ? A.team.name : B.team.name;

    // levers comparatifs = (levierA - levierB)
    const comparativeLevers = raiA.levers.map((l, i) => ({
      lever: l.lever,
      value: l.value - raiB.levers[i].value,
    }));

    // PAI (last game only) : outcome + marge, pas d’invention
    function buildPAI(teamId: string, last: any) {
      const isHome = last.home.id === teamId;
      const forPts = isHome ? last.home.score : last.away.score;
      const agPts = isHome ? last.away.score : last.home.score;

      if (forPts == null || agPts == null) {
        return {
          levers: [{ lever: "Data completeness", status: "Missing score data" }],
          conclusion: "Unable to assess postgame execution (missing score).",
        };
      }

      const margin = forPts - agPts;

      const levers = [
        {
          lever: "Result",
          status: margin > 0 ? "Win" : "Loss",
        },
        {
          lever: "Margin",
          status:
            margin >= 10 ? "Comfortable" : margin <= -10 ? "Blowout" : "Close",
        },
        {
          lever: "Execution vs baseline",
          status: margin > 0 ? "Above baseline" : "Below baseline",
        },
      ];

      const conclusion =
        margin > 0
          ? "Postgame execution sufficient to secure the win."
          : "Postgame execution insufficient; key levers likely underperformed.";

      return { levers, conclusion };
    }

    snapshot.push({
      matchup: `${A.team.name} vs ${B.team.name}`,
      nextGameUtc: A.next.dateUtc,

      pregameRAI: {
        delta,
        favoredTeam,
        levers: comparativeLevers,
        notes: {
          A_restDays: restA,
          B_restDays: restB,
          A_netPtsPerGame_last5: formA.netPerGame,
          B_netPtsPerGame_last5: formB.netPerGame,
          A_homeNext: A.isHomeNext,
          B_homeNext: B.isHomeNext,
        },
      },

      postgamePAI: {
        A: {
          team: A.team.name,
          lastScore:
            A.last.home.score != null && A.last.away.score != null
              ? `${A.last.home.score} – ${A.last.away.score}`
              : "—",
          ...buildPAI(A.team.id, A.last),
        },
        B: {
          team: B.team.name,
          lastScore:
            B.last.home.score != null && B.last.away.score != null
              ? `${B.last.home.score} – ${B.last.away.score}`
              : "—",
          ...buildPAI(B.team.id, B.last),
        },
      },
    });
  }

  // tri : plus proche next game d’abord
  snapshot.sort(
    (x, y) =>
      new Date(x.nextGameUtc).getTime() - new Date(y.nextGameUtc).getTime()
  );

  return {
    sport: "NBA",
    updatedAt: new Date().toISOString(),
    snapshot,
  };
        }
