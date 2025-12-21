import { computeNBAAutoSnapshot } from "@/lib/nbaAutoSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function levelBadge(level: "MINOR" | "MODERATE" | "MAJOR") {
  if (level === "MAJOR") return "bg-red-100 text-red-800 border-red-200";
  if (level === "MODERATE") return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
}

export default async function NBAPage() {
  const data = await computeNBAAutoSnapshot();

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-1">NBA — Match-based FAIR Analysis</h1>

      <p className="text-sm text-gray-600 mb-6">
        Last completed games · Updated at {new Date(data.updatedAt).toLocaleString()} · Matches:{" "}
        {data.matches.length}
      </p>

      {/* TOP SURPRISES */}
      <section className="mb-8 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">🔥 Top FAIR Surprises</h2>

        {data.topSurprises.length === 0 ? (
          <p className="text-sm text-gray-600">No FAIR surprises detected.</p>
        ) : (
          <ul className="space-y-3">
            {data.topSurprises.map((s, i) => (
              <li key={i} className="border rounded-md bg-white p-3">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-semibold">{s.matchup}</div>
                    <div className="text-sm">RAI edge: {s.raiEdge}</div>
                    <div className="text-sm">
                      Logical outcome:{" "}
                      <strong>
                        {s.logicalOutcome >= 0 ? "+" : ""}
                        {s.logicalOutcome.toFixed(2)}
                      </strong>
                    </div>
                    <div className="text-sm">
                      Surprise score: <strong>{s.score.toFixed(2)}</strong>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 h-fit text-xs font-semibold border rounded ${levelBadge(
                      s.level
                    )}`}
                  >
                    {s.level}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* MATCHES */}
      {data.matches.map((m, i) => (
        <section key={i} className="mb-8 border-b pb-6">
          <h2 className="text-lg font-semibold">{m.matchup}</h2>
          <p className="text-sm mb-3">Final score: {m.finalScore}</p>

          <h3 className="font-semibold">Pregame — Comparative Readiness (RAI)</h3>
          <p className="mb-2">
            RAI edge: <strong>{m.rai.edge}</strong> (+{m.rai.value.toFixed(2)})
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

          {m.surprise.isSurprise && (
            <div className="mt-3 border rounded-md p-3 bg-gray-50">
              <div className="font-semibold">FAIR Surprise</div>
              <div className="text-sm">
                Winner: <strong>{m.surprise.winner}</strong> · RAI favored:{" "}
                <strong>{m.surprise.raiFavored}</strong>
              </div>
              <div className="text-sm">
                Surprise score: <strong>{m.surprise.score.toFixed(2)}</strong>
              </div>
            </div>
          )}

          <p className="text-xs italic mt-2">
            Outcome interpreted through execution deltas relative to pregame structural expectations.
          </p>
        </section>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
