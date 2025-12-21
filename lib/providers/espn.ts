/* =========================================================
   ESPN PROVIDER — NORMALISATION UNIQUE
   Compatible NBA / NFL / Soccer
   + Backward compatibility (getLastAndNextGame)
   ========================================================= */

export type ESPNCompetitor = {
  id?: string;
  type?: "home" | "away";
  homeAway?: "home" | "away";
  team?: {
    displayName?: string;
    shortDisplayName?: string;
    abbreviation?: string;
  };
  score?: string;
  winner?: boolean;
};

export type ESPNCompetition = {
  date?: string;
  competitors?: ESPNCompetitor[];
  status?: {
    type?: {
      name?: string;
      state?: string; // pre | in | post
      completed?: boolean;
    };
  };
};

export type ESPNEvent = {
  id?: string;
  date?: string;
  competitions?: ESPNCompetition[];
};

/* ================= NORMALIZED TYPES ================= */

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

/* ================= HELPERS ================= */

function numScore(s?: string): number | null {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toStatus(ev: ESPNEvent): NormalizedGame["status"] {
  const t = ev.competitions?.[0]?.status?.type;
  const name = (t?.name || "").toUpperCase();
  const state = (t?.state || "").toLowerCase();

  if (t?.completed || name.includes("FINAL") || state === "post") return "FINAL";
  if (state === "pre") return "SCHEDULED";
  if (state === "in") return "IN_PROGRESS";
  return "UNKNOWN";
}

function pickTeams(ev: ESPNEvent) {
  const comps = ev.competitions?.[0];
  const c = comps?.competitors || [];

  const home =
    c.find((x) => x.homeAway === "home" || x.type === "home") || null;
  const away =
    c.find((x) => x.homeAway === "away" || x.type === "away") || null;

  const homeScore = numScore(home?.score);
  const awayScore = numScore(away?.score);

  let winner: NormalizedGame["winner"] = null;
  if (home?.winner) winner = "HOME";
  if (away?.winner) winner = "AWAY";
  if (!winner && homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) winner = "HOME";
    if (awayScore > homeScore) winner = "AWAY";
  }

  return {
    home: {
      name:
        home?.team?.displayName ||
        home?.team?.shortDisplayName ||
        "Home",
      abbr: home?.team?.abbreviation,
      score: homeScore,
    },
    away: {
      name:
        away?.team?.displayName ||
        away?.team?.shortDisplayName ||
        "Away",
      abbr: away?.team?.abbreviation,
      score: awayScore,
    },
    winner,
  };
}

/* ================= FETCH ================= */

async function fetchScoreboard(
  league: string,
  params: Record<string, string> = {}
): Promise<ESPNEvent[]> {
  const url = new URL(
    `https://site.api.espn.com/apis/site/v2/sports/${league}/scoreboard`
  );

  Object.entries(params).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );

  const res = await fetch(url.toString(), {
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error("ESPN fetch error");
  const json = await res.json();
  return (json?.events || []) as ESPNEvent[];
}

function normalize(events: ESPNEvent[]): NormalizedGame[] {
  return events
    .map((ev) => {
      const id = String(ev.id || "");
      const dateUtc =
        String(ev.date || ev.competitions?.[0]?.date || "");
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

/* ================= PUBLIC API ================= */

export async function getNBAGames(): Promise<NormalizedGame[]> {
  const events = await fetchScoreboard("basketball/nba");
  return normalize(events);
}

export async function getNFLGames(): Promise<NormalizedGame[]> {
  const events = await fetchScoreboard("football/nfl");
  return normalize(events);
}

export async function getSoccerGames(
  league = "soccer/fra.1"
): Promise<NormalizedGame[]> {
  const events = await fetchScoreboard(league);
  return normalize(events);
}

/* ======================================================
   ✅ BACKWARD COMPAT — REQUIRED FOR BUILD
   ====================================================== */

export async function getLastAndNextGame(leagueKey: string) {
  let games: NormalizedGame[] = [];

  if (leagueKey === "nba") games = await getNBAGames();
  else if (leagueKey === "nfl") games = await getNFLGames();
  else if (leagueKey.startsWith("soccer")) {
    const lg = leagueKey.split(":")[1] || "soccer/fra.1";
    games = await getSoccerGames(lg);
  } else {
    games = await getNBAGames();
  }

  const now = Date.now();

  const sorted = [...games].sort(
    (a, b) =>
      new Date(a.dateUtc).getTime() -
      new Date(b.dateUtc).getTime()
  );

  const last =
    [...sorted]
      .reverse()
      .find(
        (g) =>
          g.status === "FINAL" &&
          new Date(g.dateUtc).getTime() <= now
      ) || null;

  const next =
    sorted.find(
      (g) =>
        g.status !== "FINAL" &&
        new Date(g.dateUtc).getTime() > now
    ) || null;

  return { last, next };
}

export async function getLastSoccerGame(
  league = "soccer/fra.1"
) {
  const games = await getSoccerGames(league);
  const finals = games.filter((g) => g.status === "FINAL");
  finals.sort(
    (a, b) =>
      new Date(b.dateUtc).getTime() -
      new Date(a.dateUtc).getTime()
  );
  return finals[0] || null;
    }
