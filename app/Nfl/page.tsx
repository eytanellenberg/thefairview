import { buildNFLSnapshot } from "@/lib/nflSnapshot";

function matchKey(dateUtc: string, a: string, b: string) {
  return `${dateUtc}-${[a, b].sort().join("-")}`;
}

export default async function NFLPage() {
  const data = await buildNFLSnapshot();

  const matches: Record<string, any[]> = {};

  for (const entry of data.snapshot) {
    if (!entry.lastGame) continue;

    const key = matchKey(
      entry.lastGame.dateUtc,
      entry.team.id,
      entry.lastGame.opponentId
    );

    if (!matches[key]) matches[key] = [];
    matches[key].push(entry);
  }

  const playedMatches = Object.values(matches).filter(
    (m) => m.length === 2
  );

  return (
    <main className="p-6 max-w-5xl mx-auto text-gray-900 bg-white">
      <h1 className="text-2xl font-semibold mb-2">
        NFL — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        One card per match. Pre-game readiness (RAI) explains what was expected.
        Post-game execution (PAI) explains what happened.
      </p>

      <h2 className="text-lg font-semibold mb-4">Played matches</h2>

      {playedMatches.map((match, index) => {
        const teamA = match[0];
        const teamB = match[1];

        return (
          <div
            key={index}
            className="border rounded-lg p-4 mb-4 bg-white shadow-sm"
          >
            <h3 className="font-medium mb-1">
              {teamA.team.name} vs {teamB.team.name}
            </h3>

            <p className="text-sm mb-3">
              Final score: {teamA.lastGame.score}
            </p>

            {/* RAI */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-1">
                Pregame — Comparative Readiness (RAI)
              </h4>

              <p className="text-sm mb-1">
                RAI edge:{" "}
                <strong>
                  {teamA.comparativeRAI.edgeTeam} +{teamA.comparativeRAI.delta}
                </strong>
              </p>

              <ul className="list-disc ml-5 text-sm">
                {teamA.comparativeRAI.levers.map(
                  (l: any, i: number) => (
                    <li key={i}>
                      {l.lever}: {l.advantage} +{l.value}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* PAI */}
            <div className="mb-2">
              <h4 className="font-semibold text-sm mb-1">
                Postgame — Comparative Execution (PAI)
              </h4>

              {[teamA, teamB].map((t: any, j: number) => (
                <div key={j} className="mb-2">
                  <strong>{t.team.name}</strong>
                  <ul className="list-disc ml-5 text-sm">
                    {t.comparativePAI.levers.map(
                      (l: any, k: number) => (
                        <li key={k}>
                          {l.lever}: {l.status}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
            </div>

            <p className="text-sm italic text-gray-600">
              {teamA.comparativePAI.conclusion}
            </p>
          </div>
        );
      })}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
