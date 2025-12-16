import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

export async function buildNBASnapshot() {
  const snapshot: any[] = [];

  for (const team of NBA_TEAMS) {
    try {
      const { last, next } = await getLastAndNextGame("nba", team.id);

      snapshot.push({
        team: {
          id: team.id,
          name: team.name,
        },

        lastGame: last
          ? {
              dateUtc: last.dateUtc,
              score:
                last.home.id === team.id
                  ? `${last.home.score} – ${last.away.score}`
                  : `${last.away.score} – ${last.home.score}`,
              opponent:
                last.home.id === team.id
                  ? last.away.name
                  : last.home.name,
              opponentId:
                last.home.id === team.id
                  ? last.away.id
                  : last.home.id,
            }
          : null,

        // 🔵 PREGAME — Comparative RAI (FREE proxy)
        comparativeRAI: next
          ? {
              delta: 3, // oriented edge (FREE placeholder)
              edgeTeam: team.name,
              levers: [
                {
                  lever: "Offensive spacing",
                  advantage: team.name,
                  value: 2,
                },
                {
                  lever: "Shot quality creation",
                  advantage: team.name,
                  value: 3,
                },
                {
                  lever: "PnR matchup stress",
                  advantage: "Opponent",
                  value: 6,
                },
              ],
              interpretation:
                "Slight structural edge expected based on offensive organization and shot profile.",
            }
          : null,

        // 🔴 POSTGAME — Comparative PAI (observed vs expectation)
        comparativePAI: last
          ? {
              levers: [
                {
                  lever: "Offensive spacing",
                  status: "Weakened vs expectation",
                },
                {
                  lever: "Shot quality creation",
                  status: "Weakened vs expectation",
                },
                {
                  lever: "PnR matchup stress",
                  status: "Confirmed as expected",
                },
              ],
              conclusion:
                "Victory achieved despite weaker-than-expected offensive execution.",
            }
          : null,
      });
    } catch {
      // skip team on ESPN error
    }
  }

  return {
    sport: "NBA",
    updatedAt: new Date().toISOString(),
    snapshot,
  };
}
