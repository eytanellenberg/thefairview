'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Loader2 } from 'lucide-react';

export default function SportPageClient({ sport, matches }: any) {
  const [selectedMatch, setSelectedMatch] = useState(matches[0]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const pastMatches = matches.filter((m: any) => m.status === 'completed');
  const upcomingMatches = matches.filter((m: any) => m.status === 'upcoming');

  // Charger l'analyse quand un match est sélectionné
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
        // Charger PAI pour matchs terminés
        const response = await fetch(`/api/pai?game_id=${gameId}&team=${team}`);
        const data = await response.json();
        setAnalysis({ type: 'pai', data });
      } else {
        // Charger RAI pour matchs à venir
        const response = await fetch(`/api/rai?game_id=${gameId}&team=${team}`);
        const data = await response.json();
        setAnalysis({ type: 'rai', data });
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl p-6 card-shadow mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Select Match
        </h2>
        
        {pastMatches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">RECENT MATCHES</h3>
            <div className="space-y-2">
              {pastMatches.map((match: any) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedMatch?.id === match.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{match.homeTeamName || match.homeTeam}</span>
                        <span className="text-2xl font-bold mx-4">{match.homeScore}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-semibold">{match.awayTeamName || match.awayTeam}</span>
                        <span className="text-2xl font-bold mx-4">{match.awayScore}</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm text-gray-600">{match.date}</div>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1">PAI Available</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {upcomingMatches.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">UPCOMING MATCHES</h3>
            <div className="space-y-2">
              {upcomingMatches.map((match: any) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedMatch?.id === match.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{match.homeTeamName || match.homeTeam}</div>
                      <div className="text-gray-600 text-sm">vs</div>
                      <div className="font-semibold">{match.awayTeamName || match.awayTeam}</div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm text-gray-600">{match.date}</div>
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1">RAI Available</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-16 card-shadow flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading analysis...</span>
        </div>
      ) : analysis ? (
        analysis.type === 'pai' ? (
          <PAIDisplay match={selectedMatch} data={analysis.data} />
        ) : (
          <RAIDisplay match={selectedMatch} data={analysis.data} />
        )
      ) : null}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 mt-8">
        <h3 className="text-xl font-bold mb-2">Want Deeper Insights?</h3>
        <p className="mb-4">Premium gets all levers, advanced patterns, and historical data</p>
        <Link href="/premium" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">
          Explore Premium
        </Link>
      </div>
    </main>
  );
}

function RAIDisplay({ match, data }: any) {
  return (
    <div className="bg-white rounded-xl p-8 card-shadow">
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {match.homeTeamName || match.homeTeam} vs {match.awayTeamName || match.awayTeam}
          </h2>
          <p className="text-gray-600">Pre-Match Readiness Analysis • {match.date}</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-green-600">{data.overall}</div>
          <p className="text-sm text-gray-600">RAI Score</p>
          <p className="text-xs text-gray-500 mt-1">Confidence: {data.confidence}%</p>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold mb-2">{data.narrative.title}</h3>
        <p className="text-gray-700 mb-4">{data.narrative.summary}</p>
        <ul className="space-y-2">
          {data.narrative.key_points.map((point: string, i: number) => (
            <li key={i} className="flex items-start">
              <span className="text-green-600 mr-2">▸</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <h3 className="font-bold mb-4">Top 3 Readiness Drivers</h3>
      <div className="space-y-4">
        {data.top_levers.map((lever: any, i: number) => (
          <LeverCard key={lever.id} lever={lever} index={i} />
        ))}
      </div>
    </div>
  );
}

function PAIDisplay({ match, data }: any) {
  return (
    <div className="bg-white rounded-xl p-8 card-shadow">
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {match.homeTeamName || match.homeTeam} vs {match.awayTeamName || match.awayTeam}
          </h2>
          <p className="text-gray-600">Post-Match Performance Analysis • {match.date}</p>
          <p className="text-sm text-gray-500">Final Score: {match.homeScore}-{match.awayScore}</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-blue-600">{data.overall}</div>
          <p className="text-sm text-gray-600">PAI Score</p>
          <p className="text-xs text-gray-500 mt-1">Concordance: {data.concordance}%</p>
        </div>
      </div>

      {/* RAI vs PAI Comparison */}
      {data.rai_comparison && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-3">Pre-Match Prediction vs Actual Performance</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">RAI Expected</p>
              <p className="text-2xl font-bold text-purple-700">{data.rai_comparison.expected}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">PAI Actual</p>
              <p className="text-2xl font-bold text-blue-600">{data.rai_comparison.actual}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Delta</p>
              <p className={`text-2xl font-bold ${data.rai_comparison.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.rai_comparison.delta >= 0 ? '+' : ''}{data.rai_comparison.delta}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-3">
            {data.rai_comparison.delta >= 0 
              ? '✓ Team exceeded pre-match readiness expectations' 
              : '✗ Team underperformed relative to readiness indicators'}
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-bold mb-2">{data.narrative.title}</h3>
        <p className="text-gray-700 mb-4">{data.narrative.summary}</p>
        <ul className="space-y-2">
          {data.narrative.key_points.map((point: string, i: number) => (
            <li key={i} className="flex items-start">
              <span className="text-blue-600 mr-2">▸</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <h3 className="font-bold mb-4">Top 3 Performance Drivers</h3>
      <div className="space-y-4">
        {data.top_levers.map((lever: any, i: number) => (
          <LeverCard key={lever.id} lever={lever} index={i} />
        ))}
      </div>
    </div>
  );
}

function LeverCard({ lever, index }: any) {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex justify-between mb-3">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
            <h4 className="text-lg font-bold">{lever.name}</h4>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">
            {lever.category}
          </span>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{lever.value}</div>
          <p className="text-sm text-gray-600">{lever.weight}% weight</p>
        </div>
      </div>
      <p className="text-gray-700 mb-4">{lever.description}</p>
      <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded p-4">
        {lever.stats.map((stat: any, j: number) => (
          <div key={j}>
            <p className="text-xs text-gray-600">{stat.label}</p>
            <p className="font-semibold">{stat.value} {stat.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
