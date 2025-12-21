export type ESPNGame = {
  id: string;
  status: {
    type: {
      name: string;
    };
  };
  competitors: {
    homeAway: "home" | "away";
    team: { displayName: string };
    score: string;
  }[];
};

export async function getNBALastGames(): Promise<ESPNGame[]> {
  const url =
    "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";

  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();

  return (json.events || [])
    .filter((e: any) => e.status?.type?.name === "STATUS_FINAL")
    .map((e: any) => ({
      id: e.id,
      status: e.status,
      competitors: e.competitions[0].competitors.map((c: any) => ({
        homeAway: c.homeAway,
        team: { displayName: c.team.displayName },
        score: c.score,
      })),
    }));
}
