import { getLastAndNextGame } from "@/lib/providers/espn";

/**
 * REAL PAI — Atlanta Hawks
 * ------------------------
 * Uses REAL ESPN boxscore data
 * No simulation, no ML, no tuning.
 * Goal: variability + interpretability.
 */

export async function computeAtlantaRealPAI() {
  const ATLANTA_ID = "1"; // ⚠️ vérifier l'id ESPN Atlanta si besoin

  const { last } = await getLastAndNextGame("nba", ATLANTA_ID);

  if (!last || !last.boxscore) {
    return null;
  }

  const teamStats = last.boxscore.teams.find(
    (t: any) => t.team.id === ATLANTA_ID
  );
  const oppStats = last.boxscore.teams.find(
    (t: any) => t.team.id !== ATLANTA_ID
  );

  if (!teamStats || !oppStats) {
    return null;
  }

  // =========================
  // RAW ESPN STATS
  // =========================

  const ast = teamStats.statistics.assists;
  const tov = teamStats.statistics.turnovers;
  const fga3 = teamStats.statistics.threePointAttempts;
  const fga = teamStats.statistics.fieldGoalsAttempted;

  const oppFGpct = oppStats.statistics.fieldGoalsPercentage;
  const oppPts = oppStats.statistics.points;

  const oppAst = oppStats.statistics.assists;
  const oppPaintPts = oppStats.statistics.pointsInPaint;

  // =========================
  // LEVER 1 — Offensive spacing coherence
  // =========================

  const astToRatio = tov > 0 ? ast / tov : ast;
  const threePtRate = fga > 0 ? fga3 / fga : 0;

  const spacingScore =
    10 * (astToRatio - 1.5) + 10 * (threePtRate - 0.35);

  // =========================
  // LEVER 2 — Defensive scheme continuity
  // =========================

  const defenseScore =
    -15 * (oppFGpct - 0.47) - 0.05 * (oppPts - 110);

  // =========================
  // LEVER 3 — PnR matchup stress
  // =========================

  const pnrStressScore =
    -0.8 * (oppAst - 25) - 0.6 * (oppPaintPts - 48);

  // =========================
  // BUILD PAI OUTPUT
  // =========================

  const levers = [
    {
      lever: "Offensive spacing coherence",
      contribution: Math.round(spacingScore),
      rationale: "Derived from AST/TO ratio and 3PT attempt rate"
    },
    {
      lever: "Defensive scheme continuity",
      contribution: Math.round(defenseScore),
      rationale: "Opponent FG% and total points allowed"
    },
    {
      lever: "PnR matchup stress",
      contribution: Math.round(pnrStressScore),
      rationale: "Opponent assists and points in the paint"
    }
  ];

  // Rank by absolute impact
  levers.sort(
    (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)
  );

  return {
    team: "Atlanta Hawks",
    gameId: last.id,
    pai: {
      value:
        50 +
        Math.round(
          levers.reduce((s, l) => s + l.contribution, 0) / 3
        ),
      observedLevers: levers,
      summary:
        "PAI computed from real ESPN boxscore signals. Values reflect actual match execution."
    }
  };
}
