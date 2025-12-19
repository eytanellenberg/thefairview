export const dynamic = "force-dynamic";
export const revalidate = 0;

import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  return (
    <main className="p-6 max-w-4xl mx-auto text-gray-900 bg-white">
      <h1 className="text-2xl font-semibold mb-2">
        NBA — Team-based FAIR Analysis
      </h1>

      <p className="text-xs text-gray-500 mb-6">
        Updated at {data.updatedAt}
      </p>

      {data.snapshot.map((t: any, i: number) => (
        <div key={i} className="border rounded-lg p-4 mb-4 shadow-sm">
          <h3 className="font-medium mb-1">
            {t.team.name} vs {t.lastGame.opponent}
          </h3>

          <p className="text-sm mb-3">
            Last game score: {t.lastGame.score}
          </p>

          <h4 className="font-semibold text-sm mb-1">
            Pregame — Readiness (RAI)
          </h4>
          <p className="text-sm mb-1">
            Delta RAI:{" "}
            <strong>
              {t.comparativeRAI.sign}
              {t.comparativeRAI.delta}
            </strong>
          </p>

          <ul className="list-disc ml-5 text-sm mb-3">
            {t.comparativeRAI.levers.map((l: any, j: number) => (
              <li key={j}>
                {l.lever}: {l.effect}
                {l.value}
              </li>
            ))}
          </ul>

          <h4 className="font-semibold text-sm mb-1">
            Postgame — Execution (PAI)
          </h4>

          <ul className="list-disc ml-5 text-sm mb-2">
            {t.comparativePAI.levers.map((l: any, j: number) => (
              <li key={j}>
                {l.lever}: {l.status}
              </li>
            ))}
          </ul>

          <p className="text-sm italic text-gray-600">
            {t.comparativePAI.conclusion}
          </p>
        </div>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
