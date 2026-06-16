import { computeWorldCup2026AutoSnapshot } from "@/lib/worldCup2026AutoSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WorldCup2026Page() {

  const data =
    await computeWorldCup2026AutoSnapshot();

  console.log(
    "PAGE DATA",
    JSON.stringify(data, null, 2)
  );

  const totalGames =
    data.matches.length;

  const upsets = data.matches.filter(
    (m) =>
      m.surprise.isSurprise &&
      m.surprise.winner !== "Draw"
  );

  const drawDeviations = data.matches.filter(
    (m) =>
      m.surprise.isSurprise &&
      m.surprise.winner === "Draw"
  );

  const alignedGames =
    totalGames -
    upsets.length -
    drawDeviations.length;

  const totalDeviations =
    upsets.length +
    drawDeviations.length;

  const alignmentRate =
    totalGames > 0
      ? Math.round(
          (alignedGames / totalGames) * 100
        )
      : 0;

const takeaway =
  totalDeviations === 0
    ? "No meaningful deviations from FIFA-based readiness expectations were observed."
    : `Among the last 24 hours of World Cup matches, ${totalDeviations} meaningful deviation${totalDeviations > 1 ? "s" : ""} from FIFA-based readiness expectations ${totalDeviations > 1 ? "were" : "was"} observed.`;
  
  return (
    <main className="max-w-4xl mx-auto p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-1">
        FIFA World Cup 2026 — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at{" "}
        {new Date(
          data.updatedAt
        ).toLocaleString()}
        {" · "}
        Matches: {totalGames}
      </p>

      {/* TOURNAMENT SUMMARY */}

      <section className="mb-6 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">
          Tournament FAIR Summary
        </h2>

<ul className="text-sm space-y-1">
  <li>
    Matches analyzed:{" "}
    <strong>{totalGames}</strong>
  </li>

  <li>
    Aligned outcomes:{" "}
    <strong>{alignedGames}</strong>
  </li>

  <li>
    Meaningful deviations:{" "}
    <strong>{totalDeviations}</strong>
  </li>

  <li>
    Alignment rate:{" "}
    <strong>{alignmentRate}%</strong>
  </li>
</ul>

        <div className="mt-4 p-3 border-l-4 border-black bg-white">
          <div className="text-sm font-semibold mb-1">
            FAIR Takeaway
          </div>

<p className="text-sm text-gray-800">
  {takeaway}
</p>

{data.topSurprises.length > 0 && (
  <p className="text-sm text-gray-700 mt-2">
    Main surprise:{" "}
    <strong>{data.topSurprises[0].matchup}</strong>
    {" — "}
    pregame readiness favored{" "}
    <strong>{data.topSurprises[0].raiEdge}</strong>.
  </p>
)}
        </div>
      </section>

{/* TOP FAIR Surprises */}

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
        <li
          key={i}
          className="border rounded-md bg-white p-3"
        >
          <div>
            <div className="font-semibold">
              {s.matchup}
            </div>

            <div className="text-sm text-gray-700">
              RAI edge: {s.raiEdge}
            </div>

            <div className="text-sm text-gray-700">
              Surprise score:{" "}
              {s.score.toFixed(2)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )}
</section>

      {/* MATCH DETAILS */}

      {data.matches.map((m, i) => (
        <section
          key={i}
          className="mb-8 border-b pb-6"
        >
          <h2 className="text-lg font-semibold">
            {m.matchup}
          </h2>

          <p className="text-sm mb-3">
            Final score: {m.finalScore}
          </p>

          <h3 className="font-semibold">
            Pregame — Comparative Readiness (RAI)
          </h3>

          <p className="mb-2">
            RAI edge:{" "}
            <strong>{m.rai.edge}</strong>
            {" (+"}
            {m.rai.value.toFixed(2)}
            {")"}
          </p>

          <ul className="list-disc ml-5 text-sm mb-4">
            {m.rai.levers.map((l, j) => (
              <li key={j}>
                {l.label}:{" "}
                {l.value > 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>

          <h3 className="font-semibold">
            Postgame — Comparative Execution (PAI)
          </h3>

          {[m.pai.teamA, m.pai.teamB].map(
            (t, k) => (
              <div key={k} className="mb-3">
                <p className="font-medium">
                  {t.name}
                </p>

                <ul className="list-disc ml-5 text-sm">
                  {t.levers.map((l, j) => (
                    <li key={j}>
                      {l.label}:{" "}
                      {l.value > 0 ? "+" : ""}
                      {l.value.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          {m.surprise.isSurprise && (
            <div className="mt-3 border rounded-md p-3 bg-gray-50">
              <div className="font-semibold">
                FAIR Surprise
              </div>

              <div className="text-sm text-gray-700">
                Winner:{" "}
                <strong>
                  {m.surprise.winner}
                </strong>
                {" · "}
                RAI favored:{" "}
                <strong>
                  {m.surprise.raiFavored}
                </strong>
              </div>

              <div className="text-sm text-gray-700">
                Surprise score:{" "}
                <strong>
                  {m.surprise.score.toFixed(2)}
                </strong>

              </div>
            </div>
          )}

          <p className="text-xs italic mt-2">
            Outcome interpreted through
            execution deltas relative to
            pregame structural expectations.
          </p>
        </section>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative ·
        eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
