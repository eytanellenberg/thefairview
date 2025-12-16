"use client";

import { useEffect, useState } from "react";
import { NBA_TEAMS } from "@/lib/data/nbaTeams";

export default function NBALivePage() {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result: Record<string, any> = {};

      for (const team of NBA_TEAMS) {
        try {
          const [raiRes, paiRes] = await Promise.all([
            fetch(`/api/rai?sport=nba&teamId=${team.id}`),
            fetch(`/api/pai?sport=nba&teamId=${team.id}`),
          ]);

          const rai = await raiRes.json();
          const pai = await paiRes.json();

          result[team.id] = { team, rai, pai };
        } catch (e) {
          result[team.id] = { team, error: true };
        }
      }

      setData(result);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-8">Loading NBA live data…</div>;
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">NBA — Live FAIR Engine</h1>
        <p className="text-gray-600">
          Free public snapshot · Last game (PAI) + Next game (RAI) per team
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {NBA_TEAMS.map((t) => {
          const item = data[t.id];
          if (!item || item.error) {
            return (
              <div key={t.id} className="border rounded-xl p-4">
                <h2 className="font-semibold">{t.name}</h2>
                <p className="text-sm text-gray-500">Data unavailable</p>
              </div>
            );
          }

          const { rai, pai } = item;

          return (
            <div key={t.id} className="border rounded-xl p-4 space-y-3">
              <h2 className="text-lg font-semibold">{t.name}</h2>

              {/* Last game */}
              <div className="text-sm">
                <div className="font-medium">Last game</div>
                {pai?.status === "free" ? (
                  <>
                    <div>
                      {pai.game.home.name} {pai.game.home.score} – {pai.game.away.score} {pai.game.away.name}
                    </div>
                    <div className="text-gray-500">PAI: {pai.pai}</div>
                    <ul className="list-disc ml-4">
                      {pai.factors.map((f: any, i: number) => (
                        <li key={i}>{f.factor}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="text-gray-400">No completed game</div>
                )}
              </div>

              {/* Next game */}
              <div className="text-sm">
                <div className="font-medium">Next game</div>
                {rai?.status === "free" ? (
                  <>
                    <div>
                      {rai.game.home.name} vs {rai.game.away.name}
                    </div>
                    <div className="text-gray-500">
                      RAI: {rai.rai}
                    </div>
                    <ul className="list-disc ml-4">
                      {rai.factors.map((f: any, i: number) => (
                        <li key={i}>{f.factor}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="text-gray-400">No upcoming game</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <footer className="text-sm text-gray-500">
        RAI / PAI computed per team using public data only. Club data integration available — contact us.
      </footer>
    </main>
  );
}
