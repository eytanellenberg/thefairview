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

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function toFinalScore(g: NormalizedGame) {
  const hs = g.home?.score;
  const as = g.away?.score;
  if (typeof hs === "number" && typeof as === "number") return `${hs} – ${as}`;
  return "—";
}

function margin(g: NormalizedGame): number | null {
  if (g.home?.score == null || g.away?.score == null) return null;
  return g.home.score - g.away.score;
}

function winnerName(g: NormalizedGame): string | null {
  if (!g.winner) return null;
  return g.winner === "HOME" ? g.home.name : g.away.name;
}

/**
 * ✅ Détecteur "match terminé" ROBUSTE
 * Supporte plusieurs formats (FINAL, post, completed, etc.)
 */
function isFinalGame(g: NormalizedGame): boolean {
  const anyG = g as any;

  // cas 1: status string classique
  const status = anyG.status ?? anyG.statusText ?? anyG.status_name;
  if (typeof status === "string") {
    const s = status.toLowerCase();
    if (s === "final" || s.includes("final")) return true;
  }

  // cas 2: state "post"
  const state = anyG.state ?? anyG.statusState ?? anyG.status?.type?.state;
  if (typeof state === "string" && state.toLowerCase() === "post") return true;

  // cas 3: completed boolean
  const completed = anyG.completed ?? anyG.status?.type?.completed;
  if (typeof completed === "boolean" && completed) return true;

  // fallback: si scores existent ET winner existe → quasi sûr terminé
  const hs = g.home?.score;
  const as = g.away?.score;
  if (typeof hs === "number" && typeof as === "number" && !!g.winner) return true;

  return false;
}

/**
 * RAI proxy (simple, stable, auto sans stockage)
 * - homeCourt: +0.60 pour home
 * - recentScoringForm: (homePts - awayPts) / 10 (clamp)
 * - recordProxy: (homePts - awayPts) / 20 (clamp) => petit poids
 */
function computeRAI(g: NormalizedGame) {
  const hs = g.home?.score ?? 0;
  const as = g.away?.score ?? 0;

  const homeCourt = 0.6;
  const recentScoringForm = clamp((hs - as) / 10, -2.0, 2.0);
  const recordProxy = clamp((hs - as) / 20, -1.5, 1.5);

  const raw = homeCourt + recentScoringForm + recordProxy; // home perspective
  const edgeTeam = raw >= 0 ? g.home.name : g.away.name;

  return {
    edgeTeam,
    valueAbs: round2(Math.abs(raw)),
    levers: [
      { label: "Home-court context", value: round2(homeCourt * (raw >= 0 ? 1 : -1)) },
      { label: "Recent scoring form", value: round2(recentScoringForm) },
      { label: "Record proxy", value: round2(recordProxy) },
    ],
    raw,
  };
}

/**
 * PAI proxy basé sur le margin:
 * marginScaled = margin/8 (clamp) => split en 3 leviers
 */
function computePAI(g: NormalizedGame) {
  const m = margin(g);
  const ms = clamp((m ?? 0) / 8, -3.0, 3.0);

  const off = round2(ms * 1.0);
  const shot = round2(ms * 0.7);
  const def = round2(ms * 0.85);

  const homeLevers = [
    { label: "Offensive execution", value: off },
    { label: "Shot conversion", value: shot },
    { label: "Defensive resistance", value: def },
  ];
  const awayLevers = homeLevers.map((l) => ({ ...l, value: round2(-l.value) }));

  return {
    home: { name: g.home.name, levers: homeLevers },
    away: { name: g.away.name, levers: awayLevers },
    intensityAbs: round2((Math.abs(off) + Math.abs(shot) + Math.abs(def)) / 3),
  };
}

function surpriseLevel(score: number): "MINOR" | "MODERATE" | "MAJOR" {
  if (score < 0.75) return "MINOR";
  if (score < 1.75) return "MODERATE";
  return "MAJOR";
}

/**
 * FAIR Surprise:
 * - surprise si winner != team favorisée par RAI
 * - FSS = |RAI_edge| * PAI_intensity
 */
function computeSurprise(
  g: NormalizedGame,
  rai: ReturnType<typeof computeRAI>,
  pai: ReturnType<typeof computePAI>
): FAIRSurprise {
  const w = winnerName(g);

  if (!w) {
    return {
      isSurprise: false,
      winner: "—",
      raiFavored: rai.edgeTeam,
      logicalOutcome: 0,
      score: 0,
      level: "NONE",
    };
  }

  const favored = rai.edgeTeam;
  const isSurprise = w !== favored;
  const logicalOutcome = round2(isSurprise ? -rai.valueAbs : +rai.valueAbs);

  if (!isSurprise) {
    return {
      isSurprise: false,
      winner: w,
      raiFavored: favored,
      logicalOutcome,
      score: 0,
      level: "NONE",
    };
  }

  const score = round2(rai.valueAbs * pai.intensityAbs);
  const level = surpriseLevel(score);

  return {
    isSurprise: true,
    winner: w,
    raiFavored: favored,
    logicalOutcome,
    score,
    level,
  };
}

/* ================= MAIN ================= */

export async function computeNBAAutoSnapshot(): Promise<NBAAutoSnapshot> {
  const events = await getNBAGames();

  // ✅ finals only (robuste)
  const finals = events
    .filter((g) => g?.home?.name && g?.away?.name)
    .filter((g) => isFinalGame(g))
    .sort((a, b) => new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime());

  const matches: FAIRMatch[] = finals.map((g) => {
    const rai = computeRAI(g);
    const pai = computePAI(g);
    const surprise = computeSurprise(g, rai, pai);

    return {
      matchup: `${g.home.name} vs ${g.away.name}`,
      finalScore: toFinalScore(g),
      dateUtc: g.dateUtc,
      rai: {
        edge: rai.edgeTeam,
        value: rai.valueAbs,
        levers: rai.levers,
      },
      pai: {
        teamA: pai.home,
        teamB: pai.away,
      },
      surprise,
    };
  });

  const topSurprises = matches
    .filter((m) => m.surprise.isSurprise)
    .sort((a, b) => b.surprise.score - a.surprise.score)
    .slice(0, 5)
    .map((m) => ({
      matchup: m.matchup,
      raiEdge: `${m.rai.edge} (+${m.rai.value.toFixed(2)})`,
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
