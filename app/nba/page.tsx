// app/nba/page.tsx
import { computeNBAAutoSnapshot } from "@/lib/nbaAutoSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Level = "NONE" | "MINOR" | "MODERATE" | "MAJOR";

function levelBadge(level: Level) {
  if (level === "MAJOR") return "bg-red-100 text-red-800 border-red-200";
  if (level === "MODERATE") return "bg-orange-100 text-orange-800 border-orange-200";
  if (level === "MINOR") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function signed(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}`;
}

export default async function NBAPage() {
  const data = await computeNBAAutoSnapshot();

  // ===== Weekly summary (computed in the page, no extra lib changes) =====
  const total = data.matches.length;

  const surprises = data.matches.filter((m) => m.surprise?.isSurprise);
  const aligned = data.matches.filter((m) => !m.surprise?.isSurprise);

  const counts = surprises.reduce(
    (acc, m) => {
      const lvl = (m.surprise?.level || "NONE") as Level;
      if (lvl === "MINOR") acc.MINOR += 1;
      if (lvl === "MODERATE") acc.MODERATE += 1;
      if (lvl === "MAJOR") acc.MAJOR += 1;
      return acc;
    },
    { MINOR: 0, MODERATE: 0, MAJOR: 0 }
  );

  const biggestSurprise =
    surprises
      .slice()
      .sort((a, b) => (b.surprise?.score || 0) - (a.surprise?.score || 0))[0] || null;

  // optional: best “alignment” examples (winners that matched RAI)
  const topAligned =
    aligned
      .slice()
      .sort((a, b) => (b.rai?.value || 0) - (a.rai?.value || 0))
      .slice(0, 3) || [];

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-1">NBA — Match-based FAIR Analysis</h1>

      <p className="text-sm text-gray-600 mb-6">
        Last completed games · Updated at {new Date(data.updatedAt).toLocaleString()} · Matches:{" "}
        {data.matches.length}
      </p>

      {/* ✅ WEEKLY FAIR SUMMARY BOX (PUTS THE “WEEK” IN CONTEXT) */}
      <section className="mb-8 border rounded-xl p-5 bg-gradient-to-b from-gray-50 to-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Weekly FAIR Summary</h2>
            <p className="text-sm text-gray-600 mt-1">
              “No surprise” = winner matched the RAI-favored team. “Surprise” = upset (winner ≠ RAI
              favored), weighted by edge × execution intensity.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-xs text-gray-500">Games analyzed</div>
            <div className="text-2xl font-semibold">{total}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {/* Alignment */}
          <div className="border rounded-lg p-4 bg-white">
            <div className="text-sm font-semibold">RAI ↔ Outcome alignment</div>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <div className="text-2xl font-semibold">{aligned.length}</div>
                <div className="text-xs text-gray-500">No-surprise games</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {total === 0 ? "—" : `${Math.round((aligned.length / total) * 100)}%`}
                </div>
                <div className="text-xs text-gray-500">Alignment rate</div>
              </div>
            </div>

            {topAligned.length > 0 ? (
              <div className="mt-3 text-xs text-gray-700">
                <div className="font-semibold text-gray-600 mb-1">Strongest alignments</div>
                <ul className="space-y-1">
                  {topAligned.map((m, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <span className="truncate">{m.matchup}</span>
                      <span className="shrink-0 text-gray-600">RAI {signed(m.rai.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Surprises */}
          <div className="border rounded-lg p-4 bg-white">
            <div className="text-sm font-semibold">Upsets (Surprises)</div>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <div className="text-2xl font-semibold">{surprises.length}</div>
                <div className="text-xs text-gray-500">Winner ≠ RAI favored</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {total === 0 ? "—" : `${Math.round((surprises.length / total) * 100)}%`}
                </div>
                <div className="text-xs text-gray-500">Upset rate</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-1 rounded border ${levelBadge("MINOR")}`}>
                MINOR: {counts.MINOR}
              </span>
              <span className={`px-2 py-1 rounded border ${levelBadge("MODERATE")}`}>
                MODERATE: {counts.MODERATE}
              </span>
              <span className={`px-2 py-1 rounded border ${levelBadge("MAJOR")}`}>
                MAJOR: {counts.MAJOR}
              </span>
            </div>
          </div>

          {/* Biggest surprise */}
          <div className="border rounded-lg p-4 bg-white">
            <div className="text-sm font-semibold">Biggest surprise</div>

            {biggestSurprise ? (
              <div className="mt-2">
                <div className="font-semibold">{biggestSurprise.matchup}</div>
                <div className="text-sm text-gray-700 mt-1">
                  Winner: <span className="font-medium">{biggestSurprise.surprise.winner}</span>
                </div>
                <div className="text-sm text-gray-700">
                  RAI favored:{" "}
                  <span className="font-medium">{biggestSurprise.surprise.raiFavored}</span>
                </div>

                <div className="mt-2 text-sm text-gray-700">
                  Surprise score:{" "}
                  <span className="font-semibold">{biggestSurprise.surprise.score.toFixed(2)}</span>
                  <span
                    className={`ml-2 inline-block px-2 py-0.5 text-xs font-semibold border rounded ${levelBadge(
                      biggestSurprise.surprise.level as Level
                    )}`}
                  >
                    {biggestSurprise.surprise.level}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  Logical outcome: {signed(biggestSurprise.surprise.logicalOutcome)}
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-600">
                No upsets detected in this batch (winner matched RAI in all games).
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🔥 TOP SURPRISES BOX */}
      <section className="mb-8 border rounded-xl p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">🔥 Top FAIR Surprises</h2>

        {data.topSurprises.length === 0 ? (
          <p className="text-sm text-gray-600">No FAIR surprises detected (PAI aligned with RAI).</p>
        ) : (
          <ul className="space-y-3">
            {data.topSurprises.map((s, i) => (
              <li key={i} className="border rounded-lg bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{s.matchup}</div>
                    <div className="text-sm text-gray-700 mt-1">RAI edge: {s.raiEdge}</div>
                    <div className="text-sm text-gray-700">
                      Surprise score: <span className="font-medium">{s.score.toFixed(2)}</span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-1 text-xs font-semibold border rounded ${levelBadge(
                      s.level as Level
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
        <section key={i} className="mb-8 border-b pb-6">
          <h2 className="text-lg font-semibold">{m.matchup}</h2>
          <p className="text-sm mb-3">Final score: {m.finalScore}</p>

          <h3 className="font-semibold">Pregame — Comparative Readiness (RAI)</h3>
          <p className="mb-2">
            RAI edge: <strong>{m.rai.edge}</strong> ({signed(m.rai.value)})
          </p>

          <ul className="list-disc ml-5 text-sm mb-4">
            {m.rai.levers.map((l, j) => (
              <li key={j}>
                {l.label}: {signed(l.value)}
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
                    {l.label}: {signed(l.value)}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* SURPRISE TAG (in card) */}
          {m.surprise.isSurprise ? (
            <div className="mt-3 border rounded-lg p-3 bg-gray-50">
              <div className="font-semibold">FAIR Surprise</div>
              <div className="text-sm text-gray-700">
                Winner: <span className="font-medium">{m.surprise.winner}</span> · RAI favored:{" "}
                <span className="font-medium">{m.surprise.raiFavored}</span>
              </div>
              <div className="text-sm text-gray-700 mt-1">
                Surprise score: <span className="font-semibold">{m.surprise.score.toFixed(2)}</span>
                <span className="ml-2 text-gray-500">· Logical outcome: {signed(m.surprise.logicalOutcome)}</span>
                <span
                  className={`ml-2 inline-block px-2 py-0.5 text-xs font-semibold border rounded ${levelBadge(
                    m.surprise.level as Level
                  )}`}
                >
                  {m.surprise.level}
                </span>
              </div>
            </div>
          ) : null}

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
