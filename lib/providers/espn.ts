export type ESPNCompetitor = {
  id?: string;
  uid?: string;
  type?: "home" | "away";
  homeAway?: "home" | "away";
  team?: { id?: string; displayName?: string; shortDisplayName?: string; abbreviation?: string };
  score?: string;
  winner?: boolean;
};

export type ESPNCompetition = {
  date?: string;
  competitors?: ESPNCompetitor[];
  status?: {
    type?: {
      name?: string; // "STATUS_FINAL", "STATUS_SCHEDULED", etc (varie)
      state?: string; // "post", "pre", "in"
      completed?: boolean;
      description?: string;
    };
  };
};

export type ESPNEvent = {
  id?: string;
  date?: string;
  name?: string;
  shortName?: string;
  competitions?: ESPNCompetition[];
};

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
  // convenience
  winner: "HOME" | "AWAY" | null;
};

function toStatus(ev: ESPNEvent): NormalizedGame["status"] {
  const c0 = ev.competitions?.[0];
  const t = c0?.status?.type;
  const completed = !!t?.completed;

  const name = (t?.name || "").toUpperCase();
  const state = (t?.state || "").toLowerCase();

  if (completed || name.includes("FINAL") || state === "post") return "FINAL";
  if (name.includes("SCHEDULED") || state === "pre") return "SCHEDULED";
  if (state === "in" || name.includes("IN_PROGRESS") || name.includes("IN")) return "IN_PROGRESS";
  return "UNKNOWN";
}

function numScore(s?: string): number | null {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pickTeams(ev: ESPNEvent): { home: NormalizedTeam; away: NormalizedTeam; winner: NormalizedGame["winner"] } {
  const comps = ev.competitions?.[0];
  const competitors = comps?.competitors || [];

  const homeC =
    competitors.find((c) => c.homeAway === "home" || c.type === "home") ||
    competitors.find((c) => c.type === "home");
  const awayC =
    competitors.find((c) => c.homeAway === "away" || c.type === "away") ||
    competitors.find((c) => c.type === "away");

  const homeName = homeC?.team?.displayName || homeC?.team?.shortDisplayName || "Home";
  const awayName = awayC?.team?.displayName || awayC?.team?.shortDisplayName || "Away";

  const homeScore = numScore(homeC?.score);
  const awayScore = numScore(awayC?.score);

  let winner: NormalizedGame["winner"] = null;
  if (homeC?.winner === true) winner = "HOME";
  if (awayC?.winner === true) winner = "AWAY";
  // fallback si ESPN ne renvoie pas winner mais score final dispo
  if (!winner && homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) winner = "HOME";
    if (awayScore > homeScore) winner = "AWAY";
  }

  return {
    home: { name: homeName, abbr: homeC?.team?.abbreviation, score: homeScore },
    away: { name: awayName, abbr: awayC?.team?.abbreviation, score: awayScore },
    winner,
  };
}

async function fetchScoreboard(league: string, params: Record<string, string> = {}): Promise<ESPNEvent[]> {
  const url = new URL(`https://site.api.espn.com/apis/site/v2/sports/${league}/scoreboard`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`ESPN scoreboard error ${res.status} for ${league}`);
  const json = await res.json();
  return (json?.events || []) as ESPNEvent[];
}

function normalizeEvents(events: ESPNEvent[]): NormalizedGame[] {
  return events
    .map((ev) => {
      const id = String(ev.id || "");
      const dateUtc = String(ev.date || ev.competitions?.[0]?.date || "");
      if (!id || !dateUtc) return null;

      const status = toStatus(ev);
      const { home, away, winner } = pickTeams(ev);

      return {
        id,
        dateUtc,
        status,
        home,
        away,
        winner,
      } as NormalizedGame;
    })
    .filter(Boolean) as NormalizedGame[];
}

/** NBA: retourne les games normalisés du scoreboard (jour courant ESPN) */
export async function getNBAGames(): Promise<NormalizedGame[]> {
  const events = await fetchScoreboard("basketball/nba");
  return normalizeEvents(events);
}

/** NFL */
export async function getNFLGames(): Promise<NormalizedGame[]> {
  const events = await fetchScoreboard("football/nfl");
  return normalizeEvents(events);
}

/** Soccer (par défaut: soccer/fra.1 = Ligue 1 scoreboard ESPN) */
export async function getSoccerGames(league = "soccer/fra.1"): Promise<NormalizedGame[]> {
  const events = await fetchScoreboard(league);
  return normalizeEvents(events);
}

/**
 * Backward-compatible export attendu par tes routes/pages plus anciennes.
 * Renvoie { last, next } pour un "leagueKey".
 * leagueKey: "nba" | "nfl" | "soccer:fraction" ex "soccer/fra.1"
 */
export async function getLastAndNextGame(leagueKey: string) {
  let games: NormalizedGame[] = [];

  if (leagueKey === "nba") games = await getNBAGames();
  else if (leagueKey === "nfl") games = await getNFLGames();
  else if (leagueKey.startsWith("soccer")) {
    const parts = leagueKey.split(":");
    const lg = parts[1] || "soccer/fra.1";
    games = await getSoccerGames(lg);
  } else {
    // fallback
    games = await getNBAGames();
  }

  const now = Date.now();
  const sorted = [...games].sort((a, b) => new Date(a.dateUtc).getTime() - new Date(b.dateUtc).getTime());

  const last = [...sorted].reverse().find((g) => new Date(g.dateUtc).getTime() <= now && g.status === "FINAL") || null;
  const next = sorted.find((g) => new Date(g.dateUtc).getTime() > now && g.status !== "FINAL") || null;

  return { last, next };
}

/** Backward-compatible export attendu par soccerSnapshot.ts (ancien nom) */
export async function getLastSoccerGame(league = "soccer/fra.1") {
  const games = await getSoccerGames(league);
  const finals = games.filter((g) => g.status === "FINAL");
  finals.sort((a, b) => new Date(b.dateUtc).getTime() - new Date(a.dateUtc).getTime());
  return finals[0] || null;
}
