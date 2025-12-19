import { notFound } from "next/navigation";

import { buildNBASnapshot } from "@/lib/nbaSnapshot";
import { buildNFLSnapshot } from "@/lib/nflSnapshot";
import { buildSoccerSnapshot } from "@/lib/soccerSnapshot";

type Sport = "nba" | "nfl" | "soccer";

export default async function SportPage({
  params,
}: {
  params: { sport: Sport };
}) {
  const { sport } = params;

  let data;

  switch (sport) {
    case "nba":
      data = await buildNBASnapshot();
      break;

    case "nfl":
      data = await buildNFLSnapshot();
      break;

    case "soccer":
      data = await buildSoccerSnapshot();
      break;

    default:
      notFound();
  }

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        {data.title}
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at {data.updatedAt}
      </p>

      {data.matches.map((match: any, index: number) => (
        <div
          key={index}
          className="border rounded-lg p-4 mb-6 bg-white shadow-sm"
        >
          <h2 className="text-lg font-medium mb-1">
            {match.teamA.name} vs {match.teamB.name}
          </h2>

          <p className="text-sm mb-3">
            Final score: {match.finalScore}
          </p>

          {/* 🔵 RAI */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-1">
              Pregame — Comparative Readiness (RAI)
            </h3>

            <p className="text-sm mb-1">
              RAI edge:{" "}
              <strong>
                {match.rai.edgeTeam} +{match.rai.delta}
              </strong>
            </p>

            <ul className="list-disc ml-5 text-sm">
              {match.rai.levers.map((l: any, i: number) => (
                <li key={i}>
                  {l.lever}: {l.advantage} {l.value > 0 ? "+" : ""}
                  {l.value}
                </li>
              ))}
            </ul>
          </div>

          {/* 🔴 PAI */}
          <div className="mb-2">
            <h3 className="font-semibold text-sm mb-1">
              Postgame — Comparative Execution (PAI)
            </h3>

            {[match.teamA, match.teamB].map((team: any, j: number) => (
              <div key={j} className="mb-2">
                <strong>{team.name}</strong>
                <ul className="list-disc ml-5 text-sm">
                  {team.pai.levers.map((l: any, k: number) => (
                    <li key={k}>
                      {l.lever}: {l.status}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-sm italic text-gray-600">
            {match.conclusion}
          </p>
        </div>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
