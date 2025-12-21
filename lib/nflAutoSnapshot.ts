// lib/nflAutoSnapshot.ts
import { getNFLGames, NormalizedGame } from "@/lib/providers/espn";

/* ================= TYPES ================= */

export type FAIRLever = { label: string; value: number };

export type FAIRSurprise = {
  isSurprise: boolean;
  winner: string;
  raiFavored: string;
  score: number;
  level: "MINOR" | "MODERATE" | "MAJOR" | "NONE";
};

export type FAIRTeamPAI = {
  name: string;
  levers: FAIRLever[];
};

export type FAIRMatch = {
  matchup: string;
  finalScore: string;
  dateUtc: string;
  rai: {
    edge: string;
    value: number;
    levers: FAIRLever[];
  };
  pai: {
    teamA: FAIRTeamPAI;
    teamB: FAIRTeamPAI;
  };
  surprise: FAIRSurprise;
};

export type WeeklyFAIRSummary = {
  games: number;
  noSurprise: number;
  surprises: number;
  alignmentRate: number;
  takeaway: string;
};

export type NFLAutoSnapshot = {
  updatedAt: string;
  matches: FAIRMatch[];
  topSurprises: FAIRSurprise[];
  weeklySummary: WeeklyFAIRSummary;
};

/* ================= HELPERS ================= */

const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function finalScore(g: NormalizedGame) {
  if (g.home.score == null || g.away.score == null) return "—";
  return `${g.home.score} – ${g.away.score}`;
}

/* ================= RAI ================= */

function computeRAI(g: NormalizedGame) {
  const hs = g.home.score ?? 0;
  const as = g.away.score ?? 0;

  const homeField = 1;
  const recentForm = clamp((hs - as) / 14, -2, 2);
  const recordProxy = clamp((hs - as) / 28, -1, 1);

  const raw = homeField + recentForm + recordProxy;
  const edgeTeam = raw >= 0 ? g.home.name : g.away.name;

  return {
    edge: edgeTeam,
    value: r2(Math.abs(raw)),
    levers: [
      { label: "Home-field advantage", value: r2(homeField * (raw >= 0 ? 1 : -1)) },
      { label: "Recent scoring form", value: r2(recentForm) },
      { label: "Record proxy", value: r2(recordProxy) },
    ],
  };
}

/* ================= PAI ================= */

function computePAI(g: NormalizedGame) {
  const margin =
    g.home.score != null && g.away.score != null
      ? g.home.score - g.away.score
      : 0;

  const base = clamp(margin / 10, -3, 3);

  const off = r2(base);
  const eff = r2(base * 0.8);
  const def = r2(base * 0.9);

  return {
    home: {
      name: g.home.name,
      levers: [
        { label: "Offensive execution", value: off },
        { label: "Efficiency / turnovers", value: eff },
        { label: "Defensive resistance", value: def },
      ],
    },
    away: {
      name: g.away.name,
      levers: [
        { label: "Offensive execution", value: -off },
        { label: "Efficiency / turnovers", value: -eff },
        { label: "Defensive resistance", value: -def },
      ],
    },
    intensity: r2((Math.abs(off) + Math.abs(eff) + Math.abs(def)) / 3),
  };
}

/* ================= SURPRISE ================= */

function surpriseLevel(score: number): "MINOR" | "MODERATE" | "MAJOR" {
  if (score < 0.75) return "MINOR";
  if (score < 1.75) return "MODERATE";
  return "MAJOR";
}

function computeSurprise(
  g: NormalizedGame,
  rai: ReturnType<typeof computeRAI>,
  pai: ReturnType<typeof computePAI>
): FAIRSurprise {
  if (!g.winner) {
    return {
      isSurprise: false,
      winner: "—",
      raiFavored: rai.edge,
      score: 0,
      level: "NONE",
    };
  }

  const winner = g.winner === "HOME" ? g.home.name : g.away.name;
  const isSurprise = winner !== rai.edge;

  if (!isSurprise) {
    return {
      isSurprise: false,
      winner,
      raiFavored: rai.edge,
      score: 0,
      level: "NONE",
    };
  }

  const score = r2(rai.value * pai.intensity);

  return {
    isSurprise: true,
    winner,
    raiFavored: rai.edge,
    score,
    level: surpriseLevel(score),
  };
}

/* ================= MAIN ================= */

export async function computeNFLAutoSnapshot(): Promise<NFLAutoSnapshot> {
  const games = (await getNFLGames())
    .filter((g) => g.status === "FINAL")
    .sort((a, b) => new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime());

  const matches: FAIRMatch[] = games.map((g) => {
    const rai = computeRAI(g);
    const pai = computePAI(g);
    const surprise = computeSurprise(g, rai, pai);

    return {
      matchup: `${g.home.name} vs ${g.away.name}`,
      finalScore: finalScore(g),
      dateUtc: g.dateUtc,
      rai,
      pai: { teamA: pai.home, teamB: pai.away },
      surprise,
    };
  });

  const surprises = matches.filter((m) => m.surprise.isSurprise);
  const noSurprise = matches.length - surprises.length;
  const alignmentRate = matches.length
    ? Math.round((noSurprise / matches.length) * 100)
    : 0;

  const takeaway =
    alignmentRate >= 80
      ? "This NFL slate was structurally stable: most games followed pregame readiness signals (RAI)."
      : alignmentRate >= 60
      ? "This week showed moderate volatility between structure (RAI) and execution (PAI)."
      : "This NFL slate was highly volatile, with execution frequently overriding pregame expectations.";

  return {
    updatedAt: new Date().toISOString(),
    matches,
    topSurprises: surprises.slice(0, 5).map((m) => m.surprise),
    weeklySummary: {
      games: matches.length,
      noSurprise,
      surprises: surprises.length,
      alignmentRate,
      takeaway,
    },
  };
}
