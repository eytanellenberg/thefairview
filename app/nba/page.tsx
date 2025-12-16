import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export const revalidate = 300;

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto text-sm text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NBA — Comparative RAI & PAI
      </h1>

      <p className="text-gray-600 mb-6">
        RAI (pre-game) defines which levers should matter most in the matchup.
        PAI (post-game) verifies execution on the same levers. NEW is rare and
        flags an emergent lever that became dominant unexpectedly.
      </p>

      <p className="text-xs text-gray-500 mb-8">
        Last update: {new Date(data.updatedAt).toLocaleString()}
      </p>

      <div className="space-y-10">
        {data.snapshot.map((teamBlock: any) => (
          <section
            key={teamBlock.team.id}
            className="border-t pt-6 space-y-4"
          >
            {/* TEAM NAME */}
            <h2 className="text-xl font-medium">
              {teamBlock.team.name}
            </h2>

            {/* 🔴 LAST GAME */}
            {teamBlock.lastGame && (
              <div>
                <h3 className="font-semibold">
                  Last game
                </h3>
                <p className="text-gray-700">
                  {teamBlock.team.name}{" "}
                  {teamBlock.lastGame.score}{" "}
                  vs {teamBlock.lastGame.opponent} (
                  {teamBlock.lastGame.homeAway})
                </p>
              </div>
            )}

            {/* 🔵 NEXT GAME */}
            {teamBlock.nextGame && (
              <div>
                <h3 className="font-semibold">
                  Next game
                </h3>
                <p className="text-gray-700">
                  {teamBlock.team.name} vs{" "}
                  {teamBlock.nextGame.opponent} (
                  {teamBlock.nextGame.homeAway})
                </p>
              </div>
            )}

            {/* 🔵 RAI */}
            {teamBlock.comparativeRAI && (
              <div>
                <h3 className="font-semibold mt-2">
                  Comparative Readiness (RAI)
                </h3>
                <p className="mb-1">
                  RAI score:{" "}
                  <strong>{teamBlock.comparativeRAI.value}</strong>
                </p>

                <ul className="list-disc ml-5">
                  {teamBlock.comparativeRAI.expectedLevers.map(
                    (l: any) => (
                      <li key={l.lever}>
                        <strong>{l.lever}</strong>{" "}
                        {l.contribution > 0 ? "+" : ""}
                        {l.contribution}
                        <br />
                        <span className="text-gray-600">
                          {l.rationale}
                        </span>
                      </li>
                    )
                  )}
                </ul>

                <p className="italic text-gray-600 mt-2">
                  {teamBlock.comparativeRAI.summary}
                </p>
              </div>
            )}

            {/* 🔴 PAI */}
            {teamBlock.comparativePAI && (
              <div>
                <h3 className="font-semibold mt-2">
                  Comparative Execution (PAI)
                </h3>
                <p className="mb-1">
                  PAI score:{" "}
                  <strong>{teamBlock.comparativePAI.value}</strong>
                </p>

                <ul className="list-disc ml-5">
                  {teamBlock.comparativePAI.observedLevers.map(
                    (l: any) => (
                      <li key={l.lever}>
                        <strong>{l.lever}</strong>{" "}
                        {l.contribution > 0 ? "+" : ""}
                        {l.contribution}{" "}
                        {l.status && (
                          <span className="text-xs text-gray-500">
                            ({l.status})
                          </span>
                        )}
                        <br />
                        <span className="text-gray-600">
                          {l.rationale}
                        </span>
                      </li>
                    )
                  )}
                </ul>

                <p className="italic text-gray-600 mt-2">
                  {teamBlock.comparativePAI.summary}
                </p>
              </div>
            )}
          </section>
        ))}
      </div>

      <footer className="mt-12 text-xs text-gray-500">
        Analyses avancées disponibles pour analystes et clubs —{" "}
        <a
          href="mailto:contact@thefairview.com"
          className="underline"
        >
          contact@thefairview.com
        </a>
      </footer>
    </main>
  );
}
