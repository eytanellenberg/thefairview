import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export const revalidate = 300;

type TeamBlock = any;

function getMatchKey(game: any) {
  if (!game) return null;
  return `${game.dateUtc}-${game.opponent}`;
}

export default async function NBAPage() {
  const data = await buildNBASnapshot();
  const teams: TeamBlock[] = data.snapshot;

  // ----------------------------
  // BUILD MATCHES (POSTGAME)
  // ----------------------------
  const playedMatches: Record<string, any> = {};

  teams.forEach(team => {
    if (!team.lastGame || !team.comparativePAI) return;

    const key = getMatchKey(team.lastGame);
    if (!key) return;

    if (!playedMatches[key]) {
      playedMatches[key] = {
        type: "played",
        teams: [],
        game: team.lastGame
      };
    }

    playedMatches[key].teams.push(team);
  });

  // ----------------------------
  // BUILD MATCHES (PREGAME)
  // ----------------------------
  const upcomingMatches: Record<string, any> = {};

  teams.forEach(team => {
    if (!team.nextGame || !team.comparativeRAI) return;

    const key = getMatchKey(team.nextGame);
    if (!key) return;

    if (!upcomingMatches[key]) {
      upcomingMatches[key] = {
        type: "upcoming",
        teams: [],
        game: team.nextGame
      };
    }

    upcomingMatches[key].teams.push(team);
  });

  const played = Object.values(playedMatches);
  const upcoming = Object.values(upcomingMatches);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="p-6 max-w-6xl mx-auto text-sm space-y-12">

        <header>
          <h1 className="text-2xl font-semibold">
            NBA — Match-based FAIR Analysis
          </h1>
          <p className="text-gray-600 mt-2">
            Each card represents a match. Post-game execution (PAI) explains what
            happened. Pre-game readiness (RAI) explains what was expected.
          </p>
        </header>

        {/* ========================= */}
        {/* PLAYED MATCHES */}
        {/* ========================= */}
        <section className="space-y-8">
          <h2 className="text-xl font-medium">Played matches</h2>

          {played.map((match: any, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-5 space-y-4"
            >
              <h3 className="font-semibold text-base">
                {match.teams[0]?.team.name} vs{" "}
                {match.teams[1]?.team.name}
              </h3>

              <p className="text-gray-700">
                Final score:{" "}
                <strong>{match.game.score}</strong>
              </p>

              {/* PAI COMPARATIVE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {match.teams.map((t: any) => (
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
                  const a = match.teams[0];
                  const b = match.teams[1];

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
          ))}
        </section>

        {/* ========================= */}
        {/* UPCOMING MATCHES */}
        {/* ========================= */}
        <section className="space-y-8">
          <h2 className="text-xl font-medium">Upcoming matches</h2>

          {upcoming.map((match: any, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-5 space-y-4"
            >
              <h3 className="font-semibold text-base">
                {match.teams[0]?.team.name} vs{" "}
                {match.teams[1]?.team.name}
              </h3>

              {/* RAI COMPARATIVE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {match.teams.map((t: any) => (
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
          ))}
        </section>

        <footer className="text-xs text-gray-500 pt-8 border-t">
          FAIR — structure over narrative · contact@thefairview.com
        </footer>
      </div>
    </main>
  );
}
