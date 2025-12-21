import { computeNBASnapshot } from "@/lib/nbaAutoSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NBAPage() {
  const data = await computeNBASnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NBA — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Last completed games · Updated at{" "}
        {new Date(data.updatedAt).toLocaleString()} · Matches:{" "}
        {data.matches.length}
      </p>

      {data.matches.map((m, i) => (
        <section key={i} className="mb-10 border-b pb-6">
          <h2 className="text-xl font-semibold mb-1">{m.matchup}</h2>
          <p className="mb-3 text-sm">Final score: {m.finalScore}</p>

          <h3 className="font-semibold mt-4">
            Pregame — Comparative Readiness (RAI)
          </h3>
          <p className="mb-2">
            RAI edge: <strong>{m.rai.edgeTeam}</strong> (+{m.rai.value})
          </p>
          <ul className="list-disc ml-5 text-sm mb-4">
            {m.rai.levers.map((l, j) => (
              <li key={j}>
                {l.label}: {l.value >= 0 ? "+" : ""}
                {l.value}
              </li>
            ))}
          </ul>

          <h3 className="font-semibold mt-4">
            Postgame — Comparative Execution (PAI)
          </h3>

          {m.pai.map((t, j) => (
            <div key={j} className="mb-4">
              <p className="font-semibold">{t.team}</p>
              <p className="text-sm mb-1">Last: {t.score}</p>
              <ul className="list-disc ml-5 text-sm">
                {t.levers.map((l, k) => (
                  <li key={k}>
                    {l.label}: {l.value >= 0 ? "+" : ""}
                    {l.value}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="text-sm italic mt-2">
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
