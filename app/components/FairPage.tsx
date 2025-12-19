import { FAIRSnapshot } from "@/lib/fair/types";

export default function FairPage({ snapshot }: { snapshot: FAIRSnapshot }) {
  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-1">
        {snapshot.sport} — Comparative RAI (real) + Postgame PAI (last game)
      </h1>

      <p className="text-xs text-gray-500 mb-6">
        Updated at {snapshot.updatedAt}
      </p>

      {snapshot.matchups.map((m, i) => (
        <div key={i} className="border rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="font-medium text-lg">
            {m.teams.A} vs {m.teams.B}
          </h2>

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

          <ul className="list-disc ml-5 text-sm mb-4">
            {m.pregameRAI.levers.map((l, j) => (
              <li key={j}>
                {l.name}: {l.value >= 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>

          <h3 className="font-semibold text-sm mb-1">
            Postgame — Execution (PAI)
          </h3>

          <p className="text-xs text-gray-500 mb-2">
            {m.postgamePAI.note}
          </p>

          {[m.postgamePAI.A, m.postgamePAI.B].map((t, k) => (
            <div key={k} className="text-sm mb-3">
              <strong>{t.team}</strong> — last: {t.lastScore}
              <ul className="list-disc ml-5">
                <li>Result: {t.result}</li>
                <li>Margin: {t.margin}</li>
                <li>Execution vs baseline: {t.execution}</li>
              </ul>
            </div>
          ))}
        </div>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative
      </footer>
    </main>
  );
}
