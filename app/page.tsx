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
      const raiRes = await fetch(`/api/rai?gameId=${gameId}&teamId=${teamId}`);
      const rai = await raiRes.json();
      setRaiData(rai);

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
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-5xl font-bold mb-4">TheFairView</h1>
        <p className="text-xl text-slate-300">
          Sports Performance Analysis through Causal Attribution
        </p>
        
        <div className="mt-6 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">🎯 Professional Analytics</h3>
          <p className="text-slate-300 text-sm">
            Pre-match detailed data (RAI per team, key levers, predictions) + integration of your club's proprietary data.
            <br />
            <a href="mailto:eytan_ellenberg@yahoo.fr" className="text-blue-400 hover:text-blue-300 underline">
              Contact us for more info
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
          <h2 className="text-2xl font-semibold mb-4">Recent Matches</h2>
          
          {games.length === 0 ? (
            <p className="text-slate-400">Loading matches...</p>
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
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{away.team.displayName}</span>
                              <span className="text-2xl font-bold">{away.score}</span>
                            </div>
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => selectMatch(game.id, home.team.id)}
                            className="flex-1 text-left hover:bg-slate-600/50 p-2 rounded transition"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{home.team.displayName}</span>
                              <span className="text-2xl font-bold">{home.score}</span>
                            </div>
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400 ml-4">
                        {new Date(game.date).toLocaleDateString('en-US')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-300">Calculating...</p>
        </div>
      )}

      {raiData && paiData && !loading && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-slate-800/50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              📊 RAI - Pre-Match Prediction
            </h2>
            <p className="text-slate-300 mb-4">
              Readiness score for <strong>{raiData.teamName}</strong> before the match against {raiData.opponentName}
            </p>
            
            <div className="bg-blue-900/30 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-400 mb-2">
                  {raiData.rai.rai_score}
                </div>
                <div className="text-slate-300">RAI Score / 100</div>
                <div className="text-sm text-slate-400 mt-2">
                  Confidence: {raiData.rai.confidence}%
                </div>
                <div className="text-xs text-amber-400 mt-2">
                  ⚠️ Demo data - Real API integration pending
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Top 3 Factors</h3>
            <div className="space-y-3">
              {raiData.rai.top_levers.map((lever: any, idx: number) => (
                <div key={idx} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{lever.name}</span>
                    <span className="text-2xl font-bold">{lever.value}</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {lever.name === 'Performance' && `Team has a performance level of ${lever.value}% based on recent stats (shooting, assists, rebounds).`}
                    {lever.name === 'Fatigue' && `Fatigue level is ${lever.value}% based on days of rest and consecutive games.`}
                    {lever.name === 'Risk' && `Risk (injuries, overload) is assessed at ${lever.value}% from medical reports.`}
                    {lever.name === 'Morale' && `Team morale is ${lever.value}% based on win/loss streaks and home/away status.`}
                  </p>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      lever.impact === 'positive' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                      {lever.impact === 'positive' ? 'Positive' : 'Negative'} Impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              ✅ PAI - Post-Match Analysis
            </h2>
            <p className="text-slate-300 mb-4">
              Actual performance of <strong>{paiData.teamName}</strong>
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">Final Score</div>
                <div className="text-3xl font-bold">
                  {paiData.finalScore.team} - {paiData.finalScore.opponent}
                </div>
                <div className={`text-sm mt-1 ${paiData.won ? 'text-green-400' : 'text-red-400'}`}>
                  {paiData.won ? 'Victory' : 'Defeat'}
                </div>
              </div>

              <div className="bg-green-900/30 rounded-lg p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">PAI Score</div>
                <div className="text-3xl font-bold text-green-400">
                  {paiData.pai.rai_score}
                </div>
              </div>

              <div className="bg-blue-900/30 rounded-lg p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">RAI Difference</div>
                <div className={`text-3xl font-bold ${
                  paiData.difference.score > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {paiData.difference.score > 0 ? '+' : ''}{paiData.difference.score}
                </div>
                <div className="text-sm text-slate-300 mt-1">
                  {paiData.difference.direction === 'better' ? 'Better than predicted' :
                   paiData.difference.direction === 'worse' ? 'Worse than predicted' : 'As predicted'}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Top 3 Factors (Actual)</h3>
            <div className="space-y-3">
              {paiData.pai.top_levers.map((lever: any, idx: number) => (
                <div key={idx} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{lever.name}</span>
                    <span className="text-2xl font-bold">{lever.value}</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {lever.name === 'Performance' && `Team had a performance level of ${lever.value}% based on actual match stats.`}
                    {lever.name === 'Fatigue' && `Fatigue level was ${lever.value}% during the match.`}
                    {lever.name === 'Risk' && `Risk materialized at ${lever.value}%.`}
                    {lever.name === 'Morale' && `Team morale was ${lever.value}% during the match.`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto mt-12 text-center text-slate-400 text-sm">
        <p>TheFairView - Causal Attribution for Sports</p>
        <p className="mt-2">Based on FAIR methodology (Fair Attribution of Integrated Risks)</p>
        <p className="mt-4 text-xs text-amber-400">
          Demo version with sample data • Real-time API integration coming soon
        </p>
      </div>
    </main>
  );
}
