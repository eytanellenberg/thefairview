bash

cat > /home/claude/PAGE-SIMPLE.txt << 'EOF'
'use client';

import { useState } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-5xl font-bold mb-4">TheFairView</h1>
        <p className="text-xl text-slate-300">
          Analyse de performance sportive par attribution causale
        </p>
        
        <div className="mt-6 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🎯 Analyses Professionnelles</h3>
          <p className="text-slate-300 text-sm">
            Données pré-match détaillées (RAI par équipe, leviers clés) + intégration données club.
            <br />
            <a href="mailto:eytan_ellenberg@yahoo.fr" className="text-blue-400 hover:text-blue-300 underline">
              Contactez-nous
            </a>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Sélectionner un Sport</h2>
          <div className="flex gap-4">
            <button className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold transition">
              🏀 NBA
            </button>
            <button disabled className="bg-slate-700 px-6 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed">
              🏈 NFL (Bientôt)
            </button>
            <button disabled className="bg-slate-700 px-6 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed">
              ⚽ Soccer (Bientôt)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Version FAIR v2 en cours</h2>
          <p className="text-slate-400">
            Site en reconstruction avec formule FAIR originale et données ESPN réelles.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 text-center text-slate-400 text-sm">
        <p>TheFairView - Attribution Causale pour le Sport</p>
        <p className="mt-2">Basé sur la méthodologie FAIR</p>
      </div>
    </main>
  );
}
EOF
cat /home/claude/PAGE-SIMPLE.txt
Output

'use client';

import { useState } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-5xl font-bold mb-4">TheFairView</h1>
        <p className="text-xl text-slate-300">
          Analyse de performance sportive par attribution causale
        </p>
        
        <div className="mt-6 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🎯 Analyses Professionnelles</h3>
          <p className="text-slate-300 text-sm">
            Données pré-match détaillées (RAI par équipe, leviers clés) + intégration données club.
            <br />
            <a href="mailto:eytan_ellenberg@yahoo.fr" className="text-blue-400 hover:text-blue-300 underline">
              Contactez-nous
            </a>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Sélectionner un Sport</h2>
          <div className="flex gap-4">
            <button className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold transition">
              🏀 NBA
            </button>
            <button disabled className="bg-slate-700 px-6 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed">
              🏈 NFL (Bientôt)
            </button>
            <button disabled className="bg-slate-700 px-6 py-3 rounded-lg font-semibold opacity-50 cursor-not-allowed">
              ⚽ Soccer (Bientôt)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Version FAIR v2 en cours</h2>
          <p className="text-slate-400">
            Site en reconstruction avec formule FAIR originale et données ESPN réelles.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 text-center text-slate-400 text-sm">
        <p>TheFairView - Attribution Causale pour le Sport</p>
        <p className="mt-2">Basé sur la méthodologie FAIR</p>
      </div>
    </main>
  );
}
