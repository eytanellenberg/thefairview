import { computeNFLBigScoreSnapshot } from "@/lib/nflBigScore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NFLPage() {
  const data = await computeNFLBigScoreSnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NFL — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at {new Date(data.updatedAt).toLocaleString()}
      </p>

      {data.matches.map((match, idx) => (
        <section key={idx} className="mb-8 border-b pb-6">
          <h2 className="text-xl font-semibold mb-1">
            {match.home} vs {match.away}
          </h2>

          <p className="text-sm mb-3">
            Final score: {match.score}
          </p>

          {/* RAI */}
          <div className="mb-4">
            <h3 className="font-semibold">
              Pregame — Comparative Readiness (RAI)
            </h3>
            <p className="text-sm mb-1">
              RAI edge:{" "}
              <strong>
                {match.rai.edgeTeam} ({match.rai.delta > 0 ? "+" : ""}
                {match.rai.delta.toFixed(2)})
              </strong>
            </p>

            <ul className="list-disc ml-5 text-sm">
              {match.rai.levers.map(
                (
                  l: {
                    lever: string;
                    team: string;
                    value: number;
                  },
                  i: number
                ) => (
                  <li key={i}>
                    {l.lever}: {l.team} (
                    {l.value >= 0 ? "+" : ""}
                    {l.value.toFixed(2)})
                  </li>
                )
              )}
            </ul>
          </div>

          {/* PAI */}
          <div>
            <h3 className="font-semibold">
              Postgame — Comparative Execution (PAI)
            </h3>

            {match.pai.map(
              (
                team: {
                  team: string;
                  score: string;
                  levers: {
                    lever: string;
                    delta: number;
                  }[];
                },
                i: number
              ) => (
                <div key={i} className="mb-2">
                  <p className="font-medium">
                    {team.team}
                  </p>
                  <p className="text-sm mb-1">
                    Last: {team.score}
                  </p>

                  <ul className="list-disc ml-5 text-sm">
                    {team.levers.map(
                      (
                        l: {
                          lever: string;
                          delta: number;
                        },
                        j: number
                      ) => (
                        <li key={j}>
                          {l.lever}:{" "}
                          {l.delta >= 0
                            ? "Outperformed vs expectation"
                            : "Weakened vs expectation"}{" "}
                          ({l.delta >= 0 ? "+" : ""}
                          {l.delta.toFixed(2)})
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )
            )}

            <p className="text-xs text-gray-600 mt-2">
              Outcome interpreted through execution deltas relative to pregame
              structural expectations.
            </p>
          </div>
        </section>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
            }
