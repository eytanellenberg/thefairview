import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

export async function buildNBASnapshot() {
  const snapshot: any[] = [];

  for (const team of NBA_TEAMS) {
    try {
      const { last, next } = await getLastAndNextGame("nba", team.id);

      snapshot.push({
        team,

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
                  : last.home.name
            }
          : null,

        nextGame: next
          ? {
              dateUtc: next.dateUtc,
              opponent:
                next.home.id === team.id
                  ? next.away.name
                  : next.home.name
            }
          : null,

        // 🔴 POSTGAME — PAI
        comparativePAI: last
          ? {
              value: 48,
              observedLevers: [
                {
                  lever: "Offensive spacing coherence",
                  contribution: -6,
                  rationale:
                    "Observed execution relative to pre-game structural expectation"
                },
                {
                  lever: "Defensive scheme continuity",
                  contribution: -2,
                  rationale:
                    "Observed execution relative to pre-game structural expectation"
                },
                {
                  lever: "PnR matchup stress",
                  contribution: 1,
                  rationale:
                    "Observed execution relative to pre-game structural expectation"
                }
              ]
            }
          : null,

        // 🔵 PREGAME — RAI
        comparativeRAI: next
          ? {
              value: 52,
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
              ]
            }
          : null
      });
    } catch {
      // skip team on ESPN error
    }
  }

  return {
    sport: "NBA",
    updatedAt: new Date().toISOString(),
    snapshot
  };
}
