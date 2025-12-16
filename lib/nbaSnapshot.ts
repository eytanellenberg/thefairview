import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

import { computeLeverDelta } from "@/lib/domain/leverDelta";

/**
 * Types locaux simples
 */
type Lever = {
  lever: string;
  contribution: number;
  rationale: string;
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
        ];

        // 🔑 HERE IS THE LINE YOU ASKED ABOUT
        const observedLeversWithStatus = computeLeverDelta(
          comparativeRAI.expectedLevers,
          observedLevers
        );

        comparativePAI = {
          value: 37,
          observedLevers: observedLeversWithStatus,
          summary:
            "Win achieved despite weak structural execution. Shot creation held, while half-court execution under pressure collapsed.",
          delta: {
            confirmed: observedLeversWithStatus.filter(
              l => l.status === "expected"
            ),
            strongerThanExpected: observedLeversWithStatus.filter(
              l => l.status === "stronger"
            ),
            weakerThanExpected: observedLeversWithStatus.filter(
              l => l.status === "weaker"
            ),
            emergent: observedLeversWithStatus.filter(
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
