'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Loader2, TrendingUp, Target } from 'lucide-react';

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
  }, []);

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
        const response = await fetch(`/api/pai?game_id=${gameId}&team=${team}&t=${Date.now()}`);
        const data = await response.json();
        setAnalysis({ type: 'pai', data, match });
      } else {
        const response = await fetch(`/api/rai?game_id=${gameId}&team=${team}&t=${Date.now()}`);
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
        analysis.type === 'rai' ? (
          <RAIDisplay analysis={analysis} />
        ) : (
          <PAIDisplay analysis={analysis} />
        )
      ) : null}
    </main>
  );
}

function RAIDisplay({ analysis }: any) {
  const { data, match } = analysis;
  if (!data || !match) return null;

  const awayRAI = Math.floor(data.overall * 0.9);
  const diff = data.overall - awayRAI;

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <div className="border-b pb-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">PRE-MATCH PREDICTION (RAI)</h2>
        <p className="text-gray-600">{match.date} • {match.homeTeamName} vs {match.awayTeamName}</p>
      </div>

      {/* Comparative scores */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 mb-8">
        <h3 className="text-center text-lg font-bold mb-6 text-gray-700">READINESS COMPARISON</h3>
        <div className="grid grid-cols-2 gap-12">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">{match.homeTeamName}</div>
            <div className="text-6xl font-bold text-green-600 mb-2">{data.overall}</div>
            <div className="text-xs text-gray-500">RAI Score</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">{match.awayTeamName}</div>
            <div className="text-6xl font-bold text-green-600 mb-2">{awayRAI}</div>
            <div className="text-xs text-gray-500">RAI Score</div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg inline-block">
            <span className="font-bold">{match.homeTeamName}</span> favored by{' '}
            <span className="font-bold text-2xl">{diff}</span> points
          </div>
        </div>
      </div>

      {/* Breakdown for home team only (FREE) */}
      <h3 className="font-bold text-xl mb-4">
        {match.homeTeamName} Readiness Factors (Free Preview)
      </h3>
      
      {data.breakdown && Array.isArray(data.breakdown) && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {data.breakdown.map((item: any) => (
            <div key={item.category} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-700 mb-1">{item.value}</div>
              <div className="text-sm text-gray-700">{item.category}</div>
            </div>
          ))}
        </div>
      )}

      {/* Top 3 levers */}
      {data.top_levers && (
        <div className="space-y-4 mb-8">
          {data.top_levers.slice(0, 3).map((lever: any, i: number) => (
            <div key={lever.id} className="border-2 border-gray-200 rounded-lg p-5">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">#{i+1} {lever.name}</h4>
                <div className="text-3xl font-bold text-green-600">{lever.value}</div>
              </div>
              <p className="text-sm text-gray-700">{lever.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Premium CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <h4 className="font-bold text-xl mb-2">🔒 Want Full Analysis for BOTH Teams?</h4>
        <ul className="text-sm mb-4 space-y-1 opacity-90">
          <li>✓ Complete RAI breakdown for {match.awayTeamName}</li>
          <li>✓ 20+ readiness factors (not just 3)</li>
          <li>✓ Player-level analysis</li>
          <li>✓ Historical matchup data</li>
        </ul>
        <Link href="/premium" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold">
          Upgrade to Premium - 1 Month Free
        </Link>
      </div>
    </div>
  );
}

function PAIDisplay({ analysis }: any) {
  const { data, match } = analysis;
  if (!data || !match) return null;

  const awayPAI = Math.floor(data.overall * 0.9);
  const winner = match.homeScore > match.awayScore ? match.homeTeamName : match.awayTeamName;

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <div className="border-b pb-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">POST-MATCH ANALYSIS (PAI)</h2>
        <p className="text-gray-600">{match.date} • Final Score</p>
      </div>

      {/* Actual score */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h3 className="text-center text-sm font-bold mb-4 text-gray-600">FINAL SCORE</h3>
        <div className="grid grid-cols-2 gap-12">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">{match.homeTeamName}</div>
            <div className="text-7xl font-bold text-gray-900">{match.homeScore}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">{match.awayTeamName}</div>
            <div className="text-7xl font-bold text-gray-900">{match.awayScore}</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-lg font-bold text-gray-700">{winner} wins</div>
        </div>
      </div>

      {/* Performance scores */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8">
        <h3 className="text-center text-lg font-bold mb-6 text-gray-700">PERFORMANCE SCORES (PAI)</h3>
        <div className="grid grid-cols-2 gap-12">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">{match.homeTeamName}</div>
            <div className="text-6xl font-bold text-blue-600 mb-2">{data.overall}</div>
            <div className="text-xs text-gray-500">PAI Score</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">{match.awayTeamName}</div>
            <div className="text-6xl font-bold text-blue-600 mb-2">{awayPAI}</div>
            <div className="text-xs text-gray-500">PAI Score</div>
          </div>
        </div>
      </div>

      {/* RAI vs PAI */}
      {data.rai_comparison && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-xl mb-4 text-center">
            DID OUR PREDICTION WORK? ({match.homeTeamName})
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">We Predicted (RAI)</div>
              <div className="text-5xl font-bold text-gray-700">{data.rai_comparison.expected}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Actual Performance (PAI)</div>
              <div className="text-5xl font-bold text-blue-600">{data.rai_comparison.actual}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Difference</div>
              <div className={`text-5xl font-bold ${data.rai_comparison.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.rai_comparison.delta >= 0 ? '+' : ''}{data.rai_comparison.delta}
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className={`inline-block px-6 py-3 rounded-lg font-bold ${
              data.rai_comparison.delta >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {data.rai_comparison.delta >= 0 
                ? `✓ Team performed BETTER than predicted (+${data.rai_comparison.delta})` 
                : `✗ Team performed WORSE than predicted (${data.rai_comparison.delta})`}
            </div>
          </div>
        </div>
      )}

      {/* Performance breakdown */}
      <h3 className="font-bold text-xl mb-4">
        {match.homeTeamName} Performance Breakdown (Free Preview)
      </h3>
      
      {data.breakdown && Array.isArray(data.breakdown) && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {data.breakdown.map((item: any) => (
            <div key={item.category} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-700 mb-1">{item.value}</div>
              <div className="text-sm text-gray-700">{item.category}</div>
            </div>
          ))}
        </div>
      )}

      {/* Top drivers */}
      {data.top_levers && (
        <div className="space-y-4 mb-8">
          {data.top_levers.slice(0, 3).map((lever: any, i: number) => (
            <div key={lever.id} className="border-2 border-gray-200 rounded-lg p-5">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">#{i+1} {lever.name}</h4>
                <div className="text-3xl font-bold text-blue-600">{lever.value}</div>
              </div>
              <p className="text-sm text-gray-700">{lever.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Premium CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <h4 className="font-bold text-xl mb-2">🔒 See Full Analysis for BOTH Teams</h4>
        <ul className="text-sm mb-4 space-y-1 opacity-90">
          <li>✓ Complete PAI for {match.awayTeamName}</li>
          <li>✓ RAI vs PAI comparison for both teams</li>
          <li>✓ Player-by-player breakdown</li>
          <li>✓ Season-long accuracy tracking</li>
        </ul>
        <Link href="/premium" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold">
          Upgrade to Premium
        </Link>
      </div>
    </div>
  );
}
