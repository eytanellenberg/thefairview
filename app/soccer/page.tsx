import { buildSoccerSnapshot } from "@/lib/soccerSnapshot";

export default async function SoccerPage() {
  const data = await buildSoccerSnapshot();

  const games = data.snapshot
    .filter((e: any) => e.lastGame)
    .sort(
      (a: any, b: any) =>
        b.lastGame.dateUtc.localeCompare(a.lastGame.dateUtc)
    );

  return (
    <main className="p-6 max-w-5xl mx-auto text-gray-900 bg-white">
      <h1 className="text-2xl font-semibold mb-2">
        Soccer — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        One card per match. Pre-game readiness (RAI) explains what was expected.
        Post-game execution (PAI) explains what actually decided the match.
      </p>

      <h2 className="text-lg font-semibold mb-4">Recent matches</h2>

      {games.length === 0 && (
        <p className="text-sm text-gray-500">
          No matches available yet. Soccer teams will appear here once ESPN data
          is connected.
        </p>
      )}

      {games.map((entry: any, index: number) => (
        <div
          key={index}
          className="border rounded-lg p-4 mb-4 bg-white shadow-sm"
        >
          <h3 className="font-medium mb-1">
            {entry.team.name} vs {entry.lastGame.opponent}
          </h3>

          <p className="text-sm mb-3">
            Final score: {entry.lastGame.score}
          </p>

          {/* 🔵 RAI */}
          {entry.comparativeRAI && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-1">
                Pregame — Comparative Readiness (RAI)
              </h4>

              <p className="text-sm mb-1">
                RAI edge:{" "}
                <strong>
                  {entry.comparativeRAI.edgeTeam} +
                  {entry.comparativeRAI.delta}
                </strong>
              </p>

              <ul className="list-disc ml-5 text-sm">
                {entry.comparativeRAI.levers.map(
                  (l: any, i: number) => (
                    <li key={i}>
                      {l.lever}: {l.advantage} +{l.value}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* 🔴 PAI */}
          {entry.comparativePAI && (
            <div className="mb-2">
              <h4 className="font-semibold text-sm mb-1">
                Postgame — Comparative Execution (PAI)
              </h4>

              <ul className="list-disc ml-5 text-sm">
                {entry.comparativePAI.levers.map(
                  (l: any, i: number) => (
                    <li key={i}>
                      {l.lever}: {l.status}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <p className="text-sm italic text-gray-600">
            {entry.comparativePAI?.conclusion}
          </p>
        </div>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
