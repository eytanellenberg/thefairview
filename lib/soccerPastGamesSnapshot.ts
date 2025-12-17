const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports";

/**
 * Soccer past games snapshot (NBA-like behavior)
 * Looks BACK over the last X days to find played matches
 */
export async function buildSoccerPastGamesSnapshot(
  leagueCode: string,
  lookbackDays: number = 14
) {
  const matches: any[] = [];
  const seen = new Set<string>();

  const today = new Date();

  for (let i = 0; i < lookbackDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dateStr = d
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    try {
      const url = `${ESPN_BASE}/soccer/${leagueCode}/scoreboard?dates=${dateStr}`;
      const res = await fetch(url, { next: { revalidate: 1800 } });
      if (!res.ok) continue;

      const data = await res.json();
      const events = data?.events ?? [];

      for (const event of events) {
        if (seen.has(event.id)) continue;

        const c = event?.competitions?.[0];
        if (!c) continue;

        const home = c.competitors.find(
          (x: any) => x.homeAway === "home"
        );
        const away = c.competitors.find(
          (x: any) => x.homeAway === "away"
        );
        if (!home || !away) continue;

        const statusRaw =
          event.status?.type?.name?.toLowerCase?.() ?? "";

        if (!statusRaw.includes("final")) continue;

        seen.add(event.id);

        const homeName = home.team.displayName;
        const awayName = away.team.displayName;

        // 🔵 RAI — pregame (proxy, NBA-like)
        const comparativeRAI = {
          delta: 3,
          edgeTeam: homeName,
          levers: [
            { lever: "Chance creation", advantage: homeName, value: 2 },
            { lever: "Defensive organization", advantage: awayName, value: 2 },
            { lever: "Game control", advantage: homeName, value: 3 }
          ],
          interpretation:
            "Slight structural edge expected based on attacking balance and control."
        };

        // 🔴 PAI — postgame (NBA-like)
        const comparativePAI = {
          teams: [
            {
              team: homeName,
              levers: [
                { lever: "Chance creation", status: "Confirmed as expected" },
                { lever: "Defensive organization", status: "Weakened vs expectation" },
                { lever: "Game control", status: "Confirmed as expected" }
              ]
            },
            {
              team: awayName,
              levers: [
                { lever: "Chance creation", status: "Weakened vs expectation" },
                { lever: "Defensive organization", status: "Confirmed as expected" },
                { lever: "Game control", status: "Weakened vs expectation" }
              ]
            }
          ],
          conclusion:
            "Outcome driven by execution gaps rather than pure structural mismatch."
        };

        matches.push({
          match: {
            id: String(event.id),
            dateUtc: String(event.date),
            score: `${home.score} – ${away.score}`,
            home: { id: String(home.team.id), name: homeName },
            away: { id: String(away.team.id), name: awayName },
            venue: c.venue?.fullName
          },
          comparativeRAI,
          comparativePAI
        });
      }
    } catch {
      // silent
    }

    // Stop early once we have enough matches
    if (matches.length >= 10) break;
  }

  return {
    league: leagueCode,
    updatedAt: new Date().toISOString(),
    matches
  };
}
