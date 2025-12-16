export type GameSummary = {
  gameId: string;
  dateUtc: string;
  status: "final" | "scheduled" | "in_progress";
  home: { id: string; name: string; score?: number };
  away: { id: string; name: string; score?: number };
  venue?: string;
};

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports";

function sportPath(sport: "nba" | "nfl" | "mlb") {
  if (sport === "nba") return "basketball/nba";
  if (sport === "nfl") return "football/nfl";
  return "baseball/mlb";
}

async function fetchJSON(url: string) {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`ESPN error ${res.status}`);
  return res.json();
}

function normalize(event: any): GameSummary | null {
  const c = event?.competitions?.[0];
  if (!c) return null;

  const home = c.competitors.find((x: any) => x.homeAway === "home");
  const away = c.competitors.find((x: any) => x.homeAway === "away");

  const t = event.status?.type?.name?.toLowerCase() ?? "";
  const status =
    t.includes("final")
      ? "final"
      : t.includes("in")
      ? "in_progress"
      : "scheduled";

  return {
    gameId: event.id,
    dateUtc: event.date,
    status,
    home: {
      id: home.team.id,
      name: home.team.displayName,
      score: home.score ? Number(home.score) : undefined
    },
    away: {
      id: away.team.id,
      name: away.team.displayName,
      score: away.score ? Number(away.score) : undefined
    },
    venue: c.venue?.fullName
  };
}

export async function getLastAndNextGame(
  sport: "nba" | "nfl" | "mlb",
  teamId: string
) {
  const currentYear = new Date().getFullYear();
  const yearsToTry = [currentYear, currentYear - 1];

  let allGames: GameSummary[] = [];

  for (const year of yearsToTry) {
    const url = `${ESPN_BASE}/${sportPath(sport)}/teams/${teamId}/schedule?season=${year}`;
    try {
      const data = await fetchJSON(url);
      const games = (data.events ?? [])
        .map(normalize)
        .filter(Boolean) as GameSummary[];
      allGames = allGames.concat(games);
    } catch {
      // ignore season fetch errors
    }
  }

  // Deduplicate by gameId
  const map = new Map<string, GameSummary>();
  for (const g of allGames) {
    map.set(g.gameId, g);
  }
  const games = Array.from(map.values());

  const last = games
    .filter(g => g.status === "final")
    .sort((a, b) => (a.dateUtc < b.dateUtc ? 1 : -1))[0];

  const next = games
    .filter(g => g.status === "scheduled")
    .sort((a, b) => (a.dateUtc > b.dateUtc ? 1 : -1))[0];

  return { last, next };
}
