// lib/nflAutoSnapshot.ts
import { getNFLGames, NormalizedGame } from "@/lib/providers/espn";

/* ================= TYPES ================= */

export type FAIRLever = { label: string; value: number };

export type FAIRTeamPAI = {
  name: string;
  levers: FAIRLever[];
};

export type FAIRSurprise = {
  isSurprise: boolean;
  winner: string;
  raiFavored: string;
  score: number;
  level: "MINOR" | "MODERATE" | "MAJOR" | "NONE";
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

export type NFLAutoSnapshot = {
  updatedAt: string;
  matches: FAIRMatch[];
  topSurprises: {
    matchup: string;
    raiEdge: string;
    score: number;
    level: "MINOR" | "MODERATE" | "MAJOR";
  }[];
};

/* ================= HELPERS ================= */

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function margin(g: NormalizedGame) {
  if (g.home.score === null || g.away.score === null) return 0;
  return g.home.score - g.away.score;
}

function winnerName(g: NormalizedGame) {
  if (!g.winner) return null;
  return g.winner === "HOME" ? g.home.name : g.away.name;
}

/* ================= RAI — NFL ================= */

function computeRAI_NFL(g: NormalizedGame) {
  const hs = g.home.score ?? 0;
  const as = g.away.score ?? 0;

  const homeField = 1.0;
  const scoringForm = clamp((hs - as) / 7, -3, 3);
  const recordProxy = clamp((hs - as) / 14, -2, 2);

  const raw = homeField + scoringForm + recordProxy;
  const edgeTeam = raw >= 0 ? g.home.name : g.away.name;

  return {
    edge: edgeTeam,
    value: round2(Math.abs(raw)),
    levers: [
      { label: "Home-field advantage", value: round2(homeField * (raw >= 0 ? 1 : -1)) },
      { label: "Recent scoring form", value: round2(scoringForm) },
      { label: "Record proxy", value: round2(recordProxy) },
    ],
  };
}

/* ================= PAI — NFL ================= */

function computePAI_NFL(g: NormalizedGame) {
  const m = margin(g);
  const scaled = clamp(m / 10, -3, 3);

  const off = round2(scaled * 1.0);
  const eff = round2(scaled * 0.8);
  const def = round2(scaled * 0.9);

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
    intensity: round2((Math.abs(off) + Math.abs(eff) + Math.abs(def)) / 3),
  };
}

/* ================= SURPRISE ================= */

function surpriseLevel(score: number): "MINOR" | "MODERATE" | "MAJOR" {
  if (score < 1) return "MINOR";
  if (score < 2.5) return "MODERATE";
  return "MAJOR";
}

function computeSurprise(
  g: NormalizedGame,
  rai: ReturnType<typeof computeRAI_NFL>,
  pai: ReturnType<typeof computePAI_NFL>
): FAIRSurprise {
  const winner = winnerName(g);
  if (!winner) {
    return { isSurprise: false, winner: "—", raiFavored: rai.edge, score: 0, level: "NONE" };
  }

  const isSurprise = winner !== rai.edge;
  if (!isSurprise) {
    return { isSurprise: false, winner, raiFavored: rai.edge, score: 0, level: "NONE" };
  }

  const score = round2(rai.value * pai.intensity);
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
  const games = await getNFLGames();

  const finals = games
    .filter((g) => g.status === "FINAL")
    .sort((a, b) => new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime());

  const matches: FAIRMatch[] = finals.map((g) => {
    const rai = computeRAI_NFL(g);
    const pai = computePAI_NFL(g);
    const surprise = computeSurprise(g, rai, pai);

    return {
      matchup: `${g.home.name} vs ${g.away.name}`,
      finalScore: `${g.home.score} – ${g.away.score}`,
      dateUtc: g.dateUtc,
      rai,
      pai: { teamA: pai.home, teamB: pai.away },
      surprise,
    };
  });

  const topSurprises = matches
    .filter((m) => m.surprise.isSurprise)
    .sort((a, b) => b.surprise.score - a.surprise.score)
    .slice(0, 5)
    .map((m) => ({
      matchup: m.matchup,
      raiEdge: `${m.rai.edge} (+${m.rai.value})`,
      score: m.surprise.score,
      level: m.surprise.level as "MINOR" | "MODERATE" | "MAJOR",
    }));

  return {
    updatedAt: new Date().toISOString(),
    matches,
    topSurprises,
  };
}
