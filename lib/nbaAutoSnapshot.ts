import { getNBALastGames } from "@/lib/providers/espn";

export type NBAMatch = {
  matchup: string;
  finalScore: string;
  rai: {
    edgeTeam: string;
    value: number;
    levers: { label: string; value: number }[];
  };
  pai: {
    team: string;
    score: string;
    levers: { label: string; value: number }[];
  }[];
};

export type NBASnapshot = {
  sport: "nba";
  updatedAt: string;
  matches: NBAMatch[];
};

function mockRecentFormDelta(): number {
  // simulé mais cohérent (−3 à +3)
  return Number((Math.random() * 6 - 3).toFixed(2));
}

export async function computeNBASnapshot(): Promise<NBASnapshot> {
  const games = await getNBALastGames();

  const matches: NBAMatch[] = games.map((g) => {
    const home = g.competitors.find((c) => c.homeAway === "home")!;
    const away = g.competitors.find((c) => c.homeAway === "away")!;

    const homeScore = Number(home.score);
    const awayScore = Number(away.score);
    const diff = homeScore - awayScore;

    // -------- RAI (forme récente + home)
    const formDelta = mockRecentFormDelta();
    const homeAdv = 0.4;
    const raiValue = Number((formDelta + homeAdv).toFixed(2));
    const raiEdgeTeam = raiValue >= 0 ? home.team.displayName : away.team.displayName;

    // -------- PAI (écart réel normalisé)
    const paiDelta = Number((diff / 10).toFixed(2));

    return {
      matchup: `${home.team.displayName} vs ${away.team.displayName}`,
      finalScore: `${homeScore} – ${awayScore}`,
      rai: {
        edgeTeam: raiEdgeTeam,
        value: Math.abs(raiValue),
        levers: [
          { label: "Recent form (last 5)", value: formDelta },
          { label: "Home-court context", value: homeAdv },
        ],
      },
      pai: [
        {
          team: home.team.displayName,
          score: `${homeScore} – ${awayScore}`,
          levers: [
            { label: "Score vs expectation", value: paiDelta },
          ],
        },
        {
          team: away.team.displayName,
          score: `${awayScore} – ${homeScore}`,
          levers: [
            { label: "Score vs expectation", value: -paiDelta },
          ],
        },
      ],
    };
  });

  return {
    sport: "nba",
    updatedAt: new Date().toISOString(),
    matches,
  };
}
