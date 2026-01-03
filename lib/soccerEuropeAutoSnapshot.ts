// lib/soccerEuropeAutoSnapshot.ts
import { getSoccerGames, NormalizedGame } from "@/lib/providers/espn";

/* ================= TYPES ================= */

export type FAIRLever = { label: string; value: number };

export type FAIRSurprise = {
  isSurprise: boolean;
  winner: string;
  raiFavored: string;
  score: number;
  level: "MINOR" | "MODERATE" | "MAJOR" | "NONE";
};

export type WeeklyFAIRSummary = {
  games: number;
  noSurprise: number;
  surprises: number;
  alignmentRate: number; // %
  takeaway: string;
};

export type AnalyzedFixture = {
  leagueLabel: string;
  home: string;
  away: string;
};

export type SoccerEuropeSnapshot = {
  updatedAt: string;
  leaguesIncluded: { key: string; label: string; slug: string }[];
  weeklySummary: WeeklyFAIRSummary;
  topSurprises: {
    leagueKey: string;
    leagueLabel: string;
    matchup: string;
    winner: string;
    raiFavored: string;
    score: number;
    level: "MINOR" | "MODERATE" | "MAJOR";
  }[];
  analyzedFixtures: AnalyzedFixture[]; // 👈 NOUVEAU
};

/* ================= CONFIG ================= */

const EURO_LEAGUES: { key: string; label: string; espn: string; slug: string }[] = [
  { key: "fra1", label: "Ligue 1", espn: "soccer/fra.1", slug: "/soccer/ligue-1" },
  { key: "eng1", label: "Premier League", espn: "soccer/eng.1", slug: "/soccer/premier-league" },
  { key: "esp1", label: "LaLiga", espn: "soccer/esp.1", slug: "/soccer/la-liga" },
  { key: "ita1", label: "Serie A", espn: "soccer/ita.1", slug: "/soccer/serie-a" },
  { key: "ger1", label: "Bundesliga", espn: "soccer/ger.1", slug: "/soccer/bundesliga" },
];

/* ================= HELPERS ================= */

const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function computeRAI(g: NormalizedGame) {
  const hs = g.home.score ?? 0;
  const as = g.away.score ?? 0;

  const homeAdv = 0.35;
  const scoringForm = clamp((hs - as) / 2.5, -1.75, 1.75);
  const recordProxy = clamp((hs - as) / 4.5, -1.0, 1.0);

  const raw = homeAdv + scoringForm + recordProxy;
  const edgeTeam = raw >= 0 ? g.home.name : g.away.name;

  return {
    edgeTeam,
    value: r2(Math.abs(raw)),
    levers: [
      { label: "Home advantage", value: r2(homeAdv * (raw >= 0 ? 1 : -1)) },
      { label: "Recent scoring form", value: r2(scoringForm) },
      { label: "Record proxy", value: r2(recordProxy) },
    ],
  };
}

function computePAI(g: NormalizedGame) {
  const margin =
    g.home.score != null && g.away.score != null
      ? g.home.score - g.away.score
      : 0;

  const base = clamp(margin / 1.5, -3, 3);

  const off = r2(base * 1.0);
  const shot = r2(base * 0.8);
  const def = r2(base * 0.9);

  return {
    intensity: r2((Math.abs(off) + Math.abs(shot) + Math.abs(def)) / 3),
  };
}

function surpriseLevel(score: number): "MINOR" | "MODERATE" | "MAJOR" {
  if (score < 0.75) return "MINOR";
  if (score < 1.75) return "MODERATE";
  return "MAJOR";
}

function computeSurprise(
  g: NormalizedGame,
  raiValue: number,
  raiFavored: string,
  paiIntensity: number
): FAIRSurprise {
  if (!g.winner) {
    return { isSurprise: false, winner: "—", raiFavored, score: 0, level: "NONE" };
  }

  const winner = g.winner === "HOME" ? g.home.name : g.away.name;
  const isSurprise = winner !== raiFavored;

  if (!isSurprise) {
    return { isSurprise: false, winner, raiFavored, score: 0, level: "NONE" };
  }

  const score = r2(raiValue * paiIntensity);
  return { isSurprise: true, winner, raiFavored, score, level: surpriseLevel(score) };
}

function takeAway(alignmentRate: number) {
  if (alignmentRate >= 80)
    return "European football was structurally stable this week: most outcomes followed pregame readiness (RAI).";
  if (alignmentRate >= 60)
    return "Mixed week: structure held in many matches, but execution-driven variance showed up across leagues.";
  return "High volatility week: many outcomes conflicted with pregame structure (RAI), suggesting strong execution/variance effects.";
}

/* ================= MAIN ================= */

export async function computeSoccerEuropeAutoSnapshot(): Promise<SoccerEuropeSnapshot> {
  const leagueResults = await Promise.all(
    EURO_LEAGUES.map(async (L) => {
      const games = await getSoccerGames(L.espn);
      const finals = games.filter((g) => g.status === "FINAL");
      return { league: L, finals };
    })
  );

  const surprisesAll: SoccerEuropeSnapshot["topSurprises"] = [];
  const analyzedFixtures: AnalyzedFixture[] = [];

  let totalGames = 0;
  let noSurprise = 0;

  for (const { league, finals } of leagueResults) {
    for (const g of finals) {
      totalGames++;

      analyzedFixtures.push({
        leagueLabel: league.label,
        home: g.home.name,
        away: g.away.name,
      });

      const rai = computeRAI(g);
      const pai = computePAI(g);
      const surprise = computeSurprise(g, rai.value, rai.edgeTeam, pai.intensity);

      if (!surprise.isSurprise) noSurprise++;

      if (surprise.isSurprise && surprise.level !== "NONE") {
        surprisesAll.push({
          leagueKey: league.key,
          leagueLabel: league.label,
          matchup: `${g.home.name} vs ${g.away.name}`,
          winner: surprise.winner,
          raiFavored: surprise.raiFavored,
          score: surprise.score,
          level: surprise.level,
        });
      }
    }
  }

  const surprises = totalGames - noSurprise;
  const alignmentRate = totalGames
    ? Math.round((noSurprise / totalGames) * 100)
    : 0;

  const weeklySummary: WeeklyFAIRSummary = {
    games: totalGames,
    noSurprise,
    surprises,
    alignmentRate,
    takeaway: takeAway(alignmentRate),
  };

  const topSurprises = surprisesAll
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);

  return {
    updatedAt: new Date().toISOString(),
    leaguesIncluded: EURO_LEAGUES.map((l) => ({
      key: l.key,
      label: l.label,
      slug: l.slug,
    })),
    weeklySummary,
    topSurprises,
    analyzedFixtures, // 👈 traçabilité complète
  };
}
