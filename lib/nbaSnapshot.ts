import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { computeLeverDelta } from "@/lib/domain/leverDelta";
import { computeTeamRAI, computeTeamPAI } from "@/lib/domain/nbaAnalysis";

export async function buildNBASnapshot() {
  const snapshot: any[] = [];

  for (const team of NBA_TEAMS) {
    try {
      const [raiOut, paiOut] = await Promise.all([
        computeTeamRAI("nba", team.id),
        computeTeamPAI("nba", team.id)
      ]);

      const comparativeRAI =
        raiOut.status === "ok"
          ? {
              value: raiOut.value,
              expectedLevers: raiOut.expectedLevers,
              summary: raiOut.summary,
              game: raiOut.game
            }
          : null;

      const comparativePAI =
        paiOut.status === "ok"
          ? {
              value: paiOut.value,
              observedLevers:
                comparativeRAI
                  ? computeLeverDelta(comparativeRAI.expectedLevers, paiOut.observedLevers)
                  : paiOut.observedLevers,
              summary: paiOut.summary,
              game: paiOut.game
            }
          : null;

      snapshot.push({
        team,
        lastGame: (paiOut as any).game ?? null,
        nextGame: (raiOut as any).game ?? null,
        comparativeRAI,
        comparativePAI
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
