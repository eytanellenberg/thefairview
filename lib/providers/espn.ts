export type Sport = "nba" | "nfl" | "mlb" | "soccer";

export type ESPNGame = {
  dateUtc: string;
  home: { id: string; name: string; score: number | null };
  away: { id: string; name: string; score: number | null };
  // utile pour savoir si c’est terminé
  status?: { type?: { state?: string } };
};

function extractScoreToNumber(score: any): number | null {
  if (score == null) return null;
  if (typeof score === "number") return Number.isFinite(score) ? score : null;
  if (typeof score === "string") {
    const n = Number(score);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof score === "object") {
    if ("value" in score) {
      const n = Number((score as any).value);
      return Number.isFinite(n) ? n : null;
    }
    if ("displayValue" in score) {
      const n = Number((score as any).displayValue);
      return Number.isFinite(n) ? n : null;
    }
  }
  return null;
}

function parseGame(event: any): ESPNGame {
  const competition = event?.competitions?.[0];
  const competitors = competition?.competitors ?? [];

  const home = competitors.find((c: any) => c.homeAway === "home");
  const away = competitors.find((c: any) => c.homeAway === "away");

  return {
    dateUtc: event.date,
    home: {
      id: home?.team?.id,
      name: home?.team?.displayName ?? "Unknown",
      score: extractScoreToNumber(home?.score),
    },
    away: {
      id: away?.team?.id,
      name: away?.team?.displayName ?? "Unknown",
      score: extractScoreToNumber(away?.score),
    },
    status: event?.status,
  };
}

function sportPath(sport: Sport) {
  switch (sport) {
    case "nba":
      return "basketball/nba";
    case "nfl":
      return "football/nfl";
    case "mlb":
      return "baseball/mlb";
    case "soccer":
      return "soccer";
  }
}

async function fetchScheduleEvents(sport: Sport, teamId: string) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sportPath(
    sport
  )}/teams/${teamId}/schedule`;

  const res = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
  if (!res.ok) return [];

  const json = await res.json();
  return (json.events ?? []) as any[];
}

export async function getRecentGames(
  sport: Sport,
  teamId: string,
  n: number
): Promise<ESPNGame[]> {
  const events = await fetchScheduleEvents(sport, teamId);
  const now = Date.now();

  const past = events
    .filter((e: any) => new Date(e.date).getTime() < now)
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, Math.max(1, n))
    .map(parseGame);

  return past;
}

export async function getLastGame(
  sport: Sport,
  teamId: string
): Promise<ESPNGame | null> {
  const games = await getRecentGames(sport, teamId, 1);
  return games.length ? games[0] : null;
}

export async function getLastAndNextGame(
  sport: Sport,
  teamId: string
): Promise<{ last: ESPNGame | null; next: ESPNGame | null }> {
  const events = await fetchScheduleEvents(sport, teamId);
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
