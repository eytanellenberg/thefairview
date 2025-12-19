export const dynamic = "force-dynamic";
export const revalidate = 0;

import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto text-gray-900 bg-white">
      <h1 className="text-2xl font-semibold mb-2">
        NBA — Match-based FAIR Analysis
      </h1>

      <p className="text-xs text-gray-500 mb-6">
        Updated at {data.updatedAt}
      </p>

      {data.matches.map((m: any, i: number) => (
        <div
          key={i}
          className="border rounded-lg p-4 mb-4 bg-white shadow-sm"
        >
          <h3 className="font-medium mb-1">
            {m.home?.team.name ?? "TBD"} vs{" "}
            {m.away?.team.name ?? "TBD"}
          </h3>

          <p className="text-sm mb-3">
            Final score: {m.home?.score ?? "—"}
          </p>

          {m.home && (
            <>
              <h4 className="font-semibold text-sm mb-1">
                Pregame — Readiness (RAI)
              </h4>

              <p className="text-sm mb-2">
                Edge: {m.home.comparativeRAI.edge} +
                {m.home.comparativeRAI.delta}
              </p>

              <ul className="list-disc ml-5 text-sm mb-3">
                {m.home.comparativeRAI.levers.map(
                  (l: any, j: number) => (
                    <li key={j}>
                      {l.lever}: +{l.value}
                    </li>
                  )
                )}
              </ul>

              <h4 className="font-semibold text-sm mb-1">
                Postgame — Execution (PAI)
              </h4>

              <p className="text-sm italic text-gray-600">
                {m.home.comparativePAI.conclusion}
              </p>
            </>
          )}
        </div>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
