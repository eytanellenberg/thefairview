import { buildSoccerLeagueSnapshot } from "@/lib/soccerLeagueSnapshot";

export default async function SoccerPage() {
  const data = await buildSoccerLeagueSnapshot();
  const matches = data.snapshot ?? [];

  return (
    <main className="p-6 max-w-5xl mx-auto text-gray-900 bg-white">
      <h1 className="text-2xl font-semibold mb-2">
        Soccer — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        One card per match. Pre-game readiness (RAI) explains what was expected.
        Post-game execution (PAI) explains what actually decided the match.
      </p>

      <h2 className="text-lg font-semibold mb-4">
        Recent matches — {data.league}
      </h2>

      {matches.length === 0 && (
        <p className="text-sm text-gray-500">
          No matches available at the moment.
        </p>
      )}

      {matches.map((m: any, index: number) => (
        <div
          key={index}
          className="border rounded-lg p-4 mb-4 bg-white shadow-sm"
        >
          {/* Match header */}
          <h3 className="font-medium mb-1">
            {m.match.home.name} vs {m.match.away.name}
          </h3>

          <p className="text-sm mb-3">
            {m.match.status === "scheduled"
              ? "Scheduled match"
              : `Final score: ${m.match.home.score} – ${m.match.away.score}`}
          </p>

          {/* 🔵 RAI (always available) */}
          {m.comparativeRAI && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-1">
                Pregame — Comparative Readiness (RAI)
              </h4>

              <p className="text-sm mb-1">
                RAI edge:{" "}
                <strong>
                  {m.comparativeRAI.edgeTeam} +{m.comparativeRAI.delta}
                </strong>
              </p>

              <ul className="list-disc ml-5 text-sm">
                {m.comparativeRAI.levers.map(
                  (l: any, i: number) => (
                    <li key={i}>
                      {l.lever}: {l.advantage} +{l.value}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* 🔴 PAI — ONLY if final */}
          {m.comparativePAI && (
            <div className="mb-2">
              <h4 className="font-semibold text-sm mb-1">
                Postgame — Comparative Execution (PAI)
              </h4>

              <ul className="list-disc ml-5 text-sm">
                {m.comparativePAI.levers.map(
                  (l: any, i: number) => (
                    <li key={i}>
                      {l.lever}: {l.status}
                    </li>
                  )
                )}
              </ul>

              <p className="text-sm italic text-gray-600">
                {m.comparativePAI.conclusion}
              </p>
            </div>
          )}
        </div>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        Data source: ESPN · FAIR — structure over narrative ·
        eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
