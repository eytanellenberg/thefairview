import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";
import { computeLeverDelta } from "@/lib/domain/leverDelta";

export async function buildNBASnapshot() {
  const snapshot: any[] = [];

  for (const team of NBA_TEAMS) {
    try {
      const { last, next } = await getLastAndNextGame("nba", team.id);

      // --------------------
      // RAI — PREGAME LEVERS
      // --------------------
      const expectedLevers = next
        ? [
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
        : null;

      // --------------------
      // PAI — OBSERVED LEVERS
      // --------------------
      const observedLevers = last
        ? [
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
        : null;

      snapshot.push({
        team,

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
              opponent:
                last.home.id === team.id
                  ? last.away.name
                  : last.home.name,
              opponentId:
                last.home.id === team.id
                  ? last.away.id
                  : last.home.id
            }
          : null,

        // --------------------
        // NEXT GAME
        // --------------------
        nextGame: next
          ? {
              dateUtc: next.dateUtc,
              opponent:
                next.home.id === team.id
                  ? next.away.name
                  : next.home.name,
              opponentId:
                next.home.id === team.id
                  ? next.away.id
                  : next.home.id
            }
          : null,

        // --------------------
        // COMPARATIVE RAI
        // --------------------
        comparativeRAI: expectedLevers
          ? {
              value: 52,
              expectedLevers
            }
          : null,

        // --------------------
        // COMPARATIVE PAI (VS RAI)
        // --------------------
        comparativePAI:
          expectedLevers && observedLevers
            ? {
                value: 48,
                observedLevers: computeLeverDelta(
                  expectedLevers,
                  observedLevers
                )
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
