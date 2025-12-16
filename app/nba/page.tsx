import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export const revalidate = 300;

type TeamBlock = any;

function matchKey(game: any) {
  if (!game) return null;
  return `${game.dateUtc}-${game.opponent}`;
}

export default async function NBAPage() {
  const data = await buildNBASnapshot();
  const teams: TeamBlock[] = data.snapshot;

  const playedMatches: Record<string, any> = {};
  const upcomingMatches: Record<string, any> = {};

  // ----------------------------
  // BUILD MATCH GROUPS
  // ----------------------------
  teams.forEach(team => {
    // POSTGAME
    if (team.lastGame && team.comparativePAI) {
      const key = matchKey(team.lastGame);
      if (!key) return;

      if (!playedMatches[key]) {
        playedMatches[key] = {
          type: "played",
          teams: [],
          game: team.lastGame
        };
      }

      playedMatches[key].teams.push(team);
    }

    // PREGAME
    if (team.nextGame && team.comparativeRAI) {
      const key = matchKey(team.nextGame);
      if (!key) return;

      if (!upcomingMatches[key]) {
        upcomingMatches[key] = {
          type: "upcoming",
          teams: [],
          game: team.nextGame
        };
      }

      upcomingMatches[key].teams.push(team);
    }
  });

  // 👉 KEEP ONLY COMPLETE MATCHES (2 TEAMS)
  const played = Object.values(playedMatches).filter(
    (m: any) => m.teams.length === 2
  );

  const upcoming = Object.values(upcomingMatches).filter(
    (m: any) => m.teams.length === 2
  );

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="p-6 max-w-6xl mx-auto text-sm space-y-12">

        <header>
          <h1 className="text-2xl font-semibold">
            NBA — Match-based FAIR Analysis
          </h1>
          <p className="text-gray-600 mt-2">
            One card per match. Post-game execution (PAI) explains what happened.
            Pre-game readiness (RAI) explains what was expected.
          </p>
        </header>

        {/* ========================= */}
        {/* PLAYED MATCHES */}
        {/* ========================= */}
        <section className="space-y-8">
          <h2 className="text-xl font-medium">Played matches</h2>

          {played.map((match: any, i) => {
            const [a, b] = match.teams;

            return (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-5 space-y-4"
              >
                <h3 className="font-semibold text-base">
                  {a.team.name} vs {b.team.name}
                </h3>

                <p className="text-gray-700">
                  Final score: <strong>{match.game.score}</strong>
                </p>

                {/* PAI COMPARATIVE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[a, b].map(t => (
                    <div key={t.team.id}>
                      <h4 className="font-medium">
                        {t.team.name} — PAI {t.comparativePAI.value}
                      </h4>

                      <ul className="list-disc ml-5 mt-1">
                        {t.comparativePAI.observedLevers.map((l: any) => (
                          <li key={l.lever}>
                            <strong>{l.lever}</strong>{" "}
                            {l.contribution > 0 ? "+" : ""}
                            {l.contribution}
                            {l.status &&
                              l.status !== "as_expected" && (
                                <span className="ml-1 text-xs text-gray-500">
                                  ({l.status})
                                </span>
                              )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* MATCH CONCLUSION */}
                <div className="italic text-gray-600 pt-2 border-t">
                  {(() => {
                    if (
                      a.comparativePAI.value > 50 &&
                      b.comparativePAI.value < 50
                    ) {
                      return `${a.team.name} wins logically on structural execution.`;
                    }
                    if (
                      a.comparativePAI.value < 50 &&
                      b.comparativePAI.value > 50
                    ) {
                      return `${b.team.name} wins logically on structural execution.`;
                    }
                    if (
                      a.comparativePAI.value < 50 &&
                      b.comparativePAI.value < 50
                    ) {
                      return `Victory driven by non-structural factors despite limited execution quality.`;
                    }
                    return `Defeat despite good structural execution; outcome driven by non-structural factors.`;
                  })()}
                </div>
              </div>
            );
          })}
        </section>

        {/* ========================= */}
        {/* UPCOMING MATCHES */}
        {/* ========================= */}
        <section className="space-y-8">
          <h2 className="text-xl font-medium">Upcoming matches</h2>

          {upcoming.map((match: any, i) => {
            const [a, b] = match.teams;

            return (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-5 space-y-4"
              >
                <h3 className="font-semibold text-base">
                  {a.team.name} vs {b.team.name}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[a, b].map(t => (
                    <div key={t.team.id}>
                      <h4 className="font-medium">
                        {t.team.name} — RAI {t.comparativeRAI.value}
                      </h4>

                      <ul className="list-disc ml-5 mt-1">
                        {t.comparativeRAI.expectedLevers.map((l: any) => (
                          <li key={l.lever}>
                            <strong>{l.lever}</strong>{" "}
                            {l.contribution > 0 ? "+" : ""}
                            {l.contribution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <p className="italic text-gray-600 pt-2 border-t">
                  Pre-game hypothesis based on comparative structural readiness.
                </p>
              </div>
            );
          })}
        </section>

        <footer className="text-xs text-gray-500 pt-8 border-t">
          FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
        </footer>
      </div>
    </main>
  );
}
