import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastGame } from "@/lib/providers/espn";

type TeamGame = {
  teamId: string;
  teamName: string;
  opponentId: string;
  opponentName: string;
  scoreFor: number;
  scoreAgainst: number;
  dateUtc: string;
};

function buildRAI(teamId: string, opponentId: string) {
  // ⚠️ PROXY SIMPLE MAIS DIFFÉRENTIEL (à améliorer plus tard)
  const spacing = Math.random() * 2 - 1; // [-1 ; +1]
  const shotQuality = Math.random() * 2 - 1;
  const defensiveStress = Math.random() * 2 - 1;

  const total = spacing + shotQuality - defensiveStress;

  return {
    total,
    levers: [
      { lever: "Offensive spacing", value: spacing },
      { lever: "Shot quality creation", value: shotQuality },
      { lever: "Defensive matchup stress", value: -defensiveStress },
    ],
  };
}

export async function buildNBASnapshot() {
  const games: TeamGame[] = [];

  for (const team of NBA_TEAMS) {
    const last = await getLastGame("nba", team.id);
    if (!last) continue;

    const isHome = last.home.id === team.id;
    const teamScore = isHome ? last.home.score : last.away.score;
    const oppScore = isHome ? last.away.score : last.home.score;
    const opponent = isHome ? last.away : last.home;

    if (opponent.id === team.id) continue;

    games.push({
      teamId: team.id,
      teamName: team.name,
      opponentId: opponent.id,
      opponentName: opponent.name,
      scoreFor: teamScore,
      scoreAgainst: oppScore,
      dateUtc: last.dateUtc,
    });
  }

  // regrouper par match réel (A/B)
  const matches: Record<string, TeamGame[]> = {};
  for (const g of games) {
    const key = [g.teamId, g.opponentId].sort().join("-");
    if (!matches[key]) matches[key] = [];
    matches[key].push(g);
  }

  const snapshot = Object.values(matches)
    .filter(m => m.length === 2)
    .map(([A, B]) => {
      const raiA = buildRAI(A.teamId, B.teamId);
      const raiB = buildRAI(B.teamId, A.teamId);

      const delta = raiA.total - raiB.total;

      return {
        match: `${A.teamName} vs ${B.teamName}`,
        dateUtc: A.dateUtc,
        score: `${A.scoreFor} – ${B.scoreFor}`,

        rai: {
          delta,
          favoredTeam: delta > 0 ? A.teamName : B.teamName,
          levers: raiA.levers.map((l, i) => ({
            lever: l.lever,
            value: l.value - raiB.levers[i].value,
          })),
        },

        pai: {
          A: {
            team: A.teamName,
            execution:
              A.scoreFor > A.scoreAgainst
                ? "Above expectation"
                : "Below expectation",
          },
          B: {
            team: B.teamName,
            execution:
              B.scoreFor > B.scoreAgainst
                ? "Above expectation"
                : "Below expectation",
          },
        },
      };
    });

  return {
    updatedAt: new Date().toISOString(),
    snapshot,
  };
}
