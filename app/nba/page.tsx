import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">
        NBA — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at {data.updatedAt}
      </p>

      {data.snapshot.map((m: any, i: number) => (
        <div
          key={i}
          className="border rounded-lg p-4 mb-6 bg-white shadow-sm"
        >
          <h2 className="font-medium text-lg mb-1">{m.match}</h2>
          <p className="text-sm mb-3">Final score: {m.score}</p>

          <h3 className="font-semibold text-sm mb-1">
            Pregame — Comparative Readiness (RAI)
          </h3>

          <p className="text-sm mb-2">
            <strong>
              Delta RAI (A − B): {m.rai.delta.toFixed(2)}
            </strong>{" "}
            → advantage {m.rai.favoredTeam}
          </p>

          <ul className="list-disc ml-5 text-sm mb-4">
            {m.rai.levers.map((l: any, j: number) => (
              <li key={j}>
                {l.lever}: {l.value >= 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>

          <h3 className="font-semibold text-sm mb-1">
            Postgame — Execution (PAI)
          </h3>

          <p className="text-sm">
            {m.pai.A.team}: {m.pai.A.execution}
          </p>
          <p className="text-sm">
            {m.pai.B.team}: {m.pai.B.execution}
          </p>
        </div>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative
      </footer>
    </main>
  );
}
