'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Loader2 } from 'lucide-react';

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
      <div className="bg-white rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Select Match
        </h2>
        
        {recentMatches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">RECENT MATCHES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentMatches.slice(0, 10).map((match: any) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`p-4 rounded-lg border-2 text-left ${
                    selectedMatch?.id === match.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{match.homeTeamName} {match.homeScore}</div>
                      <div className="font-semibold">{match.awayTeamName} {match.awayScore}</div>
                    </div>
                    <div className="text-xs text-gray-600">{match.date}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {upcomingMatches.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">UPCOMING MATCHES</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingMatches.slice(0, 10).map((match: any) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`p-4 rounded-lg border-2 text-left ${
                    selectedMatch?.id === match.id ? 'border-green-600 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{match.homeTeamName}</div>
                      <div className="text-sm text-gray-600">vs</div>
                      <div className="font-semibold">{match.awayTeamName}</div>
                    </div>
                    <div className="text-xs text-gray-600">{match.date}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : analysis ? (
        <div className="bg-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            {selectedMatch.homeTeamName} vs {selectedMatch.awayTeamName}
          </h2>
          <div className="text-5xl font-bold text-blue-600 mb-6">{analysis.data.overall}</div>
          <p>{analysis.data.narrative?.summary}</p>
        </div>
      ) : null}
    </main>
  );
}
