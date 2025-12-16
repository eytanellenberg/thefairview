import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

export async function buildNBASnapshot() {
  const snapshot: any[] = [];

  for (const team of NBA_TEAMS) {
    try {
      const { last, next } = await getLastAndNextGame("nba", team.id);

      snapshot.push({
        team,

        lastGame: last
          ? {
              dateUtc: last.dateUtc,
              score:
                last.home.id === team.id
                  ? `${last.home.score} – ${last.away.score}`
                  : `${last.away.score} – ${last.home.score}`,
              opponent:
                last.home.id === team.id
                  ? last.away.name
                  : last.home.name,
              opponentId:
                last.home.id === team.id
                  ? last.away.id
                  : last.home.id
            }
          : null,

        nextGame: next
          ? {
              dateUtc: next.dateUtc,
              opponent:
                next.home.id === team.id
                  ? next.away.name
                  : next.home.name,
              opponentId:
                next.home.id === team.id
                  ? next.away.id
                  : next.home.id
            }
          : null,

        // FREE MODE — static comparative placeholders
        comparativeRAI: next
          ? {
              delta: 0,
              levers: [
                { lever: "Offensive spacing", team: team.name, value: 2 },
                { lever: "PnR stress", team: "Opponent", value: 3 },
                { lever: "Shot quality", team: team.name, value: 1 }
              ]
            }
          : null,

        comparativePAI: last
          ? {
              delta: 0,
              levers: [
                { lever: "Offensive spacing", status: "Affaibli" },
                { lever: "PnR stress", status: "Confirmé" },
                { lever: "Shot quality", status: "Affaibli" }
              ],
              conclusion: "Victory despite weak structural execution"
            }
          : null
      });
    } catch {}
  }

  return {
    sport: "NBA",
    updatedAt: new Date().toISOString(),
    snapshot
  };
}
