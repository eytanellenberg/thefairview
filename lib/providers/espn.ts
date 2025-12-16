export type GameSummary = {
  gameId: string;
  dateUtc: string;
  status: "final" | "scheduled" | "in_progress";
  home: { id: string; name: string; score?: number };
  away: { id: string; name: string; score?: number };
  venue?: string;
};

export type TeamBoxStats = {
  teamId: string;
  teamName: string;

  points?: number;

  // Shooting (as decimals 0..1)
  fgPct?: number;
  tpPct?: number;
  ftPct?: number;

  // Volume
  fga?: number;
  tpa?: number;

  // Playmaking + boards
  ast?: number;
  tov?: number;
  reb?: number;

  // Interior / style proxies
  paintPts?: number;
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
  if (!home || !away) return null;

  const t = event.status?.type?.name?.toLowerCase?.() ?? "";
  const status =
    t.includes("final") ? "final" : t.includes("in") ? "in_progress" : "scheduled";

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

/**
 * ESPN strategy (robust):
 * - NEXT game -> team schedule
 * - LAST game -> scoreboard over recent days
 */
export async function getLastAndNextGame(
  sport: "nba" | "nfl" | "mlb",
  teamId: string
) {
  // -----------------------
  // NEXT GAME (schedule)
  // -----------------------
  let next: GameSummary | null = null;

  try {
    const scheduleUrl = `${ESPN_BASE}/${sportPath(sport)}/teams/${teamId}/schedule`;
    const scheduleData = await fetchJSON(scheduleUrl);

    const scheduleGames = (scheduleData.events ?? [])
      .map(normalize)
      .filter(Boolean) as GameSummary[];

    next =
      scheduleGames
        .filter(g => g.status === "scheduled")
        .sort((a, b) => (a.dateUtc > b.dateUtc ? 1 : -1))[0] ?? null;
  } catch {
    next = null;
  }

  // -----------------------
  // LAST GAME (scoreboard)
  // -----------------------
  let last: GameSummary | null = null;
  const today = new Date();

  // look back up to 14 days (safe for season start)
  for (let i = 0; i < 14 && !last; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
    const scoreboardUrl = `${ESPN_BASE}/${sportPath(sport)}/scoreboard?dates=${dateStr}`;

    try {
      const scoreboardData = await fetchJSON(scoreboardUrl);
      const games = (scoreboardData.events ?? [])
        .map(normalize)
        .filter(Boolean) as GameSummary[];

      const teamGames = games.filter(
        g => g.home.id === teamId || g.away.id === teamId
      );

      last =
        teamGames
          .filter(g => g.status === "final")
          .sort((a, b) => (a.dateUtc < b.dateUtc ? 1 : -1))[0] ?? null;
    } catch {
      // ignore date fetch errors
    }
  }

  return { last, next };
}

/**
 * Get recent FINAL games from team schedule (used for rolling averages)
 */
export async function getRecentFinalGames(
  sport: "nba" | "nfl" | "mlb",
  teamId: string,
  limit = 5
): Promise<GameSummary[]> {
  try {
    const scheduleUrl = `${ESPN_BASE}/${sportPath(sport)}/teams/${teamId}/schedule`;
    const scheduleData = await fetchJSON(scheduleUrl);

    const games = (scheduleData.events ?? [])
      .map(normalize)
      .filter(Boolean) as GameSummary[];

    return games
      .filter(g => g.status === "final")
      .sort((a, b) => (a.dateUtc < b.dateUtc ? 1 : -1))
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * ESPN Game Summary endpoint gives boxscore-like stats
 * https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=GAME_ID
 */
export async function getGameBoxscore(
  sport: "nba" | "nfl" | "mlb",
  gameId: string
) {
  const url = `${ESPN_BASE}/${sportPath(sport)}/summary?event=${gameId}`;
  return fetchJSON(url);
}

function parsePct(v: any): number | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  // could be "47.2" or "0.472" or "47.2%"
  const num = Number(s.replace("%", ""));
  if (Number.isNaN(num)) return undefined;
  return num > 1 ? num / 100 : num;
}

function parseNum(v: any): number | undefined {
  if (v == null) return undefined;
  const num = Number(String(v).replace("%", ""));
  return Number.isNaN(num) ? undefined : num;
}

/**
 * Extract minimal team stats from ESPN summary response
 * Robust to different field labels.
 */
export function extractTeamStatsFromBoxscore(
  summaryJson: any
): TeamBoxStats[] {
  const teams = summaryJson?.boxscore?.teams;
  if (!Array.isArray(teams)) return [];

  return teams.map((t: any) => {
    const teamId = String(t?.team?.id ?? "");
    const teamName = String(t?.team?.displayName ?? t?.team?.name ?? "");

    // ESPN boxscore stats often appear like:
    // t.statistics = [{ name: "fgPct", displayValue: "47.2" }, ...]
    const statsArr = Array.isArray(t?.statistics) ? t.statistics : [];

    const byName = new Map<string, any>();
    for (const s of statsArr) {
      const key = String(s?.name ?? s?.label ?? "").toLowerCase();
      byName.set(key, s?.displayValue ?? s?.value);
    }

    const fgPct = parsePct(byName.get("fgpct") ?? byName.get("fieldgoalpct"));
    const tpPct = parsePct(byName.get("3ptpct") ?? byName.get("threepointpct") ?? byName.get("tppct"));
    const ftPct = parsePct(byName.get("ftpct") ?? byName.get("freethrowpct"));

    const fga = parseNum(byName.get("fga") ?? byName.get("fieldgoalsattempted"));
    const tpa = parseNum(byName.get("3pta") ?? byName.get("threepointattempts") ?? byName.get("tpa"));

    const ast = parseNum(byName.get("assists") ?? byName.get("ast"));
    const tov = parseNum(byName.get("turnovers") ?? byName.get("to"));
    const reb = parseNum(byName.get("rebounds") ?? byName.get("reb"));

    const points = parseNum(t?.score ?? summaryJson?.header?.competitions?.[0]?.competitors?.find((c: any) => String(c?.team?.id) === teamId)?.score);

    // points in paint sometimes exists in summaryJson.gameInfo or plays; not always.
    // try common paths (if present)
    const paintPts =
      parseNum(byName.get("pointsinpaint")) ??
      parseNum(byName.get("paintpoints")) ??
      parseNum(t?.statistics?.find((x: any) => String(x?.name).toLowerCase().includes("paint"))?.displayValue);

    return {
      teamId,
      teamName,
      points,
      fgPct,
      tpPct,
      ftPct,
      fga,
      tpa,
      ast,
      tov,
      reb,
      paintPts
    };
  });
}
