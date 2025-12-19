export type Sport = "nba" | "nfl" | "mlb" | "soccer";

export type ESPNGame = {
  dateUtc: string;
  home: {
    id: string;
    name: string;
    score: string | null;
  };
  away: {
    id: string;
    name: string;
    score: string | null;
  };
};

/* ---------- utils ---------- */

function extractScore(score: any): string | null {
  if (score == null) return null;
  if (typeof score === "string") return score;
  if (typeof score === "number") return String(score);
  if (typeof score === "object") {
    if ("displayValue" in score) return String(score.displayValue);
    if ("value" in score) return String(score.value);
  }
  return null;
}

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
      score: extractScore(home.score),
    },
    away: {
      id: away.team.id,
      name: away.team.displayName,
      score: extractScore(away.score),
    },
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

/* ---------- NEW: last game only ---------- */

export async function getLastGame(
  sport: Sport,
  teamId: string
): Promise<ESPNGame | null> {
  const events = await fetchSchedule(sport, teamId);
  const now = Date.now();

  const past = events
    .filter((e: any) => new Date(e.date).getTime() < now)
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  return past.length ? parseGame(past[0]) : null;
}

/* ---------- LEGACY: do not remove ---------- */

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
