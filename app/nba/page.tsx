import { buildNBASnapshot } from "@/lib/nbaSnapshot";

function matchKey(dateUtc: string, a: string, b: string) {
  return `${dateUtc}-${[a, b].sort().join("-")}`;
}

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  const matches: Record<string, any[]> = {};

  for (const t of data.snapshot) {
    if (t.lastGame) {
      const key = matchKey(
        t.lastGame.dateUtc,
        t.team.id,
        t.lastGame.opponentId
      );
      matches[key] = matches[key] || [];
      matches[key].push({ team: t.team.name, ...t });
    }
  }

  const playedMatches = Object.values(matches).filter(m => m.length === 2);

  return (
    <main className="p-6 max-w-5xl mx-auto text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NBA — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        One card per match. Post-game execution (PAI) explains what happened.
        Pre-game readiness (RAI) explains what was expected.
      </p>

      <h2 className="text-lg font-semibold mb-4">Played matches</h2>

      {playedMatches.map((match, i) => (
        <div key={i} className="border rounded-lg p-4 mb-4 bg-white">
          <h3 className="font-medium mb-2">
            {match[0].team} vs {match[1].team}
          </h3>

          <p className="text-sm mb-2">
            Final score: {match[0].lastGame.score}
          </p>

          {match.map((m: any, j: number) => (
            <div key={j} className="mb-2">
              <strong>{m.team}</strong> — PAI
              <ul className="list-disc ml-5 text-sm">
                {m.comparativePAI?.levers.map((l: any, k: number) => (
                  <li key={k}>
                    {l.lever} — {l.status}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="text-sm italic text-gray-600">
            {match[0].comparativePAI?.conclusion}
          </p>
        </div>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
