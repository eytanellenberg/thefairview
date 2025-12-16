export const revalidate = 6 * 60 * 60; // 6 hours

async function getSnapshot() {
  const res = await fetch("/api/nba/snapshot", {
    next: { revalidate: 6 * 60 * 60 }
  });

  if (!res.ok) {
    throw new Error("Failed to load NBA snapshot");
  }

  return res.json();
}

export default async function NBAPage() {
  const data = await getSnapshot();

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">NBA — FAIR Engine</h1>
        <p className="text-gray-600">
          Static snapshot · Updated periodically · FAIR-Sport attribution
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

            {/* POST-GAME — PAI */}
            {item.pai && (
              <section className="space-y-2">
                <h3 className="font-semibold text-red-600">
                  Observed impact (PAI)
                </h3>

                {item.lastGame && (
                  <div className="text-sm text-gray-700">
                    {item.lastGame.home.name}{" "}
                    {item.lastGame.home.score} –{" "}
                    {item.lastGame.away.score}{" "}
                    {item.lastGame.away.name}
                  </div>
                )}

                <div className="text-lg font-bold">
                  PAI: {item.pai.value}
                </div>

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
              </section>
            )}

            {/* PRE-GAME — RAI */}
            <section className="space-y-2">
              <h3 className="font-semibold text-blue-600">
                Predicted readiness (RAI)
              </h3>

              {item.nextGame && (
                <div className="text-sm text-gray-700">
                  {item.nextGame.home.name} vs{" "}
                  {item.nextGame.away.name}
                </div>
              )}

              <div className="text-lg font-bold">
                RAI: {item.rai.value}
              </div>

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
          </div>
        ))}
      </div>

      <footer className="text-sm text-gray-500 max-w-4xl">
        RAI is computed pre-game using structural FAIR-Sport predictors.
        PAI decomposes observed execution post-game.
        Club data integration enables higher-resolution attribution.
      </footer>
    </main>
  );
}
