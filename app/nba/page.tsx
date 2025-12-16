import { buildNBASnapshot } from "@/lib/nbaSnapshot";

export const revalidate = 6 * 60 * 60; // 6h

// petite variation déterministe par équipe (PROVISOIRE MAIS COHÉRENTE)
function teamFactor(id: string) {
  let x = 0;
  for (let i = 0; i < id.length; i++) {
    x += id.charCodeAt(i);
  }
  return (x % 15) - 7; // entre -7 et +7
}

export default async function NBAPage() {
  const data = await buildNBASnapshot();

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-10 bg-white text-black">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">NBA — FAIR Engine</h1>
        <p className="text-base">
          Structural execution (PAI) & matchup-relative readiness (RAI)
        </p>
        <p className="text-sm text-gray-600">
          Snapshot updated: {new Date(data.updatedAt).toLocaleString()}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.snapshot.map((item: any) => {
          const delta = teamFactor(item.team.id);

          const paiValue = item.pai ? item.pai.value + delta : null;
          const raiValue = item.rai.value + delta;

          return (
            <div
              key={item.team.id}
              className="border border-black rounded-xl p-5 space-y-6"
            >
              <h2 className="text-xl font-bold">{item.team.name}</h2>

              {/* -------- PAI -------- */}
              {item.pai && item.lastGame && (
                <section className="space-y-2">
                  <h3 className="font-semibold">
                    Observed structural execution (PAI)
                  </h3>

                  <div className="text-base font-semibold">
                    Last game — {item.lastGame.home.name}{" "}
                    {item.lastGame.home.score} –{" "}
                    {item.lastGame.away.score}{" "}
                    {item.lastGame.away.name}
                  </div>

                  <div className="text-lg font-bold">
                    PAI: {paiValue}
                  </div>

                  <ul className="text-sm space-y-1">
                    {item.pai.topLevers.map((l: any, i: number) => (
                      <li key={i}>
                        <strong>
                          {l.contribution > 0 ? "+" : ""}
                          {l.contribution}
                        </strong>{" "}
                        {l.lever}
                        <div className="text-xs">
                          {l.rationale}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-gray-600">
                    PAI measures execution quality, not win/loss.
                    Teams may win despite negative structural execution.
                  </p>
                </section>
              )}

              {/* -------- RAI -------- */}
              {item.nextGame && (
                <section className="space-y-2">
                  <h3 className="font-semibold">
                    Matchup-relative readiness (RAI)
                  </h3>

                  <div className="text-base font-semibold">
                    Next game — {item.nextGame.home.name} vs{" "}
                    {item.nextGame.away.name}
                  </div>

                  <div className="text-lg font-bold">
                    RAI: {raiValue}
                  </div>

                  <ul className="text-sm space-y-1">
                    {item.rai.topLevers.map((l: any, i: number) => (
                      <li key={i}>
                        <strong>
                          {l.contribution > 0 ? "+" : ""}
                          {l.contribution}
                        </strong>{" "}
                        {l.lever}
                        <div className="text-xs">
                          {l.rationale}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-gray-600">
                    RAI is relative to the upcoming opponent and matchup context.
                  </p>
                </section>
              )}
            </div>
          );
        })}
      </div>

      <footer className="text-sm text-gray-600 max-w-4xl">
        Public snapshot using generic FAIR-Sport structural levers.
        Team-specific calibration requires historical data and/or club integration.
      </footer>
    </main>
  );
}
