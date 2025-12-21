// app/soccer/page.tsx
import Link from "next/link";
import { computeSoccerEuropeAutoSnapshot } from "@/lib/soccerEuropeAutoSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function levelBadge(level: "MINOR" | "MODERATE" | "MAJOR") {
  if (level === "MAJOR") return "bg-red-100 text-red-800 border-red-200";
  if (level === "MODERATE") return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
}

export default async function SoccerEuropePage() {
  const data = await computeSoccerEuropeAutoSnapshot();

  return (
    <main className="max-w-5xl mx-auto p-6 bg-white text-gray-900">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold mb-1">European Soccer — FAIR Weekly</h1>
          <p className="text-sm text-gray-600">
            Updated at {new Date(data.updatedAt).toLocaleString()}
          </p>
        </div>

        <Link
          href="/soccer/champions-league"
          className="inline-flex items-center px-4 py-2 rounded-lg border bg-gray-900 text-white hover:bg-gray-800"
        >
          Champions League →
        </Link>
      </div>

      {/* WEEKLY SUMMARY */}
      <section className="mt-6 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Weekly FAIR Summary (Europe)</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border rounded-md bg-white p-3">
            <div className="text-xs text-gray-500">Games analyzed</div>
            <div className="text-xl font-semibold">{data.weeklySummary.games}</div>
          </div>

          <div className="border rounded-md bg-white p-3">
            <div className="text-xs text-gray-500">No-surprise games</div>
            <div className="text-xl font-semibold">{data.weeklySummary.noSurprise}</div>
          </div>

          <div className="border rounded-md bg-white p-3">
            <div className="text-xs text-gray-500">Alignment rate</div>
            <div className="text-xl font-semibold">{data.weeklySummary.alignmentRate}%</div>
          </div>

          <div className="border rounded-md bg-white p-3">
            <div className="text-xs text-gray-500">Upsets</div>
            <div className="text-xl font-semibold">{data.weeklySummary.surprises}</div>
          </div>
        </div>

        <p className="text-sm text-gray-700 mt-3">
          <span className="font-semibold">FAIR Takeaway:</span> {data.weeklySummary.takeaway}
        </p>

        <div className="text-xs text-gray-500 mt-2">
          Leagues included: {data.leaguesIncluded.map((l) => l.label).join(", ")}
        </div>
      </section>

      {/* TOP SURPRISES */}
      <section className="mt-6 border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold mb-3">🔥 Top FAIR Surprises (Europe)</h2>

        {data.topSurprises.length === 0 ? (
          <p className="text-sm text-gray-600">
            No major surprises detected across selected leagues this week.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.topSurprises.map((s, i) => (
              <li key={i} className="border rounded-md p-3 bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{s.matchup}</div>
                    <div className="text-sm text-gray-700">
                      League: <span className="font-medium">{s.leagueLabel}</span>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      Winner: <span className="font-medium">{s.winner}</span> · RAI favored:{" "}
                      <span className="font-medium">{s.raiFavored}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Surprise score:{" "}
                      <span className="font-medium">{s.score.toFixed(2)}</span>
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

      {/* OPTIONAL: Links to league pages (tu peux enlever si tu veux) */}
      <section className="mt-6 text-sm text-gray-700">
        <div className="font-semibold mb-2">League pages</div>
        <div className="flex flex-wrap gap-2">
          {data.leaguesIncluded.map((l) => (
            <Link
              key={l.slug}
              href={l.slug}
              className="px-3 py-1 rounded-full border bg-white hover:bg-gray-50"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
      }
