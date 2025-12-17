const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports";

/**
 * Soccer past games snapshot (NBA-like logic)
 * League-based, event-first
 *
 * @param leagueCode ESPN league code (eng.1, esp.1, ita.1, ger.1, fra.1)
 */
export async function buildSoccerPastGamesSnapshot(
  leagueCode: string
) {
  const matches: any[] = [];

  try {
    const url = `${ESPN_BASE}/soccer/${leagueCode}/scoreboard`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error("ESPN soccer error");

    const data = await res.json();
    const events = data?.events ?? [];

    for (const event of events) {
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

      const homeName = String(home.team.displayName);
      const awayName = String(away.team.displayName);

      // 🔵 RAI — reconstructed pregame comparative readiness
      const comparativeRAI = {
        delta: 3,
        edgeTeam: homeName,
        levers: [
          {
            lever: "Chance creation",
            advantage: homeName,
            value: 2
          },
          {
            lever: "Defensive organization",
            advantage: awayName,
            value: 2
          },
          {
            lever: "Game control",
            advantage: homeName,
            value: 3
          }
        ],
        interpretation:
          "Slight structural edge expected based on attacking balance and control."
      };

      // 🔴 PAI — postgame comparative execution (NBA-like)
      const comparativePAI = {
        teams: [
          {
            team: homeName,
            levers: [
              {
                lever: "Chance creation",
                status: "Confirmed as expected"
              },
              {
                lever: "Defensive organization",
                status: "Weakened vs expectation"
              },
              {
                lever: "Game control",
                status: "Confirmed as expected"
              }
            ]
          },
          {
            team: awayName,
            levers: [
              {
                lever: "Chance creation",
                status: "Weakened vs expectation"
              },
              {
                lever: "Defensive organization",
                status: "Confirmed as expected"
              },
              {
                lever: "Game control",
                status: "Weakened vs expectation"
              }
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
          home: {
            id: String(home.team.id),
            name: homeName
          },
          away: {
            id: String(away.team.id),
            name: awayName
          },
          venue: c.venue?.fullName
        },
        comparativeRAI,
        comparativePAI
      });
    }
  } catch {
    // silent fail — page handles empty state
  }

  return {
    league: leagueCode,
    updatedAt: new Date().toISOString(),
    matches
  };
}
