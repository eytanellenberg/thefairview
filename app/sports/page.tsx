"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SPORTS } from "@/app/lib/Demo/sports";

export default function SportsPage() {
  const [selected, setSelected] = useState<string>("nba");

  const pack = useMemo(() => SPORTS.find(s => s.sport === selected), [selected]);

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("TheFairView — Club data integration request");
    const body = encodeURIComponent(
      `Hi Eytan,\n\nWe want to integrate club stats + internal monitoring data into TheFairView (RAI pre-game + PAI post-game) for our team(s).\n\nSport: ${selected.toUpperCase()}\nTeams of interest: \n\nData we can provide (tick): GPS / wellness / injuries / lineup / tactical tags / training load / travel / etc.\n\nGoal: free demo for recent matches + next match readiness.\n\nThanks,\n`
    );
    return `mailto:eytan_ellenberg@yahoo.fr?subject=${subject}&body=${body}`;
  }, [selected]);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">TheFairView</h1>
          <p className="text-slate-400">Sports Performance Analysis through Causal Attribution (Free demo)</p>
          <div className="flex gap-2 flex-wrap">
            <Link className="underline text-slate-300" href="/">Home</Link>
          </div>
        </header>

        <section className="rounded-xl bg-slate-900 p-5">
          <h2 className="text-xl font-semibold mb-3">Choose a sport</h2>
          <div className="flex gap-2 flex-wrap">
            {SPORTS.map(s => (
              <button
                key={s.sport}
                onClick={() => setSelected(s.sport)}
                className={`rounded-lg px-4 py-2 ${
                  selected === s.sport ? "bg-slate-700" : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-slate-400 text-sm mt-3">{pack?.description}</p>
        </section>

        <section className="rounded-xl bg-slate-900 p-5 space-y-4">
          <h2 className="text-xl font-semibold">Latest matches per team</h2>

          {pack?.teams.map(t => (
            <div key={t.team} className="rounded-xl bg-slate-950/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{t.team}</div>
                <div className="text-xs text-slate-400">Demo data</div>
              </div>

              {t.recent.map(m => (
                <div key={m.id} className="rounded-lg bg-slate-900 p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="text-slate-300">
                      <span className="text-slate-400">{m.date}</span>{" "}
                      — {t.team} {m.homeAway === "H" ? "vs" : "@"} {m.opponent}{" "}
                      <span className="text-slate-400">({m.score})</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      Prediction: <span className="text-slate-200">{m.predictedEdge}</span> · Actual:{" "}
                      <span className="text-slate-200">{m.actualOutcome}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="rounded-lg bg-slate-950/40 p-3">
                      <div className="font-semibold">RAI (pre-game): {m.raiPre}</div>
                      <div className="text-xs text-slate-400 mb-2">
                        Readiness attribution from multiple levers (public stats + club data when available).
                      </div>
                      <ul className="list-disc list-inside text-slate-300">
                        {m.preLevers.map((x, i) => (
                          <li key={i}>{x.name} ({x.w})</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg bg-slate-950/40 p-3">
                      <div className="font-semibold">PAI (post-game): {m.paiPost}</div>
                      <div className="text-xs text-slate-400 mb-2">
                        Match impact attribution from key drivers (execution, errors, efficiency).
                      </div>
                      <ul className="list-disc list-inside text-slate-300">
                        {m.postLevers.map((x, i) => (
                          <li key={i}>{x.name} ({x.w})</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-300">
                    Alignment (prediction ↔ reality):{" "}
                    <span className="font-semibold">{Math.round(m.alignment * 100)}%</span>
                    <span className="text-slate-500"> (demo metric; will be FAIR-engine calibrated on real historical data)</span>
                  </div>
                </div>
              ))}

              <div className="rounded-lg bg-slate-900 p-4">
                <div className="font-semibold mb-1">Next match (free)</div>
                <div className="text-slate-300">
                  {t.next.date} — {t.team} {t.next.homeAway === "H" ? "vs" : "@"} {t.next.opponent}
                </div>
                <div className="mt-2">
                  <span className="font-semibold">RAI forecast:</span>{" "}
                  <span className="text-slate-200">{t.next.raiForecast}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 mb-2">Top predictive levers:</div>
                <ul className="list-disc list-inside text-slate-300">
                  {t.next.forecastLevers.map((x, i) => (
                    <li key={i}>{x.name} ({x.w})</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl bg-slate-900 p-5">
          <h2 className="text-xl font-semibold mb-2">Club / analyst integration</h2>
          <p className="text-slate-300">
            For RAI pre-game &amp; PAI post-game per team, using multiple levers (public stats + club internal data),
            contact:
          </p>
          <a className="underline text-slate-200" href={mailto}>
            email to eytan_ellenberg@yahoo.fr
          </a>
          <p className="text-xs text-slate-500 mt-2">
            Free demo view. FAIR-engine sport calibration on real data (historical matches + club signals) comes next.
          </p>
        </section>
      </div>
    </main>
  );
}
