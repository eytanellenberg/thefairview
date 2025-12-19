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

export async function getLastGame(teamId: string): Promise<ESPNGame | null> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/schedule`;

  const res = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!res.ok) return null;

  const json = await res.json();
  const events = json.events ?? [];
  const now = Date.now();

  const past = events
    .filter((e: any) => new Date(e.date).getTime() < now)
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  return past.length ? parseGame(past[0]) : null;
}
