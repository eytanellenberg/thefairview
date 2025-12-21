import { computeNBAAutoSnapshot } from "@/lib/nbaAutoSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ================= UI HELPERS ================= */

function levelBadge(level: "NONE" | "MINOR" | "MODERATE" | "MAJOR") {
  if (level === "MAJOR") return "bg-red-100 text-red-800 border-red-200";
  if (level === "MODERATE") return "bg-orange-100 text-orange-800 border-orange-200";
  if (level === "MINOR") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-gray-100 text-gray-700 border-gray-200"; // NONE
}

/* ================= PAGE ================= */

export default async function NBAPage() {
  const data = await computeNBAAutoSnapshot();

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white text-gray-900">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-1">
        NBA — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Last completed games · Updated at{" "}
        {new Date(data.updatedAt).toLocaleString()} · Matches:{" "}
        {data.matches.length}
      </p>

      {/* 🔥 TOP FAIR SURPRISES */}
      <section className="mb-10 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">🔥 Top FAIR Surprises</h2>

        {data.topSurprises.length === 0 ? (
          <p className="text-sm text-gray-600">
            No FAIR surprises detected (PAI aligned with RAI).
          </p>
        ) : (
          <ul className="space-y-3">
            {data.topSurprises.map((s, i) => (
              <li key={i} className="border rounded-md bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{s.matchup}</div>

                    <div className="text-sm text-gray-700 mt-1">
                      RAI edge: <strong>{s.raiEdge}</strong>
                    </div>

                    <div className="text-sm text-gray-700">
                      Surprise score:{" "}
                      <span className="font-medium">
                        {s.score >= 0 ? "+" : ""}
                        {s.score.toFixed(2)}
                      </span>
                      {" · "}
                      Logical outcome:{" "}
                      <span className="font-medium">
                        {s.logicalOutcome >= 0 ? "+" : ""}
                        {s.logicalOutcome.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-1 text-xs font-semibold border rounded ${levelBadge(
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

      {/* MATCH CARDS */}
      {data.matches.map((m, i) => (
        <section key={i} className="mb-10 border-b pb-6">
          <h2 className="text-lg font-semibold">{m.matchup}</h2>
          <p className="text-sm mb-3">Final score: {m.finalScore}</p>

          {/* RAI */}
          <h3 className="font-semibold">
            Pregame — Comparative Readiness (RAI)
          </h3>
          <p className="mb-2">
            RAI edge: <strong>{m.rai.edge}</strong> (
            {m.rai.value >= 0 ? "+" : ""}
            {m.rai.value.toFixed(2)})
          </p>

          <ul className="list-disc ml-5 text-sm mb-4">
            {m.rai.levers.map((l, j) => (
              <li key={j}>
                {l.label}: {l.value >= 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>

          {/* PAI */}
          <h3 className="font-semibold">
            Postgame — Comparative Execution (PAI)
          </h3>

          {[m.pai.teamA, m.pai.teamB].map((t, k) => (
            <div key={k} className="mb-3">
              <p className="font-medium">{t.name}</p>
              <ul className="list-disc ml-5 text-sm">
                {t.levers.map((l, j) => (
                  <li key={j}>
                    {l.label}: {l.value >= 0 ? "+" : ""}
                    {l.value.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* FAIR SURPRISE TAG */}
          {m.surprise.isSurprise && (
            <div className="mt-3 border rounded-md p-3 bg-gray-50">
              <div className="font-semibold">FAIR Surprise</div>

              <div className="text-sm text-gray-700">
                Winner: <strong>{m.surprise.winner}</strong> · RAI favored:{" "}
                <strong>{m.surprise.raiFavored}</strong>
              </div>

              <div className="text-sm text-gray-700">
                Surprise score:{" "}
                <strong>
                  {m.surprise.score >= 0 ? "+" : ""}
                  {m.surprise.score.toFixed(2)}
                </strong>
                <span
                  className={`ml-2 inline-block px-2 py-0.5 text-xs font-semibold border rounded ${levelBadge(
                    m.surprise.level
                  )}`}
                >
                  {m.surprise.level}
                </span>
              </div>
            </div>
          )}

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
