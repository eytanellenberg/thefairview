export const revalidate = 6 * 60 * 60;

async function getSnapshot() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/nba/snapshot`
  );
  return res.json();
}

export default async function NBAPage() {
  const data = await getSnapshot();

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-10">
      <header>
        <h1 className="text-3xl font-bold">NBA — FAIR Engine</h1>
        <p className="text-gray-600">
          Current snapshot · Updated periodically · FAIR-Sport attribution
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

            {/* PAI */}
            {item.pai && (
              <section>
                <h3 className="font-semibold text-red-600">
                  Observed impact (PAI)
                </h3>
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

            {/* RAI */}
            <section>
              <h3 className="font-semibold text-blue-600">
                Predicted readiness (RAI)
              </h3>
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
        Snapshot-based FAIR-Sport attribution.
        Updated periodically using public data.
        Club data integration enables deeper tactical resolution.
      </footer>
    </main>
  );
}
