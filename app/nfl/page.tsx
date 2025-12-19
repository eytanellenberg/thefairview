import { buildNFLSnapshot } from "@/lib/nflSnapshot";

type RAILever = {
  lever: string;
  advantage: string;
  value: number;
};

type PAILever = {
  lever: string;
  status: string;
};

type TeamBlock = {
  team: string;
  comparativePAI: {
    levers: PAILever[];
  };
};

type MatchSnapshot = {
  match: string;
  finalScore: string;
  comparativeRAI: {
    edge: string;
    delta: number;
    levers: RAILever[];
  };
  teams: TeamBlock[];
};

export default async function NFLPage() {
  const data: {
    sport: string;
    updatedAt: string;
    matches: MatchSnapshot[];
  } = await buildNFLSnapshot();

  return (
    <main className="p-6 max-w-5xl mx-auto bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-2">
        NFL — Match-based FAIR Analysis
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        Updated at {new Date(data.updatedAt).toISOString()}
      </p>

      {data.matches.map((match, idx) => (
        <section
          key={idx}
          className="mb-10 pb-6 border-b border-gray-200"
        >
          <h2 className="text-lg font-semibold mb-1">{match.match}</h2>

          <p className="text-sm mb-3">
            Final score: {match.finalScore}
          </p>

          {/* RAI */}
          <h3 className="font-medium mt-3">
            Pregame — Comparative Readiness (RAI)
          </h3>

          <p className="text-sm mb-2">
            RAI edge: <strong>{match.comparativeRAI.edge}</strong>{" "}
            ({match.comparativeRAI.delta >= 0 ? "+" : ""}
            {match.comparativeRAI.delta})
          </p>

          <ul className="list-disc ml-5 text-sm mb-4">
            {match.comparativeRAI.levers.map(
              (l: RAILever, i: number) => (
                <li key={i}>
                  {l.lever}: {l.advantage}{" "}
                  ({l.value >= 0 ? "+" : ""}
                  {l.value})
                </li>
              )
            )}
          </ul>

          {/* PAI */}
          <h3 className="font-medium">
            Postgame — Comparative Execution (PAI)
          </h3>

          {match.teams.map((team, j) => (
            <div key={j} className="mt-3">
              <p className="font-semibold text-sm">{team.team}</p>
              <ul className="list-disc ml-5 text-sm">
                {team.comparativePAI.levers.map(
                  (l: PAILever, k: number) => (
                    <li key={k}>
                      {l.lever}: {l.status}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </section>
      ))}

      <footer className="text-xs text-gray-500 mt-10">
        FAIR — structure over narrative · eytan_ellenberg@yahoo.fr
      </footer>
    </main>
  );
}
