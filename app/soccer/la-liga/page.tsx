import Link from "next/link";

export default function LaLigaPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto text-gray-900 bg-white">
      <h1 className="text-2xl font-semibold mb-4">
        La Liga
      </h1>

      <p className="text-sm text-gray-700 mb-6">
        Match-by-match causal analysis using the FAIR framework.
        <br />
        Pre-game structural comparison (RAI) and post-game attribution (PAI).
      </p>

      {/* MATCH LIST */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Matches
        </h2>

        <div className="flex flex-col gap-2">
          <div className="border rounded p-3 text-sm text-gray-500">
            Real Madrid vs Barcelona — analysis coming soon
          </div>

          <div className="border rounded p-3 text-sm text-gray-500">
            Atlético Madrid vs Sevilla — analysis coming soon
          </div>
        </div>
      </div>

      {/* METHOD REMINDER */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          FAIR method
        </h2>
        <ul className="list-disc ml-6 text-sm text-gray-700">
          <li>
            <strong>RAI</strong> — expected structural edge before kickoff
          </li>
          <li>
            <strong>Levers</strong> — team strength, context, squad availability
          </li>
          <li>
            <strong>PAI</strong> — causal explanation of the final result
          </li>
        </ul>
      </div>

      <footer className="text-xs text-gray-500 mt-10">
        Data source: ESPN · League: La Liga
      </footer>
    </main>
  );
}
