import { NextResponse } from "next/server";
import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

/**
 * NBA FAIR-Sport snapshot
 * Static view updated periodically (ISR)
 */

export const revalidate = 6 * 60 * 60; // 6 hours

export async function GET() {
  const snapshot = [];

  for (const team of NBA_TEAMS) {
    try {
      const { last, next } = await getLastAndNextGame("nba", team.id);

      snapshot.push({
        team,
        lastGame: last,
        nextGame: next,

        // ---- RAI (PRE-GAME) — FAIR-Sport structural predictors
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

        // ---- PAI (POST-GAME) — FAIR-Sport observed execution
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
                    "Shot profile remained acceptable despite breakdowns"
                }
              ]
            }
          : null
      });
    } catch {
      // silently skip team on error
    }
  }

  return NextResponse.json({
    sport: "NBA",
    updatedAt: new Date().toISOString(),
    snapshot
  });
}
