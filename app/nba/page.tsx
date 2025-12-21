// app/nba/page.tsx

import { computeNBALastGamesSnapshot } from "@/lib/nbaLastGamesSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NBAPage() {
  const data = await computeNBALastGamesSnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NBA — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Last completed games · Updated at{" "}
        {new Date(data.updatedAt).toLocaleString()} · Matches: {data.matches.length}
      </p>

      <h2 className="text-lg font-semibold mb-4">Played matches</h2>

      {data.matches.map((match, i) => (
        <section key={i} className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
          <h3 className="font-medium mb-1">
            {match.home.name} vs {match.away.name}
          </h3>

          <p className="text-sm mb-3">Final score: {match.finalScore}</p>

          {/* 🔵 RAI */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-1">
              Pregame — Comparative Readiness (RAI)
            </h4>

            <p className="text-sm mb-2">
              RAI edge:{" "}
              <strong>
                {match.rai.edgeTeam} (+{Math.abs(match.rai.edgeValue).toFixed(2)})
              </strong>
            </p>

            <ul className="list-disc ml-5 text-sm">
              {match.rai.levers.map((l: { lever: string; value: number }, idx: number) => (
                <li key={idx}>
                  {l.lever}: {l.value >= 0 ? "+" : ""}
                  {l.value.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          {/* 🔴 PAI */}
          <div className="mb-2">
            <h4 className="font-semibold text-sm mb-1">
              Postgame — Comparative Execution (PAI)
            </h4>

            {[match.pai.home, match.pai.away].map(
              (t: { team: string; levers: { lever: string; value: number }[] }, j: number) => (
                <div key={j} className="mb-2">
                  <strong>{t.team}</strong>
                  <ul className="list-disc ml-5 text-sm">
                    {t.levers.map((l: { lever: string; value: number }, k: number) => (
                      <li key={k}>
                        {l.lever}: {l.value >= 0 ? "+" : ""}
                        {l.value.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>

          <p className="text-sm italic text-gray-600">
            Outcome interpreted through execution deltas relative to pregame structural expectations.
          </p>
        </section>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
