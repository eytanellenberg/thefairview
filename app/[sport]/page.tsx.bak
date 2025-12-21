import { notFound } from "next/navigation";

import { buildNBASnapshot } from "@/lib/nbaSnapshot";
import { buildNFLSnapshot } from "@/lib/nflSnapshot";
import { buildSoccerSnapshot } from "@/lib/soccerSnapshot";

type Sport = "nba" | "nfl" | "soccer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SportPage({
  params,
}: {
  params: { sport: Sport };
}) {
  const { sport } = params;

  let data: any;

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

  const title =
    sport === "nba"
      ? "NBA — Match-based FAIR Analysis"
      : sport === "nfl"
      ? "NFL — Match-based FAIR Analysis"
      : "Soccer — Match-based FAIR Analysis";

  // support both shapes:
  // - { snapshot: [...] } (NBA style)
  // - { matches: [...] }  (NFL/Soccer style)
  const blocks = Array.isArray(data.matches)
    ? data.matches
    : Array.isArray(data.snapshot)
    ? data.snapshot
    : [];

  return (
    <main className="p-6 max-w-5xl mx-auto text-gray-900 bg-white">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at {data.updatedAt}
      </p>

      <h2 className="text-lg font-semibold mb-4">Played matches</h2>

      {blocks.map((match: any, index: number) => {
        // match may be:
        // - an array [teamAEntry, teamBEntry] (your NFL/Soccer grouping)
        // - or already a ready object (future-proof)
        const pair = Array.isArray(match) ? match : null;

        const A = pair ? pair[0] : match?.teamA;
        const B = pair ? pair[1] : match?.teamB;

        if (!A || !B) return null;

        const teamAName = A.team?.name ?? A.name ?? "Team A";
        const teamBName = B.team?.name ?? B.name ?? "Team B";

        const finalScore =
          A.lastGame?.score ?? match?.finalScore ?? "—";

        const rai = A.comparativeRAI ?? match?.rai;
        const paiA = A.comparativePAI ?? A.pai ?? null;
        const paiB = B.comparativePAI ?? B.pai ?? null;

        const conclusion =
          A.comparativePAI?.conclusion ??
          match?.conclusion ??
          "";

        return (
          <div
            key={index}
            className="border rounded-lg p-4 mb-6 bg-white shadow-sm"
          >
            <h3 className="font-medium mb-1">
              {teamAName} vs {teamBName}
            </h3>

            <p className="text-sm mb-3">Final score: {finalScore}</p>

            {/* 🔵 RAI */}
            {rai && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-1">
                  Pregame — Comparative Readiness (RAI)
                </h4>

                <p className="text-sm mb-1">
                  RAI edge:{" "}
                  <strong>
                    {rai.edgeTeam} +{rai.delta}
                  </strong>
                </p>

                <ul className="list-disc ml-5 text-sm">
                  {(rai.levers ?? []).map((l: any, i: number) => (
                    <li key={i}>
                      {l.lever}: {l.advantage}{" "}
                      {l.value >= 0 ? "+" : ""}
                      {l.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 🔴 PAI */}
            {(paiA || paiB) && (
              <div className="mb-2">
                <h4 className="font-semibold text-sm mb-1">
                  Postgame — Comparative Execution (PAI)
                </h4>

                {[
                  { name: teamAName, pai: paiA },
                  { name: teamBName, pai: paiB },
                ].map((t, j) => (
                  <div key={j} className="mb-2">
                    <strong>{t.name}</strong>
                    <ul className="list-disc ml-5 text-sm">
                      {(t.pai?.levers ?? []).map((l: any, k: number) => (
                        <li key={k}>
                          {l.lever}: {l.status}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {conclusion && (
              <p className="text-sm italic text-gray-600">{conclusion}</p>
            )}
          </div>
        );
      })}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
