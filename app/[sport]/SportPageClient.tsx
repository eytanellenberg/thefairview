'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Loader2, TrendingUp, Activity, Target } from 'lucide-react';

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
        const response = await fetch(`/api/pai?game_id=${gameId}&team=${team}`);
        const data = await response.json();
        setAnalysis({ type: 'pai', data });
      } else {
        const response = await fetch(`/api/rai?game_id=${gameId}&team=${team}`);
        const data = await response.json();
        setAnalysis({ type: 'rai', data });
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
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">Recent Matches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentMatches.slice(0, 9).map((match: any) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`p-4 rounded-lg border-2 text-left transition hover:shadow-md ${
                    selectedMatch?.id === match.id 
                      ? 'border-blue-600 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-gray-500">{match.date}</div>
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                      RAI vs PAI
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{match.homeTeamName || match.homeTeam}</span>
                      <span className="text-lg font-bold">{match.homeScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{match.awayTeamName || match.awayTeam}</span>
                      <span className="text-lg font-bold">{match.awayScore}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {upcomingMatches.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">Upcoming Matches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingMatches.slice(0, 9).map((match: any) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`p-4 rounded-lg border-2 text-left transition hover:shadow-md ${
                    selectedMatch?.id === match.id 
                      ? 'border-green-600 bg-green-50 shadow-md' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-gray-500">{match.date}</div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                      RAI Preview
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">{match.homeTeamName || match.homeTeam}</div>
                    <div className="text-xs text-gray-500">vs</div>
                    <div className="font-semibold text-sm">{match.awayTeamName || match.awayTeam}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-16 shadow-lg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg text-gray-600">Analyzing match data...</span>
        </div>
      ) : analysis ? (
        analysis.type === 'pai' ? (
          <PAIDisplay match={selectedMatch} data={analysis.data} />
        ) : (
          <RAIDisplay match={selectedMatch} data={analysis.data} />
        )
      ) : null}
    </main>
  );
}

function RAIDisplay({ match, data }: any) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      {/* Header */}
      <div className="border-b pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {match.homeTeamName || match.homeTeam} vs {match.awayTeamName || match.awayTeam}
            </h2>
            <p className="text-gray-600 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Pre-Match Readiness Analysis • {match.date}
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold text-green-600 mb-1">{data.overall}</div>
            <p className="text-sm text-gray-600">RAI Score</p>
            <p className="text-xs text-gray-500 mt-1">{data.confidence}% confidence</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {data.breakdown.map((item: any) => (
          <div key={item.category} className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-700 mb-1">{item.value}</div>
            <div className="text-sm text-gray-700">{item.category}</div>
          </div>
        ))}
      </div>

      {/* Narrative */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-lg mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-600" />
          {data.narrative.title}
        </h3>
        <p className="text-gray-700 leading-relaxed">{data.narrative.summary}</p>
        <ul className="mt-4 space-y-2">
          {data.narrative.key_points.map((point: string, i: number) => (
            <li key={i} className="flex items-start text-sm text-gray-700">
              <span className="text-green-600 mr-2">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Levers */}
      <h3 className="font-bold text-xl mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Top 3 Readiness Drivers (Free Preview)
      </h3>
      <div className="space-y-4 mb-6">
        {data.top_levers.map((lever: any, i: number) => (
          <div key={lever.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-300 transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">#{i + 1} Readiness Factor</div>
                <h4 className="font-bold text-lg">{lever.name}</h4>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{lever.value}</div>
                <div className="text-xs text-gray-500">{lever.weight}% weight</div>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{lever.description}</p>
          </div>
        ))}
      </div>

      {/* Premium CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <h4 className="font-bold text-xl mb-2">🔒 Unlock Complete RAI Analysis</h4>
        <p className="mb-4 opacity-90">See all 20+ readiness levers, advanced patterns, historical trends, and team matchup analysis.</p>
        <Link href="/premium" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          Upgrade to Premium - 1 Month Free
        </Link>
      </div>
    </div>
  );
}

function PAIDisplay({ match, data }: any) {
  const delta = data.rai_comparison?.delta || 0;
  
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      {/* Header */}
      <div className="border-b pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {match.homeTeamName || match.homeTeam} vs {match.awayTeamName || match.awayTeam}
            </h2>
            <p className="text-gray-600 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Post-Match Performance Analysis • {match.date}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Final Score: {match.homeScore} - {match.awayScore}
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold text-blue-600 mb-1">{data.overall}</div>
            <p className="text-sm text-gray-600">PAI Score</p>
            <p className="text-xs text-gray-500 mt-1">{data.concordance}% concordance</p>
          </div>
        </div>
      </div>

      {/* RAI vs PAI Comparison */}
      {data.rai_comparison && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-xl mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            Prediction vs Reality
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Expected (RAI)</div>
              <div className="text-4xl font-bold text-gray-700">{data.rai_comparison.expected}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Actual (PAI)</div>
              <div className="text-4xl font-bold text-blue-600">{data.rai_comparison.actual}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Delta</div>
              <div className={`text-4xl font-bold ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {delta >= 0 ? '+' : ''}{delta}
              </div>
            </div>
          </div>
          <div className={`mt-4 p-4 rounded-lg ${delta >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-semibold text-center">
              {delta >= 0 
                ? `✓ Team exceeded expectations by ${delta} points` 
                : `✗ Team underperformed expectations by ${Math.abs(delta)} points`}
            </p>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {data.breakdown.map((item: any) => (
          <div key={item.category} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-700 mb-1">{item.value}</div>
            <div className="text-sm text-gray-700">{item.category}</div>
          </div>
        ))}
      </div>

      {/* Narrative */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-lg mb-3 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          {data.narrative.title}
        </h3>
        <p className="text-gray-700 leading-relaxed">{data.narrative.summary}</p>
        <ul className="mt-4 space-y-2">
          {data.narrative.key_points.map((point: string, i: number) => (
            <li key={i} className="flex items-start text-sm text-gray-700">
              <span className="text-blue-600 mr-2">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Levers */}
      <h3 className="font-bold text-xl mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Top 3 Performance Drivers
      </h3>
      <div className="space-y-4 mb-6">
        {data.top_levers.map((lever: any, i: number) => (
          <div key={lever.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">#{i + 1} Performance Factor</div>
                <h4 className="font-bold text-lg">{lever.name}</h4>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{lever.value}</div>
                <div className="text-xs text-gray-500">{lever.weight}% weight</div>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{lever.description}</p>
          </div>
        ))}
      </div>

      {/* Premium CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <h4 className="font-bold text-xl mb-2">🔒 Unlock Complete PAI Analysis</h4>
        <p className="mb-4 opacity-90">See all performance levers, detailed breakdowns, player contributions, and historical comparisons.</p>
        <Link href="/premium" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          Upgrade to Premium - 1 Month Free
        </Link>
      </div>
    </div>
  );
}
