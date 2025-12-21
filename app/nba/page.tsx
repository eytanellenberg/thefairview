import { computeNBAAutoSnapshot } from "@/lib/nbaAutoSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const colorMap: Record<string, string> = {
  green: "text-green-600",
  orange: "text-orange-500",
  red: "text-red-600",
  gray: "text-gray-500",
};

export default function NBAPage() {
  const data = computeNBAAutoSnapshot();

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-1">
        NBA — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Last completed games · Updated at{" "}
        {new Date(data.updatedAt).toLocaleString()} · Matches:{" "}
        {data.matches.length}
      </p>

      {data.matches.map((m, i) => (
        <section key={i} className="mb-10 border-b pb-6">
          <h2 className="text-lg font-semibold">{m.matchup}</h2>
          <p className="text-sm mb-3">Final score: {m.finalScore}</p>

          <h3 className="font-semibold">Pregame — Comparative Readiness (RAI)</h3>
          <p className="mb-2">
            RAI edge: <strong>{m.rai.edge}</strong> (+{m.rai.value})
          </p>

          <ul className="list-disc ml-5 text-sm mb-4">
            {m.rai.levers.map((l, j) => (
              <li key={j}>
                {l.label}: {l.value > 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>

          <h3 className="font-semibold">Postgame — Comparative Execution (PAI)</h3>

          {[m.pai.teamA, m.pai.teamB].map((t, k) => (
            <div key={k} className="mb-3">
              <p className="font-medium">{t.name}</p>
              <ul className="list-disc ml-5 text-sm">
                {t.levers.map((l, j) => (
                  <li key={j}>
                    {l.label}: {l.value > 0 ? "+" : ""}
                    {l.value.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <h3 className="font-semibold mt-3">FAIR Surprise</h3>
          <p
            className={`text-sm font-medium ${
              colorMap[m.fairSurprise.color]
            }`}
          >
            {m.fairSurprise.label} (
            {m.fairSurprise.value > 0 ? "+" : ""}
            {m.fairSurprise.value})
          </p>

          <p className="text-xs italic mt-2">
            Outcome interpreted through execution deltas relative to pregame
            structural expectations.
          </p>
        </section>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
