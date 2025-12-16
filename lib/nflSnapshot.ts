import { NFL_TEAMS } from "@/lib/data/nflTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

export async function buildNFLSnapshot() {
  const snapshot: any[] = [];

  for (const team of NFL_TEAMS) {
    try {
      const { last, next } = await getLastAndNextGame("nfl", team.id);

      const opponentName =
        last
          ? last.home.id === team.id
            ? last.away.name
            : last.home.name
          : next
          ? next.home.id === team.id
            ? next.away.name
            : next.home.name
          : "Unknown";

      snapshot.push({
        team: {
          id: team.id,
          name: team.name,
        },

        // --------------------
        // LAST GAME
        // --------------------
        lastGame: last
          ? {
              dateUtc: last.dateUtc,
              score:
                last.home.id === team.id
                  ? `${last.home.score} – ${last.away.score}`
                  : `${last.away.score} – ${last.home.score}`,
              opponent: opponentName,
              opponentId:
                last.home.id === team.id
                  ? last.away.id
                  : last.home.id,
            }
          : null,

        // --------------------
        // PRE-GAME — RAI (comparative)
        // --------------------
        comparativeRAI: next
          ? {
              delta: 4,
              edgeTeam: team.name,
              levers: [
                {
                  lever: "Early-down efficiency",
                  advantage: team.name,
                  value: 3,
                },
                {
                  lever: "Pass protection integrity",
                  advantage: team.name,
                  value: 2,
                },
                {
                  lever: "Coverage matchup stress",
                  advantage: opponentName,
                  value: 5,
                },
              ],
              interpretation:
                "Small structural edge expected, driven by early-down control and pass protection.",
            }
          : null,

        // --------------------
        // POST-GAME — PAI (verification)
        // --------------------
        comparativePAI: last
          ? {
              levers: [
                {
                  lever: "Early-down efficiency",
                  status: "Confirmed as expected",
                },
                {
                  lever: "Pass protection integrity",
                  status: "Weakened vs expectation",
                },
                {
                  lever: "Coverage matchup stress",
                  status: "Outperformed vs expectation",
                },
              ],
              conclusion:
                "Outcome aligned with pregame structural expectations, with secondary deviations in protection.",
            }
          : null,
      });
    } catch {
      // skip team if ESPN error
    }
  }

  return {
    sport: "NFL",
    updatedAt: new Date().toISOString(),
    snapshot,
  };
}
