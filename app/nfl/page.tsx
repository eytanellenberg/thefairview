// app/nfl/page.tsx
import { computeNFLAutoSnapshot } from "@/lib/nflAutoSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function badge(level: "MINOR" | "MODERATE" | "MAJOR") {
  if (level === "MAJOR") return "bg-red-100 text-red-800 border-red-200";
  if (level === "MODERATE") return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
}

export default async function NFLPage() {
  const data = await computeNFLAutoSnapshot();

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-1">
        NFL — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Last completed week · Updated at{" "}
        {new Date(data.updatedAt).toLocaleString()} · Games:{" "}
        {data.matches.length}
      </p>

      {/* WEEKLY BOX */}
      <section className="mb-8 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Weekly FAIR Summary</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Games analyzed</div>
            <div className="font-semibold">{data.weeklySummary.games}</div>
          </div>
          <div>
            <div className="text-gray-500">No-surprise games</div>
            <div className="font-semibold">{data.weeklySummary.noSurprise}</div>
          </div>
          <div>
            <div className="text-gray-500">Alignment rate</div>
            <div className="font-semibold">
              {data.weeklySummary.alignmentRate}%
            </div>
          </div>
          <div>
            <div className="text-gray-500">Upsets</div>
            <div className="font-semibold">{data.weeklySummary.surprises}</div>
          </div>
        </div>

        <p className="mt-3 text-sm italic text-gray-700">
          {data.weeklySummary.takeaway}
        </p>
      </section>

      {/* MATCHES */}
      {data.matches.map((m, i) => (
        <section key={i} className="mb-8 border-b pb-6">
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
                {l.value}
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
                    {l.value}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {m.surprise.isSurprise && m.surprise.level !== "NONE" && (
            <div className="mt-3 border rounded-md p-3 bg-gray-50">
              <div className="font-semibold">FAIR Surprise</div>
              <div className="text-sm">
                Winner: <strong>{m.surprise.winner}</strong> · RAI favored:{" "}
                <strong>{m.surprise.raiFavored}</strong>
              </div>
              <div className="text-sm mt-1">
                Surprise score: <strong>{m.surprise.score}</strong>
                <span
                  className={`ml-2 inline-block px-2 py-0.5 text-xs font-semibold border rounded ${badge(
                    m.surprise.level
                  )}`}
                >
                  {m.surprise.level}
                </span>
              </div>
            </div>
          )}
        </section>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
            }
