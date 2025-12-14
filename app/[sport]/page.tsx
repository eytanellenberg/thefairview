'use client';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

// Mock matches data
const getMockMatches = (sport: string) => {
  if (sport === 'nba') {
    return [
      {
        id: 'nba-001',
        date: '2024-12-12',
        time: '20:30',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        homeScore: 118,
        awayScore: 112,
        status: 'completed'
      },
      {
        id: 'nba-002',
        date: '2024-12-13',
        time: '19:00',
        homeTeam: 'Celtics',
        awayTeam: 'Heat',
        homeScore: 122,
        awayScore: 104,
        status: 'completed'
      },
      {
        id: 'nba-003',
        date: '2024-12-14',
        time: '21:00',
        homeTeam: 'Bucks',
        awayTeam: 'Nets',
        homeScore: null,
        awayScore: null,
        status: 'upcoming'
      },
      {
        id: 'nba-004',
        date: '2024-12-15',
        time: '19:30',
        homeTeam: 'Nuggets',
        awayTeam: 'Suns',
        homeScore: null,
        awayScore: null,
        status: 'upcoming'
      }
    ];
  }
  
  // Default matches for other sports
  return [
    {
      id: `${sport}-001`,
      date: '2024-12-13',
      time: '20:00',
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      homeScore: 3,
      awayScore: 1,
      status: 'completed'
    },
    {
      id: `${sport}-002`,
      date: '2024-12-15',
      time: '18:00',
      homeTeam: 'Team C',
      awayTeam: 'Team D',
      homeScore: null,
      awayScore: null,
      status: 'upcoming'
    }
  ];
};

const mockRAI = {
  overall: 73,
  confidence: 82,
  narrative: {
    title: "Strong Readiness via Tactical Edge",
    summary: "Team shows high readiness across all dimensions",
    keyPoints: [
      "Stable lineup creates offensive rhythm",
      "Favorable matchup history",
      "Key players optimally rested"
    ]
  },
  topLevers: [
    {
      id: "1",
      name: "Offensive Rhythm",
      category: "team" as const,
      value: 78,
      weight: 34,
      description: "Stable lineup with high cohesion",
      stats: [
        { label: "Games Together", value: 12, unit: "" },
        { label: "Offensive Rating", value: 118.3, unit: "pts/100" }
      ]
    },
    {
      id: "2",
      name: "Match-up Advantage",
      category: "opponent" as const,
      value: 71,
      weight: 31,
      description: "Historical edge vs opponent",
      stats: [
        { label: "Win %", value: 62, unit: "%" },
        { label: "PnR Defense", value: 48.3, unit: "%" }
      ]
    },
    {
      id: "3",
      name: "Player Readiness",
      category: "individual" as const,
      value: 69,
      weight: 29,
      description: "Optimal rest and form",
      stats: [
        { label: "Days Rest", value: 2, unit: "" },
        { label: "Recent PPG", value: 26.4, unit: "" }
      ]
    }
  ]
};

const mockPAI = {
  overall: 82,
  concordance: 76,
  narrative: {
    title: "Performance Exceeded Expectations",
    summary: "Team delivered through exceptional shooting efficiency",
    keyPoints: [
      "Three-point shooting 25% above season average",
      "Defensive rebounding prevented second chances",
      "Star player efficiency matched projections"
    ]
  },
  topLevers: [
    {
      id: "1",
      name: "Three-Point Efficiency",
      category: "team" as const,
      value: 88,
      weight: 38,
      description: "Shot 47.8% from three, well above average",
      stats: [
        { label: "3PT Made/Attempted", value: "18/38", unit: "" },
        { label: "3PT %", value: 47.8, unit: "%" }
      ]
    },
    {
      id: "2",
      name: "Defensive Rebounding",
      category: "team" as const,
      value: 79,
      weight: 32,
      description: "Dominated defensive glass",
      stats: [
        { label: "Defensive Rebounds", value: 38, unit: "" },
        { label: "Def Reb %", value: 79.2, unit: "%" }
      ]
    },
    {
      id: "3",
      name: "Star Player Impact",
      category: "individual" as const,
      value: 76,
      weight: 28,
      description: "Efficient 32 points with strong impact",
      stats: [
        { label: "Points", value: 32, unit: "" },
        { label: "Field Goal %", value: 52.4, unit: "%" }
      ]
    }
  ]
};

export default function SportPage() {
  const params = useParams();
  const sport = params?.sport as string;
  const matches = getMockMatches(sport);
  
  const [selectedMatch, setSelectedMatch] = useState(matches[0]);
  
  const pastMatches = matches.filter(m => m.status === 'completed');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-600"><ArrowLeft className="w-6 h-6" /></Link>
            <h1 className="text-2xl font-bold uppercase">{sport}</h1>
          </div>
          <Link href="/premium" className="bg-blue-600 text-white px-4 py-2 rounded">Upgrade</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Match Selector */}
        <div className="bg-white rounded-xl p-6 card-shadow mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Select Match
          </h2>
          
          {/* Past Matches */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">DERNIÈRE JOURNÉE (PAI disponible)</h3>
            <div className="space-y-2">
              {pastMatches.map(match => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedMatch.id === match.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{match.homeTeam}</span>
                        <span className="text-2xl font-bold mx-4">{match.homeScore}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-semibold">{match.awayTeam}</span>
                        <span className="text-2xl font-bold mx-4">{match.awayScore}</span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm text-gray-600">{match.date}</div>
                      <div className="text-sm text-gray-600">{match.time}</div>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1">
                        RAI + PAI
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">PROCHAINE JOURNÉE (RAI seulement)</h3>
            <div className="space-y-2">
              {upcomingMatches.map(match => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedMatch.id === match.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{match.homeTeam}</div>
                      <div className="text-gray-600 text-sm">vs</div>
                      <div className="font-semibold">{match.awayTeam}</div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm text-gray-600">{match.date}</div>
                      <div className="text-sm text-gray-600">{match.time}</div>
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1">
                        RAI only
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis Display */}
        {selectedMatch.status === 'completed' ? (
          // PAI for completed matches
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 card-shadow">
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedMatch.homeTeam} vs {selectedMatch.awayTeam} - PAI Post-Match
                  </h2>
                  <p className="text-gray-600">{selectedMatch.date} • Score: {selectedMatch.homeScore}-{selectedMatch.awayScore}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-blue-600">{mockPAI.overall}</div>
                  <p className="text-sm text-gray-600">Concordance: {mockPAI.concordance}%</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold mb-2">{mockPAI.narrative.title}</h3>
                <p className="text-gray-700 mb-4">{mockPAI.narrative.summary}</p>
                <ul className="space-y-2">
                  {mockPAI.narrative.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue-600 mr-2">▸</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <h3 className="font-bold mb-4">Top 3 Performance Drivers</h3>
              <div className="space-y-4">
                {mockPAI.topLevers.map((lever, i) => (
                  <LeverCard key={lever.id} lever={lever} index={i} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // RAI for upcoming matches
          <div className="bg-white rounded-xl p-8 card-shadow">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedMatch.homeTeam} vs {selectedMatch.awayTeam} - RAI Pre-Match
                </h2>
                <p className="text-gray-600">{selectedMatch.date} • {selectedMatch.time}</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-green-600">{mockRAI.overall}</div>
                <p className="text-sm text-gray-600">Confidence: {mockRAI.confidence}%</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold mb-2">{mockRAI.narrative.title}</h3>
              <p className="text-gray-700 mb-4">{mockRAI.narrative.summary}</p>
              <ul className="space-y-2">
                {mockRAI.narrative.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-600 mr-2">▸</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="font-bold mb-4">Top 3 Readiness Drivers</h3>
            <div className="space-y-4">
              {mockRAI.topLevers.map((lever, i) => (
                <LeverCard key={lever.id} lever={lever} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Premium CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 mt-8">
          <h3 className="text-xl font-bold mb-2">Want Deeper Insights?</h3>
          <p className="mb-4">Premium gets you all levers, advanced patterns, and historical data</p>
          <Link href="/premium" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">
            Explore Premium
          </Link>
        </div>
      </main>
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
          <span className="inline-block px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
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
