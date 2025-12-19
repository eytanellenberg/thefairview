import { buildNFLSnapshot } from "@/lib/nflSnapshot";

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
        Updated at {data.updatedAt}
      </p>

      <h2 className="text-lg font-semibold mb-4">Played matches</h2>

      {data.matches.map((match, index) => {
        const A = match[0];
        const B = match[1];

        return (
          <div
            key={index}
            className="border rounded-lg p-4 mb-6 bg-white shadow-sm"
          >
            {/* Match title */}
            <h3 className="font-medium mb-1">
              {A.team.name} vs {B.team.name}
            </h3>

            {/* Final score */}
            <p className="text-sm mb-3">
              Final score: {A.lastGame.score}
            </p>

            {/* 🔵 RAI */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-1">
                Pregame — Comparative Readiness (RAI)
              </h4>

              <p className="text-sm mb-1">
                RAI edge:{" "}
                <strong>
                  {A.comparativeRAI.edgeTeam} +{A.comparativeRAI.delta}
                </strong>
              </p>

              <ul className="list-disc ml-5 text-sm">
                {A.comparativeRAI.levers.map((l, i) => (
                  <li key={i}>
                    {l.lever}: {l.advantage}{" "}
                    {l.value >= 0 ? "+" : ""}
                    {l.value}
                  </li>
                ))}
              </ul>
            </div>

            {/* 🔴 PAI */}
            <div className="mb-2">
              <h4 className="font-semibold text-sm mb-1">
                Postgame — Comparative Execution (PAI)
              </h4>

              {[A, B].map((team, j) => (
                <div key={j} className="mb-2">
                  <strong>{team.team.name}</strong>
                  <ul className="list-disc ml-5 text-sm">
                    {team.comparativePAI.levers.map((l, k) => (
                      <li key={k}>
                        {l.lever}: {l.status}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Conclusion */}
            <p className="text-sm italic text-gray-600">
              {A.comparativePAI.conclusion}
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
