'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Loader2, TrendingUp, Scale } from 'lucide-react';

export default function SportPageClient({ sport, matches }: any) {
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const recentMatches = matches.filter((m: any) => m.status === 'completed');
  const upcomingMatches = matches.filter((m: any) => m.status === 'upcoming');

  useEffect(() => {
    if (recentMatches.length > 0) {
      setSelectedMatch(recentMatches[0]);
    } else if (upcomingMatches.length > 0) {
      setSelectedMatch(upcomingMatches[0]);
    }
  }, [recentMatches, upcomingMatches]);

  useEffect(() => {
    if (selectedMatch) {
      loadAnalysis(selectedMatch);
    }
  }, [selectedMatch]);

  const loadAnalysis = async (match: any) => {
    setLoading(true);
    try {
      const team = match.homeTeam;
      const gameId = match.id;
      
      if (match.status === 'completed') {
        const response = await fetch(`/api/pai?game_id=${gameId}&team=${team}`);
        const data = await response.json();
        setAnalysis({ type: 'pai', data, match });
      } else {
        const response = await fetch(`/api/rai?game_id=${gameId}&team=${team}`);
        const data = await response.json();
        setAnalysis({ type: 'rai', data, match });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Select Match
        </h2>
        
        {recentMatches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">RECENT MATCHES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentMatches.slice(0, 9).map((match: any) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    selectedMatch?.id === match.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-2">{match.date}</div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-sm">{match.homeTeamName || match.homeTeam}</span>
                    <span className="font-bold text-lg">{match.homeScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-sm">{match.awayTeamName || match.awayTeam}</span>
                    <span className="font-bold text-lg">{match.awayScore}</span>
                  </div>
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-2 inline-block">
                    PAI Analysis
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {upcomingMatches.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">UPCOMING MATCHES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingMatches.slice(0, 9).map((match: any) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    selectedMatch?.id === match.id ? 'border-green-600 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-2">{match.date}</div>
                  <div className="font-semibold text-sm">{match.homeTeamName || match.homeTeam}</div>
                  <div className="text-xs text-gray-500">vs</div>
                  <div className="font-semibold text-sm">{match.awayTeamName || match.awayTeam}</div>
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-2 inline-block">
                    RAI Prediction
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-16 shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>
      ) : analysis ? (
        <AnalysisDisplay analysis={analysis} />
      ) : null}
    </main>
  );
}

function AnalysisDisplay({ analysis }: any) {
  const { type, data, match } = analysis;
  const isRAI = type === 'rai';

  if (!data || !match) return null;

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      {/* Header avec score comparatif */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center mb-4">
          <Scale className="w-6 h-6 text-gray-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-700">
            {isRAI ? 'RAI COMPARATIVE ANALYSIS' : 'PAI COMPARATIVE ANALYSIS'}
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-8 items-center">
          {/* Home Team */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">{match.homeTeamName || match.homeTeam}</div>
            <div className={`text-5xl font-bold ${isRAI ? 'text-green-600' : 'text-blue-600'}`}>
              {data.overall}
            </div>
            <div className="text-xs text-gray-500 mt-1">{isRAI ? 'Readiness' : 'Performance'}</div>
            {!isRAI && match.homeScore && (
              <div className="text-2xl font-bold text-gray-700 mt-2">{match.homeScore}</div>
            )}
          </div>

          {/* VS */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">VS</div>
            {isRAI && (
              <div className="mt-2 text-xs text-gray-600">
                Pre-Match<br/>Prediction
              </div>
            )}
            {!isRAI && (
              <div className="mt-2 text-xs text-gray-600">
                Post-Match<br/>Analysis
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">{match.awayTeamName || match.awayTeam}</div>
            <div className={`text-5xl font-bold ${isRAI ? 'text-green-600' : 'text-blue-600'}`}>
              {Math.floor(data.overall * 0.9)} {/* Simulé - à remplacer par vraie API */}
            </div>
            <div className="text-xs text-gray-500 mt-1">{isRAI ? 'Readiness' : 'Performance'}</div>
            {!isRAI && match.awayScore && (
              <div className="text-2xl font-bold text-gray-700 mt-2">{match.awayScore}</div>
            )}
          </div>
        </div>

        {/* Prediction/Result */}
        <div className="mt-4 text-center">
          {isRAI ? (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block">
              <span className="font-bold">{match.homeTeamName || match.homeTeam}</span> favored by{' '}
              <span className="font-bold">{Math.abs(data.overall - Math.floor(data.overall * 0.9))}</span> points
            </div>
          ) : data.rai_comparison && (
            <div className={`px-4 py-2 rounded-lg inline-block ${
              data.rai_comparison.delta >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <span className="font-bold">{match.homeTeamName || match.homeTeam}</span>{' '}
              {data.rai_comparison.delta >= 0 ? 'exceeded' : 'underperformed'} prediction by{' '}
              <span className="font-bold">{Math.abs(data.rai_comparison.delta)}</span> points
            </div>
          )}
        </div>
      </div>

      {/* Breakdown */}
      {data.breakdown && Array.isArray(data.breakdown) && (
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Breakdown - {match.homeTeamName || match.homeTeam}
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {data.breakdown.map((item: any) => (
              <div key={item.category} className={`${isRAI ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} rounded-lg p-4 border`}>
                <div className={`text-2xl font-bold ${isRAI ? 'text-green-700' : 'text-blue-700'}`}>{item.value}</div>
                <div className="text-sm text-gray-700">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RAI vs PAI (only for completed matches) */}
      {!isRAI && data.rai_comparison && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-xl mb-4">Prediction Accuracy</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-gray-600 mb-2">Expected (RAI)</div>
              <div className="text-4xl font-bold">{data.rai_comparison.expected}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Actual (PAI)</div>
              <div className="text-4xl font-bold text-blue-600">{data.rai_comparison.actual}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Delta</div>
              <div className={`text-4xl font-bold ${data.rai_comparison.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.rai_comparison.delta >= 0 ? '+' : ''}{data.rai_comparison.delta}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Narrative */}
      {data.narrative && (
        <div className={`${isRAI ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-6 mb-8`}>
          <h3 className="font-bold text-lg mb-2">{data.narrative.title}</h3>
          <p className="text-gray-700 mb-3">{data.narrative.summary}</p>
          {data.narrative.key_points && (
            <ul className="space-y-1">
              {data.narrative.key_points.map((point: string, i: number) => (
                <li key={i} className="text-sm text-gray-700 flex items-start">
                  <span className={`mr-2 ${isRAI ? 'text-green-600' : 'text-blue-600'}`}>•</span>
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Top 3 Levers (FREE preview) */}
      {data.top_levers && Array.isArray(data.top_levers) && (
        <>
          <h3 className="font-bold text-xl mb-4">Top 3 Drivers (Free Preview)</h3>
          <div className="space-y-4 mb-6">
            {data.top_levers.slice(0, 3).map((lever: any, i: number) => (
              <div key={lever.id} className="border-2 border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs text-gray-500">#{i + 1}</div>
                    <h4 className="font-bold text-lg">{lever.name}</h4>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${isRAI ? 'text-green-600' : 'text-blue-600'}`}>{lever.value}</div>
                    <div className="text-xs text-gray-500">{lever.weight}%</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{lever.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Premium CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
        <h4 className="font-bold text-2xl mb-3">🔒 Unlock Full Team-by-Team Analysis</h4>
        <p className="mb-2 text-lg opacity-90">See detailed breakdown for BOTH teams</p>
        <ul className="text-left max-w-2xl mx-auto mb-6 space-y-2 opacity-90">
          <li>✓ Individual RAI/PAI for each team</li>
          <li>✓ 20+ performance levers per team</li>
          <li>✓ Player-level analytics</li>
          <li>✓ Full season history and trends</li>
          <li>✓ Export detailed reports (PDF)</li>
        </ul>
        <Link href="/premium" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
          Start Free Trial (1 Month Free)
        </Link>
      </div>
    </div>
  );
}
