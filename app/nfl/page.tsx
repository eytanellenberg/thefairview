import { buildNFLSnapshot, NFLMatchCard } from "@/lib/nflSnapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PAILever = {
  lever: string;
  value: number;
  status: string;
};

export default async function NFLPage() {
  const data: {
    sport: string;
    updatedAt: string;
    matches: NFLMatchCard[];
  } = await buildNFLSnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NFL — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at {data.updatedAt}
      </p>

      <h2 className="text-lg font-semibold mb-4">Played matches</h2>

      {data.matches.map((m, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 mb-6 bg-white shadow-sm"
        >
          <h3 className="font-medium mb-1">{m.match}</h3>

          <p className="text-sm mb-3">Final score: {m.finalScore}</p>

          {/* 🔵 RAI */}
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-1">
              Pregame — Comparative Readiness (RAI)
            </h4>

            <p className="text-sm mb-1">
              RAI edge:{" "}
              <strong>
                {m.pregame.edgeTeam} (+{m.pregame.delta})
              </strong>
            </p>

            <ul className="list-disc ml-5 text-sm">
              {m.pregame.levers.map((l, i) => (
                <li key={i}>
                  {l.lever}: {l.advantage}{" "}
                  ({l.value >= 0 ? "+" : ""}
                  {l.value})
                </li>
              ))}
            </ul>
          </div>

          {/* 🔴 PAI */}
          <div className="mb-2">
            <h4 className="font-semibold text-sm mb-1">
              Postgame — Comparative Execution (PAI)
            </h4>

            {m.postgame.teams.map((t, j) => (
              <div key={j} className="mb-3">
                <strong>{t.team}</strong>
                <p className="text-xs text-gray-500">Last: {t.lastScore}</p>

                <ul className="list-disc ml-5 text-sm">
                  {(t.levers as PAILever[]).map((lv, k) => (
                    <li key={k}>
                      {lv.lever}: {lv.status}{" "}
                      <strong>
                        ({lv.value >= 0 ? "+" : ""}
                        {lv.value})
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <p className="text-sm italic text-gray-600">
              {m.postgame.conclusion}
            </p>
          </div>
        </div>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
