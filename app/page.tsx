'use client';

import { useState } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-5xl font-bold mb-4">TheFairView</h1>
        <p className="text-xl text-slate-300">
          Sports Performance Analysis through Causal Attribution
        </p>
        
        <div className="mt-6 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🎯 Professional Analytics</h3>
          <p className="text-slate-300 text-sm">
            Pre-match detailed data (RAI per team, key levers) + integration of your club's proprietary data.
            <br />
            <a href="mailto:eytan_ellenberg@yahoo.fr" className="text-blue-400 hover:text-blue-300 underline">
              Contact us
            </a>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Select Your Sport</h2>
          <div className="flex gap-4">
            <button className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold transition">
              🏀 NBA
            </button>
            <button disabled className="bg-slate-700 px-6 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed">
              🏈 NFL (Coming Soon)
            </button>
            <button disabled className="bg-slate-700 px-6 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed">
              ⚽ Soccer (Coming Soon)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">FAIR v2 Version In Progress</h2>
          <p className="text-slate-400">
            Site under reconstruction with original FAIR formula and real ESPN data.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 text-center text-slate-400 text-sm">
        <p>TheFairView - Causal Attribution for Sports</p>
        <p className="mt-2">Based on FAIR methodology</p>
      </div>
    </main>
  );
}
