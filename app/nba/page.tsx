import { computeNBAAutoSnapshot } from "@/lib/nbaAutoSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

      {/* ================= TOP FAIR SURPRISES (DÉJÀ FAIT) ================= */}
      <section className="mb-10 p-4 rounded-lg border bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">
          🔥 Top FAIR Surprises
        </h2>

        {data.matches
          .slice()
          .sort(
            (a, b) =>
              Math.abs(b.fairSurprise.value) -
              Math.abs(a.fairSurprise.value)
          )
          .slice(0, 3)
          .map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 mb-2 rounded-md bg-white border"
            >
              <div>
                <p className="font-medium text-sm">{m.matchup}</p>
                <p className="text-xs text-gray-500">
                  RAI edge: {m.rai.edge} (
                  {m.rai.value > 0 ? "+" : ""}
                  {m.rai.value})
                </p>
              </div>

              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${m.fairSurprise.color}`}
              >
                {m.fairSurprise.label} (
                {m.fairSurprise.value > 0 ? "+" : ""}
                {m.fairSurprise.value})
              </span>
            </div>
          ))}
      </section>

      {/* ================= MATCHES ================= */}
      {data.matches.map((m, i) => (
        <section key={i} className="mb-10 border-b pb-6">
          <h2 className="text-lg font-semibold">{m.matchup}</h2>
          <p className="text-sm mb-3">Final score: {m.finalScore}</p>

          {/* -------- RAI -------- */}
          <h3 className="font-semibold">
            Pregame — Comparative Readiness (RAI)
          </h3>
          <p className="mb-2">
            RAI edge: <strong>{m.rai.edge}</strong> (
            {m.rai.value > 0 ? "+" : ""}
            {m.rai.value})
          </p>

          <ul className="list-disc ml-5 text-sm mb-4">
            {m.rai.levers.map((l, j) => (
              <li key={j}>
                {l.label}: {l.value > 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>

          {/* -------- PAI -------- */}
          <h3 className="font-semibold">
            Postgame — Comparative Execution (PAI)
          </h3>

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

          {/* -------- FAIR SURPRISE -------- */}
          <div className="mt-3">
            <p className="font-semibold text-sm">FAIR Surprise</p>
            <span
              className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full ${m.fairSurprise.color}`}
            >
              {m.fairSurprise.label} (
              {m.fairSurprise.value > 0 ? "+" : ""}
              {m.fairSurprise.value})
            </span>
          </div>

          <p className="text-xs italic mt-3">
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
