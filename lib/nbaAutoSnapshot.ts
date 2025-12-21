import { getNBALastFinalGames, NormalizedGame } from "@/lib/providers/espn";

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
    teamA: { name: string; levers: FAIRLever[] };
    teamB: { name: string; levers: FAIRLever[] };
  };
  surprise: FAIRSurprise;
};

export type NBAAutoSnapshot = {
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

function finalScore(g: NormalizedGame) {
  if (g.home.score === null || g.away.score === null) return "—";
  return `${g.home.score} – ${g.away.score}`;
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
    valueAbs: round2(Math.abs(raw)),
    raw,
    levers: [
      { label: "Home-court context", value: round2(homeCourt * Math.sign(raw || 1)) },
      { label: "Recent scoring form", value: round2(form) },
      { label: "Record proxy", value: round2(record) },
    ],
  };
}

/* ================= PAI ================= */

function computePAI(g: NormalizedGame) {
  const m =
    g.home.score !== null && g.away.score !== null
      ? g.home.score - g.away.score
      : 0;

  const ms = clamp(m / 8, -3, 3);
  const off = round2(ms);
  const shot = round2(ms * 0.7);
  const def = round2(ms * 0.85);

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
    intensityAbs: round2((Math.abs(off) + Math.abs(shot) + Math.abs(def)) / 3),
  };
}

/* ================= SURPRISE ================= */

function surpriseLevel(score: number): FAIRSurprise["level"] {
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
      raiFavored: rai.edgeTeam,
      logicalOutcome: 0,
      score: 0,
      level: "NONE",
    };
  }

  const winnerName = g.winner === "HOME" ? g.home.name : g.away.name;
  const isSurprise = winnerName !== rai.edgeTeam;
  const logicalOutcome = isSurprise ? -rai.valueAbs : rai.valueAbs;

  if (!isSurprise) {
    return {
      isSurprise: false,
      winner: winnerName,
      raiFavored: rai.edgeTeam,
      logicalOutcome,
      score: 0,
      level: "NONE",
    };
  }

  const score = round2(rai.valueAbs * pai.intensityAbs);

  return {
    isSurprise: true,
    winner: winnerName,
    raiFavored: rai.edgeTeam,
    logicalOutcome,
    score,
    level: surpriseLevel(score),
  };
}

/* ================= MAIN ================= */

export async function computeNBAAutoSnapshot(): Promise<NBAAutoSnapshot> {
  const games = await getNBALastFinalGames(7);

  const matches: FAIRMatch[] = games.map(g => {
    const rai = computeRAI(g);
    const pai = computePAI(g);
    const surprise = computeSurprise(g, rai, pai);

    return {
      matchup: `${g.home.name} vs ${g.away.name}`,
      finalScore: finalScore(g),
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
    .filter(m => m.surprise.isSurprise)
    .sort((a, b) => b.surprise.score - a.surprise.score)
    .slice(0, 5)
    .map(m => ({
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
