import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export const revalidate = 6 * 60 * 60; // 6h

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">NBA — FAIR Engine</h1>
        <p className="text-gray-600">
          Static snapshot · FAIR-Sport causal attribution
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

            {item.pai && (
              <section>
                <h3 className="font-semibold text-red-600">
                  Observed impact (PAI)
                </h3>
                {item.lastGame && (
                  <div className="text-sm font-medium text-gray-900">
                    {item.lastGame.home.name}{" "}
                    {item.lastGame.home.score} –{" "}
                    {item.lastGame.away.score}{" "}
                    {item.lastGame.away.name}
                  </div>
                )}
                <div className="font-bold">PAI: {item.pai.value}</div>
                <ul className="text-sm">
                  {item.pai.topLevers.map((l: any, i: number) => (
                    <li key={i}>
                      <strong>{l.contribution > 0 ? "+" : ""}{l.contribution}</strong>{" "}
                      {l.lever}
                      <div className="text-xs text-gray-500">{l.rationale}</div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h3 className="font-semibold text-blue-600">
                Predicted readiness (RAI)
              </h3>
              {item.nextGame && (
                <div className="text-sm text-gray-700">
                  {item.nextGame.home.name} vs {item.nextGame.away.name}
                </div>
              )}
              <div className="font-bold">RAI: {item.rai.value}</div>
              <ul className="text-sm">
                {item.rai.topLevers.map((l: any, i: number) => (
                  <li key={i}>
                    <strong>{l.contribution > 0 ? "+" : ""}{l.contribution}</strong>{" "}
                    {l.lever}
                    <div className="text-xs text-gray-500">{l.rationale}</div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ))}
      </div>

      <footer className="text-sm text-gray-500 max-w-4xl">
        RAI = pre-game structural readiness.  
        PAI = post-game observed execution.  
        Club data integration enables higher-resolution FAIR attribution.
      </footer>
    </main>
  );
}
