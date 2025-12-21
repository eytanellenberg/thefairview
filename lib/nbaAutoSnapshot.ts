import { getNBAGames, NormalizedGame } from "@/lib/providers/espn";

/* ================= TYPES ================= */

type Lever = { label: string; value: number };

type SurpriseLevel = "NONE" | "MINOR" | "MODERATE" | "MAJOR";

export type NBAAutoSnapshot = {
  updatedAt: string;
  matches: FAIRMatch[];
  topSurprises: TopSurprise[];
};

type FAIRMatch = {
  matchup: string;
  finalScore: string;
  dateUtc: string;
  rai: {
    edge: string;
    value: number;
    levers: Lever[];
  };
  pai: {
    teamA: { name: string; levers: Lever[] };
    teamB: { name: string; levers: Lever[] };
  };
  surprise: {
    isSurprise: boolean;
    winner: string;
    raiFavored: string;
    score: number;
    level: SurpriseLevel;
  };
};

type TopSurprise = {
  matchup: string;
  raiEdge: string;
  score: number;
  level: Exclude<SurpriseLevel, "NONE">;
};

/* ================= HELPERS ================= */

const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function computeRAI(g: NormalizedGame) {
  const hs = g.home.score ?? 0;
  const as = g.away.score ?? 0;

  const homeCourt = 0.6;
  const form = clamp((hs - as) / 10, -2, 2);
  const proxy = clamp((hs - as) / 20, -1.5, 1.5);

  const raw = homeCourt + form + proxy;

  return {
    edge: raw >= 0 ? g.home.name : g.away.name,
    value: r2(Math.abs(raw)),
    levers: [
      { label: "Home-court context", value: r2(homeCourt * Math.sign(raw || 1)) },
      { label: "Recent scoring form", value: r2(form) },
      { label: "Record proxy", value: r2(proxy) },
    ],
  };
}

function computePAI(g: NormalizedGame) {
  const m =
    g.home.score !== null && g.away.score !== null
      ? g.home.score - g.away.score
      : 0;

  const base = clamp(m / 8, -3, 3);

  const home = [
    { label: "Offensive execution", value: r2(base) },
    { label: "Shot conversion", value: r2(base * 0.7) },
    { label: "Defensive resistance", value: r2(base * 0.85) },
  ];
  const away = home.map((l) => ({ ...l, value: r2(-l.value) }));

  const intensity =
    (Math.abs(home[0].value) +
      Math.abs(home[1].value) +
      Math.abs(home[2].value)) /
    3;

  return { home, away, intensity: r2(intensity) };
}

function surpriseLevel(score: number): SurpriseLevel {
  if (score === 0) return "NONE";
  if (score < 0.75) return "MINOR";
  if (score < 1.75) return "MODERATE";
  return "MAJOR";
}

/* ================= MAIN ================= */

export async function computeNBAAutoSnapshot(): Promise<NBAAutoSnapshot> {
  const games = (await getNBAGames())
    .filter((g) => g.status === "FINAL")
    .sort(
      (a, b) =>
        new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime()
    );

  const matches: FAIRMatch[] = games.map((g) => {
    const rai = computeRAI(g);
    const pai = computePAI(g);

    const winner =
      g.winner === "HOME" ? g.home.name : g.winner === "AWAY" ? g.away.name : "—";

    const isSurprise = winner !== rai.edge;

    const score = isSurprise ? r2(rai.value * pai.intensity) : 0;

    return {
      matchup: `${g.home.name} vs ${g.away.name}`,
      finalScore:
        g.home.score !== null && g.away.score !== null
          ? `${g.home.score} – ${g.away.score}`
          : "—",
      dateUtc: g.dateUtc,
      rai,
      pai: {
        teamA: { name: g.home.name, levers: pai.home },
        teamB: { name: g.away.name, levers: pai.away },
      },
      surprise: {
        isSurprise,
        winner,
        raiFavored: rai.edge,
        score,
        level: surpriseLevel(score),
      },
    };
  });

  const topSurprises: TopSurprise[] = matches
    .filter((m) => m.surprise.level !== "NONE")
    .sort((a, b) => b.surprise.score - a.surprise.score)
    .slice(0, 5)
    .map((m) => ({
      matchup: m.matchup,
      raiEdge: `${m.rai.edge} (+${m.rai.value})`,
      score: m.surprise.score,
      level: m.surprise.level as Exclude<SurpriseLevel, "NONE">,
    }));

  return {
    updatedAt: new Date().toISOString(),
    matches,
    topSurprises,
  };
}
