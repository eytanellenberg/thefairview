export const dynamic = "force-dynamic";
export const revalidate = 0;

import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto text-gray-900 bg-white">
      <h1 className="text-2xl font-semibold mb-2">
        NBA — Comparative RAI (real) + Postgame PAI (last game)
      </h1>

      <p className="text-xs text-gray-500 mb-6">
        Updated at {data.updatedAt}
      </p>

      {data.snapshot.length === 0 && (
        <p className="text-sm text-gray-600">
          No upcoming matchups detected yet.
        </p>
      )}

      {data.snapshot.map((m: any, i: number) => (
        <div key={i} className="border rounded-lg p-4 mb-5 shadow-sm">
          <h2 className="font-medium text-lg mb-1">{m.matchup}</h2>
          <p className="text-xs text-gray-500 mb-3">
            Next game (UTC): {m.nextGameUtc}
          </p>

          <h3 className="font-semibold text-sm mb-1">
            Pregame — Comparative Readiness (RAI)
          </h3>

          <p className="text-sm mb-2">
            <strong>
              Delta RAI (A − B): {m.pregameRAI.delta.toFixed(2)}
            </strong>{" "}
            → advantage <strong>{m.pregameRAI.favoredTeam}</strong>
          </p>

          <ul className="list-disc ml-5 text-sm mb-3">
            {m.pregameRAI.levers.map((l: any, j: number) => (
              <li key={j}>
                {l.lever}: {l.value >= 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>

          <details className="text-xs text-gray-600 mb-4">
            <summary className="cursor-pointer">RAI inputs (real)</summary>
            <pre className="whitespace-pre-wrap">
{JSON.stringify(m.pregameRAI.notes, null, 2)}
            </pre>
          </details>

          <h3 className="font-semibold text-sm mb-1">
            Postgame — Execution (PAI, last game)
          </h3>

          <div className="text-sm mb-2">
            <strong>{m.postgamePAI.A.team}</strong> — last: {m.postgamePAI.A.lastScore}
            <ul className="list-disc ml-5">
              {m.postgamePAI.A.levers.map((x: any, k: number) => (
                <li key={k}>
                  {x.lever}: {x.status}
                </li>
              ))}
            </ul>
            <p className="italic text-gray-600">{m.postgamePAI.A.conclusion}</p>
          </div>

          <div className="text-sm">
            <strong>{m.postgamePAI.B.team}</strong> — last: {m.postgamePAI.B.lastScore}
            <ul className="list-disc ml-5">
              {m.postgamePAI.B.levers.map((x: any, k: number) => (
                <li key={k}>
                  {x.lever}: {x.status}
                </li>
              ))}
            </ul>
            <p className="italic text-gray-600">{m.postgamePAI.B.conclusion}</p>
          </div>
        </div>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
