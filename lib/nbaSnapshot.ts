import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

export async function buildNBASnapshot() {
  const snapshot = [];

  for (const team of NBA_TEAMS) {
    try {
      const { last, next } = await getLastAndNextGame("nba", team.id);

      snapshot.push({
        team,
        lastGame: last,
        nextGame: next,

        rai: {
          value: 54,
          topLevers: [
            {
              lever: "Offensive spacing coherence",
              contribution: 14,
              rationale:
                "Stable role distribution and half-court spacing structure"
            },
            {
              lever: "Defensive scheme continuity",
              contribution: 9,
              rationale:
                "Low tactical variability across recent games"
            },
            {
              lever: "PnR matchup stress",
              contribution: -11,
              rationale:
                "Opponent pick-and-roll profile induces coverage strain"
            }
          ]
        },

        pai: last
          ? {
              value: 40,
              topLevers: [
                {
                  lever: "Half-court execution efficiency",
                  contribution: -18,
                  rationale:
                    "Set execution degraded under defensive pressure"
                },
                {
                  lever: "Defensive rotation latency",
                  contribution: -12,
                  rationale:
                    "Late help and close-outs observed repeatedly"
                },
                {
                  lever: "Shot quality creation",
                  contribution: 7,
                  rationale:
                    "Shot profile remained acceptable"
                }
              ]
            }
          : null
      });
    } catch {
      // skip team if ESPN error
    }
  }

  return {
    sport: "NBA",
    updatedAt: new Date().toISOString(),
    snapshot
  };
}
