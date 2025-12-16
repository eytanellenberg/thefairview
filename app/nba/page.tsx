import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export const revalidate = 6 * 60 * 60; // 6 heures

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">NBA — FAIR Engine</h1>
        <p className="text-gray-600">
          Structural performance & readiness attribution (public data snapshot)
        </p>
        <p className="text-xs text-gray-400">
          Last update: {new Date(data.updatedAt).toLocaleString()}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.snapshot.map((item: any) => (
          <div
            key={item.team.id}
            className="border rounded-2xl p-5 space-y-6"
          >
            <h2 className="text-xl font-semibold">{item.team.name}</h2>

            {/* -------- PAI -------- */}
            {item.pai && (
              <section className="space-y-2">
                <h3 className="font-semibold text-red-600">
                  Observed structural execution (PAI)
                </h3>

                {item.lastGame && (
                  <div className="text-sm font-medium text-gray-900">
                    Last game — {item.lastGame.home.name}{" "}
                    {item.lastGame.home.score} –{" "}
                    {item.lastGame.away.score}{" "}
                    {item.lastGame.away.name}
                  </div>
                )}

                <div className="font-bold">
                  PAI: {item.pai.value}{" "}
                  <span className="text-xs text-gray-500">
                    (net impact {item.pai.net > 0 ? "+" : ""}{item.pai.net})
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  Structural execution quality, independent of final result.
                </p>

                <ul className="text-sm space-y-1">
                  {item.pai.topLevers.map((l: any, i: number) => (
                    <li key={i}>
                      <strong>
                        {l.contribution > 0 ? "+" : ""}
                        {l.contribution}
                      </strong>{" "}
                      {l.lever}
                      <div className="text-xs text-gray-500">
                        {l.rationale}
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-gray-400 italic">
                  Note: team may win despite negative PAI due to variance,
                  opponent inefficiency, or clutch events.
                </p>
              </section>
            )}

            {/* -------- RAI -------- */}
            {item.rai && (
              <section className="space-y-2">
                <h3 className="font-semibold text-blue-600">
                  Matchup-relative readiness (RAI)
                </h3>

                {item.nextGame && (
                  <div className="text-sm text-gray-700">
                    Next game — {item.nextGame.home.name} vs{" "}
                    {item.nextGame.away.name}
                  </div>
                )}

                <div className="font-bold">
                  RAI: {item.rai.value}{" "}
                  <span className="text-xs text-gray-500">
                    (net readiness {item.rai.net > 0 ? "+" : ""}{item.rai.net})
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  Structural readiness relative to opponent and matchup.
                </p>

                <ul className="text-sm space-y-1">
                  {item.rai.topLevers.map((l: any, i: number) => (
                    <li key={i}>
                      <strong>
                        {l.contribution > 0 ? "+" : ""}
                        {l.contribution}
                      </strong>{" "}
                      {l.lever}
                      <div className="text-xs text-gray-500">
                        {l.rationale}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ))}
      </div>

      <footer className="text-sm text-gray-500 max-w-4xl">
        PAI explains observed execution quality post-game, independently of score.
        <br />
        RAI estimates pre-game structural readiness relative to the upcoming opponent.
        <br />
        Club data integration enables deeper tactical resolution.
      </footer>
    </main>
  );
}
