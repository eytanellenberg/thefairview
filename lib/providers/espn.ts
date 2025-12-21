// lib/providers/espn.ts

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

/* ================= ESPN ================= */

async function fetchScoreboard(path: string, date?: string) {
  const url = new URL(
    `https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard`
  );
  if (date) url.searchParams.set("dates", date);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("ESPN fetch failed");
  return res.json();
}

function yyyymmdd(d: Date) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function parseStatus(ev: any): NormalizedGame["status"] {
  const t = ev?.competitions?.[0]?.status?.type;
  if (t?.completed) return "FINAL";
  if (t?.state === "in") return "IN_PROGRESS";
  if (t?.state === "pre") return "SCHEDULED";
  return "UNKNOWN";
}

function normalize(ev: any): NormalizedGame | null {
  const comp = ev?.competitions?.[0];
  if (!comp) return null;

  const home = comp.competitors.find((c: any) => c.homeAway === "home");
  const away = comp.competitors.find((c: any) => c.homeAway === "away");
  if (!home || !away) return null;

  let winner: "HOME" | "AWAY" | null = null;
  if (home.winner) winner = "HOME";
  if (away.winner) winner = "AWAY";

  return {
    id: ev.id,
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

/* ================= PUBLIC ================= */

export async function getNBAGames(): Promise<NormalizedGame[]> {
  const all: NormalizedGame[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const json = await fetchScoreboard("basketball/nba", yyyymmdd(d));
    const games = (json.events || []).map(normalize).filter(Boolean);
    all.push(...(games as NormalizedGame[]));

    if (all.some((g) => g.status === "FINAL")) break;
  }

  return all;
}

export async function getLastAndNextGame() {
  const games = await getNBAGames();
  const finals = games
    .filter((g) => g.status === "FINAL")
    .sort((a, b) => new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime());

  return {
    last: finals[0] ?? null,
    next: null,
  };
}
/* ================= NFL ================= */

export async function getNFLGames(): Promise<NormalizedGame[]> {
  const json = await fetchScoreboard("football/nfl");
  return json.events.map(normalize).filter(Boolean);
}
/* ================= SOCCER ================= */

export async function getSoccerGames(
  league: string = "soccer/fra.1"
): Promise<NormalizedGame[]> {
  const all: NormalizedGame[] = [];

  // On regarde jusqu'à 5 jours en arrière pour attraper les derniers matchs
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const json = await fetchScoreboard(league, yyyymmdd(d));
    const games = (json.events || [])
      .map(normalize)
      .filter(Boolean) as NormalizedGame[];

    all.push(...games);

    // Dès qu'on a des FINAL, on peut s'arrêter
    if (games.some((g) => g.status === "FINAL")) break;
  }

  return all;
}
