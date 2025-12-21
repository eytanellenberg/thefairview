type ESPNTeam = {
  id: string;
  name: string;
  abbreviation: string;
};

type ESPNCompetitor = {
  homeAway: "home" | "away";
  team: ESPNTeam;
  score?: string;
};

type ESPNCompetition = {
  competitors: ESPNCompetitor[];
  status: {
    type: {
      completed: boolean;
    };
  };
};

type ESPNEvent = {
  id: string;
  name: string;
  competitions: ESPNCompetition[];
  date: string;
};

/**
 * Fetch last completed NBA games (scoreboard)
 */
export async function getNBAGames(): Promise<ESPNEvent[]> {
  const res = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch NBA games from ESPN");
  }

  const data = await res.json();

  return (data.events ?? []).filter(
    (e: ESPNEvent) =>
      e.competitions?.[0]?.status?.type?.completed === true
  );
}

/**
 * Fetch last completed NFL games
 */
export async function getNFLGames(): Promise<ESPNEvent[]> {
  const res = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch NFL games from ESPN");
  }

  const data = await res.json();

  return (data.events ?? []).filter(
    (e: ESPNEvent) =>
      e.competitions?.[0]?.status?.type?.completed === true
  );
}

/**
 * Fetch last completed soccer games (generic – league handled upstream)
 * Example: Ligue 1 = league=fra.1
 */
export async function getSoccerGames(league: string): Promise<ESPNEvent[]> {
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch soccer games from ESPN");
  }

  const data = await res.json();

  return (data.events ?? []).filter(
    (e: ESPNEvent) =>
      e.competitions?.[0]?.status?.type?.completed === true
  );
}
