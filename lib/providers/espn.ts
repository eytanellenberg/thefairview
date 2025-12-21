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

/* ================= ESPN FETCH ================= */

async function fetchScoreboard(path: string) {
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("ESPN fetch failed");
  return res.json();
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

/* ================= PUBLIC EXPORTS ================= */

export async function getNBAGames(): Promise<NormalizedGame[]> {
  const json = await fetchScoreboard("basketball/nba");
  return json.events.map(normalize).filter(Boolean);
}

export async function getLastAndNextGame() {
  const games = await getNBAGames();
  const finals = games.filter((g) => g.status === "FINAL");
  return { last: finals[0] ?? null, next: null };
}
