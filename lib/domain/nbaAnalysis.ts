import {
  getLastAndNextGame,
  getRecentFinalGames,
  getGameBoxscore,
  extractTeamStatsFromBoxscore,
  GameSummary
} from "@/lib/providers/espn";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

type Lever = { lever: string; contribution: number; rationale: string };

type TeamGameMetrics = {
  spacing: number;
  defense: number;
  pnr: number;
};

async function metricsForGame(sport: "nba", game: GameSummary, teamId: string): Promise<TeamGameMetrics | null> {
  const summary = await getGameBoxscore(sport, game.gameId);
  const teams = extractTeamStatsFromBoxscore(summary);

  const team = teams.find(t => t.teamId === teamId);
  const opp = teams.find(t => t.teamId !== teamId);

  if (!team || !opp) return null;

  // --- Spacing proxy: AST/TO and 3PA rate (if available)
  const ast = team.ast ?? 0;
  const tov = team.tov ?? 0;
  const tpa = team.tpa ?? 0;
  const fga = team.fga ?? 0;

  const astTo = tov > 0 ? ast / tov : ast;
  const threeRate = fga > 0 ? tpa / fga : 0;

  // centered/standardized-ish
  const spacing = clamp(Math.round((astTo - 1.6) * 10 + (threeRate - 0.35) * 40), -20, 20);

  // --- Defense proxy: opponent fg% and points allowed
  const oppFG = opp.fgPct ?? 0.47;
  const ptsAllowed = opp.points ?? 110;

  const defense = clamp(Math.round(-(oppFG - 0.47) * 120 - (ptsAllowed - 110) * 0.25), -20, 20);

  // --- PnR stress proxy: opponent assists and paint points (if present, else use points only)
  const oppAst = opp.ast ?? 25;
  const oppPaint = opp.paintPts ?? 48;

  const pnr = clamp(Math.round(-(oppAst - 25) * 0.6 - (oppPaint - 48) * 0.35), -20, 20);

  return { spacing, defense, pnr };
}

async function rollingMetrics(sport: "nba", teamId: string, limit = 5): Promise<TeamGameMetrics> {
  const games = await getRecentFinalGames(sport, teamId, limit);
  const spacingArr: number[] = [];
  const defenseArr: number[] = [];
  const pnrArr: number[] = [];

  for (const g of games) {
    try {
      const m = await metricsForGame(sport, g, teamId);
      if (!m) continue;
      spacingArr.push(m.spacing);
      defenseArr.push(m.defense);
      pnrArr.push(m.pnr);
    } catch {
      // ignore a single game failure
    }
  }

  return {
    spacing: avg(spacingArr),
    defense: avg(defenseArr),
    pnr: avg(pnrArr)
  };
}

function buildExpectedLevers(teamAvg: TeamGameMetrics, oppAvg: TeamGameMetrics): Lever[] {
  // comparative expected impact = team - opponent (scaled)
  const spacing = clamp(Math.round((teamAvg.spacing - oppAvg.spacing) * 1.2), -20, 20);
  const defense = clamp(Math.round((teamAvg.defense - oppAvg.defense) * 1.2), -20, 20);
  const pnr = clamp(Math.round((teamAvg.pnr - oppAvg.pnr) * 1.2), -20, 20);

  const levers: Lever[] = [
    {
      lever: "Offensive spacing coherence",
      contribution: spacing,
      rationale: "Expected edge based on AST/TO + 3PA rate vs opponent profile (last 5 games)"
    },
    {
      lever: "Defensive scheme continuity",
      contribution: defense,
      rationale: "Expected defensive stability based on opponent FG% + points allowed (last 5 games)"
    },
    {
      lever: "PnR matchup stress",
      contribution: pnr,
      rationale: "Expected PnR stress based on opponent assists + paint pressure (last 5 games)"
    }
  ];

  // rank by absolute expected influence
  return levers.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

function buildObservedLevers(obs: TeamGameMetrics): Lever[] {
  const levers: Lever[] = [
    {
      lever: "Offensive spacing coherence",
      contribution: clamp(Math.round(obs.spacing), -20, 20),
      rationale: "Observed spacing execution from AST/TO + 3PA rate (last game)"
    },
    {
      lever: "Defensive scheme continuity",
      contribution: clamp(Math.round(obs.defense), -20, 20),
      rationale: "Observed defensive execution from opponent FG% + points allowed (last game)"
    },
    {
      lever: "PnR matchup stress",
      contribution: clamp(Math.round(obs.pnr), -20, 20),
      rationale: "Observed PnR stress from opponent assists + paint pressure (last game)"
    }
  ];

  // rank by absolute observed impact
  return levers.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

export async function computeTeamRAI(sport: "nba", teamId: string) {
  const { next } = await getLastAndNextGame(sport, teamId);
  if (!next) return { status: "no_next_game" as const };

  const oppId = next.home.id === teamId ? next.away.id : next.home.id;

  const [teamAvg, oppAvg] = await Promise.all([
    rollingMetrics(sport, teamId, 5),
    rollingMetrics(sport, oppId, 5)
  ]);

  const expectedLevers = buildExpectedLevers(teamAvg, oppAvg);
  const raiScore = clamp(50 + Math.round(avg(expectedLevers.map(l => l.contribution))), 30, 75);

  return {
    status: "ok" as const,
    game: next,
    value: raiScore,
    expectedLevers,
    summary:
      "Pre-game comparative hypothesis based on last-5-game structural signals (team vs opponent)."
  };
}

export async function computeTeamPAI(sport: "nba", teamId: string) {
  const { last } = await getLastAndNextGame(sport, teamId);
  if (!last) return { status: "no_last_game" as const };

  const obs = await metricsForGame(sport, last, teamId);
  if (!obs) return { status: "no_boxscore" as const, game: last };

  const observedLevers = buildObservedLevers(obs);
  const paiScore = clamp(50 + Math.round(avg(observedLevers.map(l => l.contribution))), 30, 75);

  return {
    status: "ok" as const,
    game: last,
    value: paiScore,
    observedLevers,
    summary:
      "Post-game execution measured on the same structural levers using last-game boxscore signals."
  };
}
