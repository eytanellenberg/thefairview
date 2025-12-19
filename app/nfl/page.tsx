// app/nfl/page.tsx

import { computeNFLBigScoreSnapshot } from "@/lib/nflBigScore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NFLPage() {
  const data = await computeNFLBigScoreSnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NFL — LAST GAME (All Teams)
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at {new Date(data.updatedAt).toLocaleString()} · Teams:{" "}
        {data.teams.length}
      </p>

      {data.teams.map((t, i) => (
        <section key={i} className="mb-8 border-b pb-5">
          <h2 className="text-lg font-semibold">{t.team}</h2>
          <p className="text-sm mb-2">
            Last game vs <strong>{t.opponent}</strong> — {t.finalScore}
          </p>

          <h3 className="font-semibold mt-3">
            Pregame — Readiness (RAI)
          </h3>
          <ul className="list-disc ml-5 text-sm mb-3">
            {t.rai.levers.map((l, j) => (
              <li key={j}>
                {l.lever}: {l.value >= 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>

          <h3 className="font-semibold mt-3">
            Postgame — Execution (PAI)
          </h3>
          <ul className="list-disc ml-5 text-sm">
            {t.pai.levers.map((l, j) => (
              <li key={j}>
                {l.lever}: {l.value >= 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
