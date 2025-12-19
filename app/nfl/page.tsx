// app/nfl/page.tsx

import { computeNFLWeekSnapshot } from "@/lib/nflWeekSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NFLPage() {
  const data = await computeNFLWeekSnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NFL — Match-based FAIR Analysis (Last completed week)
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Season {data.seasonYear} · Type {data.seasonType} · Week {data.week} ·
        Updated at {new Date(data.updatedAt).toLocaleString()} · Matches:{" "}
        {data.matches.length}
      </p>

      {data.matches.map((match, i) => (
        <section key={i} className="mb-10 border-b pb-6">
          <h2 className="text-xl font-semibold mb-1">{match.matchup}</h2>
          <p className="mb-3 text-sm">Final score: {match.finalScore}</p>

          <h3 className="font-semibold mt-4">
            Pregame — Comparative Readiness (RAI)
          </h3>
          <p className="mb-2">
            RAI edge: <strong>{match.rai.edgeTeam}</strong>{" "}
            ({match.rai.edgeValue >= 0 ? "+" : ""}
            {match.rai.edgeValue.toFixed(2)})
          </p>
          <ul className="list-disc ml-5 text-sm mb-4">
            {match.rai.levers.map((l, idx) => (
              <li key={idx}>
                {l.lever}: {l.value >= 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>

          <h3 className="font-semibold mt-4">
            Postgame — Comparative Execution (PAI)
          </h3>

          {[match.pai.teamA, match.pai.teamB].map((t, idx) => (
            <div key={idx} className="mb-4">
              <p className="font-semibold">{t.team}</p>
              <p className="text-sm mb-1">Last: {t.score}</p>
              <ul className="list-disc ml-5 text-sm">
                {t.levers.map((l, j) => (
                  <li key={j}>
                    {l.lever}: {l.value >= 0 ? "+" : ""}
                    {l.value.toFixed(2)}
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
