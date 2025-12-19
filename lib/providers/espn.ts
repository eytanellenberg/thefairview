type TeamRef = {
  id: string;
  name: string;
  score?: string;
};

export type ESPNGame = {
  dateUtc: string;
  home: TeamRef;
  away: TeamRef;
};

function parseGame(event: any): ESPNGame {
  const competition = event.competitions[0];
  const competitors = competition.competitors;

  const home = competitors.find((c: any) => c.homeAway === "home");
  const away = competitors.find((c: any) => c.homeAway === "away");

  return {
    dateUtc: event.date,
    home: {
      id: home.team.id,
      name: home.team.displayName,
      score: home.score,
    },
    away: {
      id: away.team.id,
      name: away.team.displayName,
      score: away.score,
    },
  };
}

export async function getLastGame(
  league: "nba",
  teamId: string
): Promise<ESPNGame | null> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/${league}/teams/${teamId}/schedule`;

  const res = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) return null;

  const json = await res.json();
  const events = json.events ?? [];

  const past = events
    .filter((e: any) => new Date(e.date).getTime() < Date.now())
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  return past.length ? parseGame(past[0]) : null;
}
