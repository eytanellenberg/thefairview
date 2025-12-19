import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastGame } from "@/lib/providers/espn";

export async function buildNBASnapshot() {
  const snapshot: any[] = [];

  for (const team of NBA_TEAMS) {
    const last = await getLastGame("nba", team.id);
    if (!last) continue;

    const isHome = last.home.id === team.id;
    const opponent = isHome ? last.away : last.home;

    // 🔵 RAI — pregame (structurel, minimal)
    const delta = 3;

    const comparativeRAI = {
      delta,
      sign: delta >= 0 ? "+" : "−",
      levers: [
        { lever: "Offensive spacing", effect: "+", value: 2 },
        { lever: "Shot quality creation", effect: "+", value: 3 },
        { lever: "Defensive matchup stress", effect: "−", value: 2 },
      ],
    };

    // 🔴 PAI — postgame (factuel, last game only)
    const comparativePAI = {
      levers: [
        { lever: "Offensive execution", status: "Weakened vs expectation" },
        { lever: "Shot conversion", status: "Below baseline" },
        { lever: "Defensive resistance", status: "Confirmed as expected" },
      ],
      conclusion:
        "Postgame execution assessed relative to pregame structural readiness.",
    };

    snapshot.push({
      team: {
        id: team.id,
        name: team.name,
      },
      lastGame: {
        dateUtc: last.dateUtc,
        opponent: opponent.name,
        score:
          last.home.score && last.away.score
            ? `${last.home.score} – ${last.away.score}`
            : "—",
      },
      comparativeRAI,
      comparativePAI,
    });
  }

  return {
    sport: "NBA",
    updatedAt: new Date().toISOString(),
    snapshot,
  };
}
