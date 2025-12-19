// lib/nflBigScore.ts

export type NFLLastGameTeam = {
  team: string;
  opponent: string;
  score: string;
  isHome: boolean;
};

export type NFLBigScoreSnapshot = {
  sport: "nfl";
  updatedAt: string;
  teams: NFLLastGameTeam[];
};

/**
 * Fetches NFL scoreboard from ESPN and returns
 * ONE last game per team (real data).
 */
export async function computeNFLBigScoreSnapshot(): Promise<NFLBigScoreSnapshot> {
  const url =
    "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      // 🚨 REQUIRED for Vercel / ESPN
      "User-Agent":
        "Mozilla/5.0 (compatible; FAIR-Analytics/1.0; +https://thefairview.app)",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch NFL scoreboard");
  }

  const data = await res.json();
  const events = Array.isArray(data?.events) ? data.events : [];

  const teamsMap = new Map<string, NFLLastGameTeam>();

  for (const event of events) {
    const competition = event?.competitions?.[0];
    if (!competition) continue;

    const competitors = competition.competitors;
    if (!Array.isArray(competitors) || competitors.length !== 2) continue;

    const home = competitors.find((c: any) => c.homeAway === "home");
    const away = competitors.find((c: any) => c.homeAway === "away");

    if (!home || !away) continue;

    const homeTeam = home.team?.displayName;
    const awayTeam = away.team?.displayName;

    const homeScore = Number(home.score);
    const awayScore = Number(away.score);

    if (!homeTeam || !awayTeam) continue;
    if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) continue;

    const scoreLine = `${homeScore} – ${awayScore}`;

    // Home team entry
    if (!teamsMap.has(homeTeam)) {
      teamsMap.set(homeTeam, {
        team: homeTeam,
        opponent: awayTeam,
        score: scoreLine,
        isHome: true,
      });
    }

    // Away team entry
    if (!teamsMap.has(awayTeam)) {
      teamsMap.set(awayTeam, {
        team: awayTeam,
        opponent: homeTeam,
        score: scoreLine,
        isHome: false,
      });
    }
  }

  return {
    sport: "nfl",
    updatedAt: new Date().toISOString(),
    teams: Array.from(teamsMap.values()).sort((a, b) =>
      a.team.localeCompare(b.team)
    ),
  };
}
