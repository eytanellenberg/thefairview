// lib/nbaAutoSnapshot.ts
import { getNBAGames, NormalizedGame } from "@/lib/providers/espn";

/* ================= TYPES ================= */

export type FAIRLever = { label: string; value: number };

export type FAIRSurprise = {
  isSurprise: boolean;
  winner: string;
  raiFavored: string;
  logicalOutcome: number;
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

export type NBAAutoSnapshot = {
  updatedAt: string;
  matches: FAIRMatch[];
  topSurprises: {
    matchup: string;
    raiEdge: string;
    logicalOutcome: number;
    score: number;
    level: "MINOR" | "MODERATE" | "MAJOR";
  }[];
};

/* ================= HELPERS ================= */

const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function finalScore(g: NormalizedGame) {
  if (g.home.score === null || g.away.score === null) return "—";
  return `${g.home.score} – ${g.away.score}`;
}

function margin(g: NormalizedGame) {
  if (g.home.score === null || g.away.score === null) return 0;
  return g.home.score - g.away.score;
}

function winner(g: NormalizedGame) {
  if (!g.winner) return null;
  return g.winner === "HOME" ? g.home.name : g.away.name;
}

/* ================= RAI ================= */

function computeRAI(g: NormalizedGame) {
  const hs = g.home.score ?? 0;
  const as = g.away.score ?? 0;

  const homeCourt = 0.6;
  const form = clamp((hs - as) / 10, -2, 2);
  const record = clamp((hs - as) / 20, -1.5, 1.5);

  const raw = homeCourt + form + record;
  const edgeTeam = raw >= 0 ? g.home.name : g.away.name;

  return {
    edgeTeam,
    valueAbs: r2(Math.abs(raw)),
    levers: [
      { label: "Home-court context", value: r2(homeCourt * (raw >= 0 ? 1 : -1)) },
      { label: "Recent scoring form", value: r2(form) },
      { label: "Record proxy", value: r2(record) },
    ],
  };
}

/* ================= PAI ================= */

function computePAI(g: NormalizedGame) {
  const ms = clamp(margin(g) / 8, -3, 3);

  const off = r2(ms * 1.0);
  const shot = r2(ms * 0.7);
  const def = r2(ms * 0.85);

  return {
    home: {
      name: g.home.name,
      levers: [
        { label: "Offensive execution", value: off },
        { label: "Shot conversion", value: shot },
        { label: "Defensive resistance", value: def },
      ],
    },
    away: {
      name: g.away.name,
      levers: [
        { label: "Offensive execution", value: -off },
        { label: "Shot conversion", value: -shot },
        { label: "Defensive resistance", value: -def },
      ],
    },
    intensityAbs: r2((Math.abs(off) + Math.abs(shot) + Math.abs(def)) / 3),
  };
}

function level(score: number): "MINOR" | "MODERATE" | "MAJOR" {
  if (score < 0.75) return "MINOR";
  if (score < 1.75) return "MODERATE";
  return "MAJOR";
}

/* ================= SURPRISE ================= */

function computeSurprise(
  g: NormalizedGame,
  rai: ReturnType<typeof computeRAI>,
  pai: ReturnType<typeof computePAI>
): FAIRSurprise {
  const w = winner(g);
  if (!w)
    return {
      isSurprise: false,
      winner: "—",
      raiFavored: rai.edgeTeam,
      logicalOutcome: 0,
      score: 0,
      level: "NONE",
    };

  const isSurprise = w !== rai.edgeTeam;
  const logicalOutcome = isSurprise ? -rai.valueAbs : rai.valueAbs;

  if (!isSurprise)
    return {
      isSurprise: false,
      winner: w,
      raiFavored: rai.edgeTeam,
      logicalOutcome,
      score: 0,
      level: "NONE",
    };

  const score = r2(rai.valueAbs * pai.intensityAbs);
  return {
    isSurprise: true,
    winner: w,
    raiFavored: rai.edgeTeam,
    logicalOutcome,
    score,
    level: level(score),
  };
}

/* ================= MAIN ================= */

export async function computeNBAAutoSnapshot(): Promise<NBAAutoSnapshot> {
  const games = await getNBAGames();

  const finals = games
    .filter((g) => g.status === "FINAL")
    .sort((a, b) => new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime());

  const matches: FAIRMatch[] = finals.map((g) => {
    const rai = computeRAI(g);
    const pai = computePAI(g);
    const surprise = computeSurprise(g, rai, pai);

    return {
      matchup: `${g.home.name} vs ${g.away.name}`,
      finalScore: finalScore(g),
      dateUtc: g.dateUtc,
      rai: { edge: rai.edgeTeam, value: rai.valueAbs, levers: rai.levers },
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
      logicalOutcome: m.surprise.logicalOutcome,
      score: m.surprise.score,
      level: m.surprise.level as "MINOR" | "MODERATE" | "MAJOR",
    }));

  return {
    updatedAt: new Date().toISOString(),
    matches,
    topSurprises,
  };
}
