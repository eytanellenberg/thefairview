/* ================= TYPES ================= */

export type NormalizedTeam = {
  name: string;
  abbr?: string;
  score: number | null;
};

export type NormalizedGame = {
  id: string;
  dateUtc: string;
  status: "FINAL" | "SCHEDULED" | "IN_PROGRESS" | "UNKNOWN";
  home: NormalizedTeam;
  away: NormalizedTeam;
  winner: "HOME" | "AWAY" | null;
};

/* ================= FETCH ================= */

async function fetchScoreboard(path: string) {
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("ESPN fetch failed");
  return res.json();
}

/* ================= NORMALIZATION ================= */

function parseStatus(ev: any): NormalizedGame["status"] {
  const t = ev?.competitions?.[0]?.status?.type;
  if (t?.completed) return "FINAL";
  if (t?.state === "in") return "IN_PROGRESS";
  if (t?.state === "pre") return "SCHEDULED";
  return "UNKNOWN";
}

function normalizeEvent(ev: any): NormalizedGame | null {
  const comp = ev?.competitions?.[0];
  if (!comp) return null;

  const home = comp.competitors?.find((c: any) => c.homeAway === "home");
  const away = comp.competitors?.find((c: any) => c.homeAway === "away");
  if (!home || !away) return null;

  let winner: "HOME" | "AWAY" | null = null;
  if (home.winner) winner = "HOME";
  if (away.winner) winner = "AWAY";

  return {
    id: String(ev.id),
    dateUtc: ev.date,
    status: parseStatus(ev),
    home: {
      name: home.team.displayName,
      abbr: home.team.abbreviation,
      score: home.score ? Number(home.score) : null,
    },
    away: {
      name: away.team.displayName,
      abbr: away.team.abbreviation,
      score: away.score ? Number(away.score) : null,
    },
    winner,
  };
}

/* ================= LEAGUE EXPORTS ================= */

export async function getNBAGames(): Promise<NormalizedGame[]> {
  const json = await fetchScoreboard("basketball/nba");
  return json.events.map(normalizeEvent).filter(Boolean);
}

export async function getNFLGames(): Promise<NormalizedGame[]> {
  const json = await fetchScoreboard("football/nfl");
  return json.events.map(normalizeEvent).filter(Boolean);
}

export async function getSoccerGames(
  league = "soccer/fra.1"
): Promise<NormalizedGame[]> {
  const json = await fetchScoreboard(league);
  return json.events.map(normalizeEvent).filter(Boolean);
}

/* ================= BACKWARD COMPAT ================= */

export async function getLastAndNextGame(leagueKey: string) {
  let games: NormalizedGame[] = [];

  if (leagueKey === "nba") games = await getNBAGames();
  else if (leagueKey === "nfl") games = await getNFLGames();
  else if (leagueKey.startsWith("soccer")) {
    const [, lg] = leagueKey.split(":");
    games = await getSoccerGames(lg || "soccer/fra.1");
  }

  const now = Date.now();
  const sorted = [...games].sort(
    (a, b) => new Date(a.dateUtc).getTime() - new Date(b.dateUtc).getTime()
  );

  const last =
    [...sorted].reverse().find((g) => g.status === "FINAL") || null;

  const next =
    sorted.find(
      (g) =>
        new Date(g.dateUtc).getTime() > now && g.status !== "FINAL"
    ) || null;

  return { last, next };
}

export async function getLastSoccerGame(
  league = "soccer/fra.1"
): Promise<NormalizedGame | null> {
  const games = await getSoccerGames(league);
  const finals = games.filter((g) => g.status === "FINAL");
  finals.sort(
    (a, b) => new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime()
  );
  return finals[0] || null;
                 }
