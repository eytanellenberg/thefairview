import { buildNFLSnapshot, NFLMatchCard } from "@/lib/nflSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NFLPage() {
  const data = await buildNFLSnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NFL — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at {new Date(data.updatedAt).toLocaleString()}
      </p>

      {data.matches.map((match: NFLMatchCard, idx: number) => (
        <section
          key={idx}
          className="mb-8 border-b border-gray-200 pb-6"
        >
          {/* MATCH HEADER */}
          <h2 className="text-lg font-semibold mb-1">
            {match.home} vs {match.away}
          </h2>

          <p className="text-sm mb-3">
            Final score: {match.finalScore}
          </p>

          {/* RAI */}
          <h3 className="font-medium mt-3">
            Pregame — Comparative Readiness (RAI)
          </h3>

          <p className="text-sm mb-2">
            RAI edge:{" "}
            <strong>
              {match.comparativeRAI.edge} (+{match.comparativeRAI.delta})
            </strong>
          </p>

          <ul className="list-disc ml-5 text-sm mb-4">
            {match.comparativeRAI.levers.map(
              (
                l: { lever: string; advantage: string; value: number },
                i: number
              ) => (
                <li key={i}>
                  {l.lever}: {l.advantage}{" "}
                  ({l.value >= 0 ? "+" : ""}
                  {l.value})
                </li>
              )
            )}
          </ul>

          {/* PAI */}
          <h3 className="font-medium mt-4">
            Postgame — Comparative Execution (PAI)
          </h3>

          {match.postgamePAI.map(
            (
              team: {
                team: string;
                lastScore: string;
                levers: { lever: string; delta: number }[];
              },
              i: number
            ) => (
              <div key={i} className="mt-3">
                <p className="font-medium text-sm">
                  {team.team}
                </p>

                <p className="text-sm mb-1">
                  Last: {team.lastScore}
                </p>

                <ul className="list-disc ml-5 text-sm">
                  {team.levers.map(
                    (
                      l: { lever: string; delta: number },
                      j: number
                    ) => (
                      <li key={j}>
                        {l.lever}:{" "}
                        {l.delta >= 0 ? "Outperformed" : "Weakened"} vs
                        expectation (
                        {l.delta >= 0 ? "+" : ""}
                        {l.delta})
                      </li>
                    )
                  )}
                </ul>
              </div>
            )
          )}

          <p className="text-xs text-gray-500 mt-3">
            Outcome interpreted through execution deltas relative to
            pregame structural expectations.
          </p>
        </section>
      ))}

      <footer className="text-xs text-gray-500 mt-8">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
