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
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`ESPN error ${res.status}`);
  return res.json();
}

function normalize(event: any): GameSummary | null {
  const c = event?.competitions?.[0];
  if (!c) return null;

  const home = c.competitors.find((x: any) => x.homeAway === "home");
  const away = c.competitors.find((x: any) => x.homeAway === "away");
  if (!home || !away) return null;

  const t = event.status?.type?.name?.toLowerCase?.() ?? "";
  const status =
    t.includes("final")
      ? "final"
      : t.includes("in")
      ? "in_progress"
      : "scheduled";

  return {
    gameId: String(event.id),
    dateUtc: String(event.date),
    status,
    home: {
      id: String(home.team.id),
      name: String(home.team.displayName),
      score: home.score != null ? Number(home.score) : undefined
    },
    away: {
      id: String(away.team.id),
      name: String(away.team.displayName),
      score: away.score != null ? Number(away.score) : undefined
    },
    venue: c.venue?.fullName
  };
}

export async function getLastAndNextGame(
  sport: "nba" | "nfl" | "mlb",
  teamId: string
) {
  let next: GameSummary | null = null;
  let last: GameSummary | null = null;

  // NEXT GAME
  try {
    const scheduleUrl = `${ESPN_BASE}/${sportPath(sport)}/teams/${teamId}/schedule`;
    const data = await fetchJSON(scheduleUrl);
    const games = (data.events ?? [])
      .map(normalize)
      .filter(Boolean) as GameSummary[];

    next =
      games
        .filter(g => g.status === "scheduled")
        .sort((a, b) => (a.dateUtc > b.dateUtc ? 1 : -1))[0] ?? null;
  } catch {}

  // LAST GAME (look back 14 days)
  const today = new Date();
  for (let i = 0; i < 14 && !last; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
    const url = `${ESPN_BASE}/${sportPath(sport)}/scoreboard?dates=${dateStr}`;

    try {
      const data = await fetchJSON(url);
      const games = (data.events ?? [])
        .map(normalize)
        .filter(Boolean) as GameSummary[];

      last =
        games
          .filter(
            g => g.status === "final" &&
            (g.home.id === teamId || g.away.id === teamId)
          )
          .sort((a, b) => (a.dateUtc < b.dateUtc ? 1 : -1))[0] ?? null;
    } catch {}
  }

  return { last, next };
}
