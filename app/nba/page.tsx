import { computeNBALastGamesSnapshot } from "@/lib/nbaLastGamesSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NBAPage() {
  const data = computeNBALastGamesSnapshot();

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

      {data.matches.map((match, i) => (
        <section
          key={i}
          className="mb-10 border rounded-lg p-4 bg-white shadow-sm"
        >
          {/* MATCHUP */}
          <h2 className="text-xl font-semibold mb-1">
            {match.matchup}
          </h2>

          <p className="text-sm mb-3">
            Final score: {match.finalScore}
          </p>

          {/* RAI */}
          <h3 className="font-semibold mt-4">
            Pregame — Comparative Readiness (RAI)
          </h3>

          <p className="mb-2">
            RAI edge:{" "}
            <strong>{match.rai.edge.team}</strong>{" "}
            ({match.rai.edge.value >= 0 ? "+" : ""}
            {match.rai.edge.value.toFixed(2)})
          </p>

          <ul className="list-disc ml-5 text-sm mb-4">
            {match.rai.levers.map((l, idx) => (
              <li key={idx}>
                {l.lever}:{" "}
                {l.value >= 0 ? "+" : ""}
                {l.value.toFixed(2)}
              </li>
            ))}
          </ul>

          {/* PAI */}
          <h3 className="font-semibold mt-4">
            Postgame — Comparative Execution (PAI)
          </h3>

          {[match.pai.teamA, match.pai.teamB].map((team, idx) => (
            <div key={idx} className="mb-4">
              <p className="font-semibold">{team.team}</p>
              <p className="text-sm mb-1">Last: {team.score}</p>

              <ul className="list-disc ml-5 text-sm">
                {team.levers.map((l, j) => (
                  <li key={j}>
                    {l.lever}:{" "}
                    {l.value >= 0 ? "+" : ""}
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
