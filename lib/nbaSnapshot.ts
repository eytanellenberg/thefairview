import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";
import { computeLeverDelta } from "@/lib/domain/leverDelta";

type Lever = {
  lever: string;
  contribution: number;
  rationale: string;
};

export async function buildNBASnapshot() {
  const snapshot: any[] = [];

  for (const team of NBA_TEAMS) {
    try {
      const { last, next } = await getLastAndNextGame("nba", team.id);

      // -------------------------
      // Comparative Readiness (RAI) — PRE-GAME
      // -------------------------
      const comparativeRAI = {
        value: 51,
        expectedLevers: [
          {
            lever: "Offensive spacing coherence",
            contribution: 14,
            rationale: "Stable role distribution and half-court spacing structure"
          },
          {
            lever: "Defensive scheme continuity",
            contribution: 9,
            rationale: "Low tactical variability across recent games"
          },
          {
            lever: "PnR matchup stress",
            contribution: -11,
            rationale: "Opponent pick-and-roll profile induces coverage strain"
          }
        ],
        summary:
          "Pre-game hypothesis: these 3 levers are expected to matter most in this matchup (comparative, opponent-relative)."
      };

      // -------------------------
      // Comparative Execution (PAI) — POST-GAME
      // PAI measures execution of the SAME levers as RAI
      // -------------------------
      let comparativePAI: any = null;

      if (last) {
        // ✅ SAME LEVERS as RAI (names must match exactly)
        const observedLevers: Lever[] = [
          {
            lever: "Offensive spacing coherence",
            contribution: -8,
            rationale: "Half-court execution stagnated, limiting clean shot creation"
          },
          {
            lever: "Defensive scheme continuity",
            contribution: -12,
            rationale: "Late rotations and repeated coverage breakdowns"
          },
          {
            lever: "PnR matchup stress",
            contribution: -6,
            rationale: "Pick-and-roll actions repeatedly stressed coverage"
          }
        ];

        const observedLeversWithStatus = computeLeverDelta(
          comparativeRAI.expectedLevers,
          observedLevers
        );

        comparativePAI = {
          value: 37,
          observedLevers: observedLeversWithStatus,
          summary:
            "Post-game verification: execution fell below the pre-game hypothesis. Same levers, different intensity/order. NEW is reserved for rare emergent levers.",
          delta: {
            asExpected: observedLeversWithStatus.filter((l: any) => l.status === "expected"),
            stronger: observedLeversWithStatus.filter((l: any) => l.status === "stronger"),
            weaker: observedLeversWithStatus.filter((l: any) => l.status === "weaker"),
            new: observedLeversWithStatus.filter((l: any) => l.status === "new")
          }
        };
      }

      snapshot.push({
        team,
        lastGame: last ?? null,
        nextGame: next ?? null,
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
