import { getNBAGames } from "@/lib/providers/espn";

export type NBAMatchFAIR = {
  matchup: string;
  finalScore: string;
  rai: {
    edge: string;
    value: number;
    levers: { label: string; value: number }[];
  };
  pai: {
    teamA: {
      name: string;
      levers: { label: string; value: number }[];
    };
    teamB: {
      name: string;
      levers: { label: string; value: number }[];
    };
  };
};

export function computeNBAAutoSnapshot() {
  const games = getNBAGames()
    .filter(g => g.status === "FINAL");

  const matches: NBAMatchFAIR[] = games.map(game => {
    const home = game.home;
    const away = game.away;

    const formDelta =
      (home.recentMargin - away.recentMargin) * 0.6;

    const defenseDelta =
      (away.defensiveRating - home.defensiveRating) * 0.4;

    const raiValue = Number((formDelta + defenseDelta).toFixed(2));

    const winner =
      home.score > away.score ? home.name : away.name;

    const scoreDiff = home.score - away.score;

    return {
      matchup: `${home.name} vs ${away.name}`,
      finalScore: `${home.score} – ${away.score}`,
      rai: {
        edge: raiValue >= 0 ? home.name : away.name,
        value: Math.abs(raiValue),
        levers: [
          {
            label: "Recent form (last 5)",
            value: Number(formDelta.toFixed(2)),
          },
          {
            label: "Defensive rating trend",
            value:
