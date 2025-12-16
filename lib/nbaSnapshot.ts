import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

type Lever = {
  lever: string;
  contribution: number;
  rationale: string;
  status?: "expected" | "stronger" | "weaker" | "new";
};

export async function buildNBASnapshot() {
  const snapshot = [];

  for (const team of NBA_TEAMS) {
    try {
      const { last, next } = await getLastAndNextGame("nba", team.id);

      /* =========================
         COMPARATIVE READINESS (RAI)
         ========================= */

      const comparativeRAI = {
        value: 51,
        expectedLevers: [
          {
            lever: "Offensive spacing coherence",
            contribution: 14,
            rationale:
              "Stable role distribution and half-court spacing structure",
            status: "expected"
          },
          {
            lever: "Defensive scheme continuity",
            contribution: 9,
            rationale:
              "Low tactical variability across recent games",
            status: "expected"
          },
          {
            lever: "PnR matchup stress",
            contribution: -11,
            rationale:
              "Opponent pick-and-roll profile induces coverage strain",
            status: "expected"
          }
        ],
        summary:
          "Slight structural edge expected, with pick-and-roll coverage identified as the primary risk factor."
      };

      /* =========================
         COMPARATIVE EXECUTION (PAI)
         ========================= */

      let comparativePAI = null;

      if (last) {
        const observedLevers: Lever[] = [
          {
            lever: "Half-court execution efficiency",
            contribution: -18,
            rationale:
              "Set execution degraded under defensive pressure",
            status: "weaker"
          },
          {
            lever: "Defensive rotation latency",
            contribution: -12,
            rationale:
              "Late help and close-outs observed repeatedly",
            status: "new"
          },
          {
            lever: "Shot quality creation",
            contribution: 7,
            rationale:
              "Shot profile remained acceptable",
            status: "expected"
          }
        ];

        comparativePAI = {
          value: 37,
          observedLevers,
          summary:
            "Win achieved despite weak structural execution. Shot creation held, while half-court execution under pressure collapsed.",
          delta: {
            confirmed: observedLevers.filter(
              l =>
                l.lever === "Shot quality creation" &&
                l.status === "expected"
            ),
            weakerThanExpected: observedLevers.filter(
              l => l.status === "weaker"
            ),
            emergent: observedLevers.filter(
              l => l.status === "new"
            )
          }
        };
      }

      snapshot.push({
        team,
        lastGame: last,
        nextGame: next,
        comparativeRAI,
        comparativePAI
      });
    } catch {
      // Skip team if ESPN error
    }
  }

  return {
    sport: "NBA",
    updatedAt: new Date().toISOString(),
    snapshot
  };
}
