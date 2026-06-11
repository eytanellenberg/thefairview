import { computeWorldCup2026AutoSnapshot } from "@/lib/worldCup2026AutoSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function levelBadge(
  level: "MINOR" | "MODERATE" | "MAJOR" | "NONE"
) {
  if (level === "MAJOR") return "bg-red-100 text-red-800 border-red-200";
  if (level === "MODERATE") return "bg-orange-100 text-orange-800 border-orange-200";
  if (level === "MINOR") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

export default async function WorldCup2026Page() {
  const data = await computeWorldCup2026AutoSnapshot();

  const totalGames = data.matches.length;
  const surprises = data.matches.filter(m => m.surprise.isSurprise);
  const noSurprises = totalGames - surprises.length;
  const alignmentRate =
    totalGames > 0
      ? Math.round((noSurprises / totalGames) * 100)
      : 0;

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-1">
        FIFA World Cup 2026 — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at {new Date(data.updatedAt).toLocaleString()} · Matches: {totalGames}
      </p>

      <section className="mb-6 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">
          Tournament FAIR Summary
        </h2>

        <ul className="text-sm space-y-1">
          <li>Matches analyzed: <strong>{totalGames}</strong></li>
          <li>No-surprise games: <strong>{noSurprises}</strong></li>
          <li>Alignment rate: <strong>{alignmentRate}%</strong></li>
          <li>Upsets detected: <strong>{surprises.length}</strong></li>
        </ul>
      </section>

      <section className="mb-8 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">
          🔥 Top FAIR Surprises
        </h2>

        {data.topSurprises.length === 0 ? (
          <p className="text-sm text-gray-600">
            No FAIR surprises detected.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.topSurprises.map((s, i) => (
              <li key={i} className="border rounded-md bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{s.matchup}</div>
                    <div className="text-sm">
                      RAI edge: {s.raiEdge}
                    </div>
                    <div className="text-sm">
                      Surprise score: {s.score.toFixed(2)}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs font-semibold border rounded ${levelBadge(
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
    </main>
  );
}
