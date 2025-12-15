'use client';

import { useState, useEffect } from 'react';
import { fetchRecentGames } from './lib/espn-api';

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [raiData, setRaiData] = useState<any>(null);
  const [paiData, setPaiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    const recentGames = await fetchRecentGames();
    setGames(recentGames);
  };

  const selectMatch = async (gameId: string, teamId: string) => {
    setSelectedGame(gameId);
    setSelectedTeam(teamId);
    setLoading(true);

    try {
      // Fetch RAI
      const raiRes = await fetch(`/api/rai?gameId=${gameId}&teamId=${teamId}`);
      const rai = await raiRes.json();
      setRaiData(rai);

      // Fetch PAI
      const paiRes = await fetch(`/api/pai?gameId=${gameId}&teamId=${teamId}`);
      const pai = await paiRes.json();
      setPaiData(pai);
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-5xl font-bold mb-4">TheFairView</h1>
        <p className="text-xl text-slate-300">
          Analyse de performance sportive par attribution causale
        </p>
        
        {/* Professional Analysis Banner */}
        <div className="mt-6 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🎯 Analyses Professionnelles</h3>
          <p className="text-slate-300 text-sm">
            Données pré-match détaillées (RAI par équipe, leviers clés, prédictions) + intégration de vos données club propriétaires.
            <br />
            <a href="mailto:contact@thefairview.com" className="text-blue-400 hover:text-blue-300 underline">
              Contactez-nous pour en savoir plus
            </a>
          </p>
        </div>
      </div>

      {/* Sport Selection */}
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

      {/* Games List */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Derniers Matchs</h2>
          
          {games.length === 0 ? (
            <p className="text-slate-400">Chargement des matchs...</p>
          ) : (
            <div className="grid gap-3">
              {games.slice(0, 10).map((game) => {
                const comp = game.competitions?.[0];
                const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
                const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
                
                if (!home || !away) return null;

                return (
                  <div key={game.id} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <button
                            onClick={() => selectMatch(game.id, away.team.id)}
                            className="flex-1 text-left hover:bg-slate-600/50 p-2 rounded transition"
                          >
                            <span className="font-semibold">{away.team.displayName}</span>
                            <span className="ml-auto text-2xl font-bold">{away.score}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => selectMatch(game.id, home.team.id)}
                            className="flex-1 text-left hover:bg-slate-600/50 p-2 rounded transition"
                          >
                            <span className="font-semibold">{home.team.displayName}</span>
                            <span className="ml-auto text-2xl font-bold">{home.score}</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400 ml-4">
                        {new Date(game.date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {loading && (
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-300">Calcul en cours...</p>
        </div>
      )}

      {raiData && paiData && !loading && (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* RAI - Pre-Match Prediction */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              📊 RAI - Prédiction Avant Match
            </h2>
            <p className="text-slate-300 mb-4">
              Score de préparation de <strong>{raiData.teamName}</strong> avant le match contre {raiData.opponentName}
            </p>
            
            <div className="bg-blue-900/30 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-400 mb-2">
                  {raiData.rai.rai_score}
                </div>
                <div className="text-slate-300">Score RAI / 100</div>
                <div className="text-sm text-slate-400 mt-2">
                  Confiance: {raiData.rai.confidence}%
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Top 3 Facteurs</h3>
            <div className="space-y-3">
              {raiData.rai.top_levers.map((lever: any, idx: number) => (
                <div key={idx} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{lever.name}</span>
                    <span className="text-2xl font-bold">{lever.value}</span>
                  </div>
                  <p className="text-sm text-slate-300">{lever.explanation}</p>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      lever.impact === 'positive' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                      Impact {lever.impact === 'positive' ? 'positif' : 'négatif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAI - Post-Match Analysis */}
          <div className="bg-slate-800/50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              ✅ PAI - Analyse Après Match
            </h2>
            <p className="text-slate-300 mb-4">
              Performance réelle de <strong>{paiData.teamName}</strong>
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">Score Final</div>
                <div className="text-3xl font-bold">
                  {paiData.finalScore.team} - {paiData.finalScore.opponent}
                </div>
                <div className={`text-sm mt-1 ${paiData.won ? 'text-green-400' : 'text-red-400'}`}>
                  {paiData.won ? 'Victoire' : 'Défaite'}
                </div>
              </div>

              <div className="bg-green-900/30 rounded-lg p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">Score PAI</div>
                <div className="text-3xl font-bold text-green-400">
                  {paiData.pai.rai_score}
                </div>
              </div>

              <div className="bg-blue-900/30 rounded-lg p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">Différence RAI</div>
                <div className={`text-3xl font-bold ${
                  paiData.difference.score > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {paiData.difference.score > 0 ? '+' : ''}{paiData.difference.score}
                </div>
                <div className="text-sm text-slate-300 mt-1">
                  {paiData.difference.direction === 'better' ? 'Meilleur que prévu' :
                   paiData.difference.direction === 'worse' ? 'Moins bien que prévu' : 'Conforme'}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Top 3 Facteurs (Réels)</h3>
            <div className="space-y-3">
              {paiData.pai.top_levers.map((lever: any, idx: number) => (
                <div key={idx} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{lever.name}</span>
                    <span className="text-2xl font-bold">{lever.value}</span>
                  </div>
                  <p className="text-sm text-slate-300">{lever.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-12 text-center text-slate-400 text-sm">
        <p>TheFairView - Attribution Causale pour le Sport</p>
        <p className="mt-2">Basé sur la méthodologie FAIR (Fair Attribution of Integrated Risks)</p>
      </div>
    </main>
  );
}
