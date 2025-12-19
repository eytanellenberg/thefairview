export type Sport = "nba" | "nfl" | "mlb" | "soccer";

type TeamRef = {
  id: string;
  name: string;
  score: number | null;
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
      score: home.score != null ? Number(home.score) : null,
    },
    away: {
      id: away.team.id,
      name: away.team.displayName,
      score: away.score != null ? Number(away.score) : null,
    },
  };
}

/**
 * ESPN path mapping
 * IMPORTANT: sport string ≠ URL path
 */
function sportPath(sport: Sport) {
  switch (sport) {
    case "nba":
      return "basketball/nba";
    case "nfl":
      return "football/nfl";
    case "mlb":
      return "baseball/mlb";
    case "soccer":
      return "soccer"; // ESPN soccer root (league handled by teamId)
  }
}

async function fetchSchedule(sport: Sport, teamId: string) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sportPath(
    sport
  )}/teams/${teamId}/schedule`;

  const res = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) return [];

  const json = await res.json();
  return json.events ?? [];
}

export async function getLastAndNextGame(
  sport: Sport,
  teamId: string
): Promise<{ last: ESPNGame | null; next: ESPNGame | null }> {
  const events = await fetchSchedule(sport, teamId);
  const now = Date.now();

  const past = events
    .filter((e: any) => new Date(e.date).getTime() < now)
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const future = events
    .filter((e: any) => new Date(e.date).getTime() >= now)
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  return {
    last: past.length ? parseGame(past[0]) : null,
    next: future.length ? parseGame(future[0]) : null,
  };
}
