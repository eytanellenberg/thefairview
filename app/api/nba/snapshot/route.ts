import { NextResponse } from "next/server";
import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

/**
 * NBA Snapshot
 * Updated periodically (ISR)
 * FAIR-Sport static view
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

        // FAIR-Sport proxies (static snapshot)
        rai: {
          value: 54,
          topLevers: [
            {
              lever: "Offensive spacing coherence",
              contribution: 14,
              rationale: "Stable role distribution and half-court structure"
            },
            {
              lever: "Defensive scheme continuity",
              contribution: 9,
              rationale: "Limited tactical volatility in recent games"
            },
            {
              lever: "PnR matchup stress",
              contribution: -11,
              rationale: "Opponent PnR profile induces coverage strain"
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
                  rationale: "Set execution degraded under pressure"
                },
                {
                  lever: "Defensive rotation latency",
                  contribution: -12,
                  rationale: "Late help and close-outs observed"
                },
                {
                  lever: "Shot quality creation",
                  contribution: 7,
                  rationale: "Shot profile remained acceptable"
                }
              ]
            }
          : null
      });
    } catch {
      // skip team on error
    }
  }

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    sport: "NBA",
    snapshot
  });
}
