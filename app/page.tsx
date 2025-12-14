'use client';
import Link from 'next/link';
import { Trophy, TrendingUp, BarChart3, Zap } from 'lucide-react';

const sports = [
  { id: 'nba', name: 'NBA', icon: '🏀', active: true },
  { id: 'nfl', name: 'NFL', icon: '🏈', active: true },
  { id: 'nhl', name: 'NHL', icon: '🏒', active: true },
  { id: 'mlb', name: 'MLB', icon: '⚾', active: true },
  { id: 'soccer-eur', name: 'Soccer EU', icon: '⚽', active: true },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">TheFairView</h1>
              <p className="text-xs text-gray-600">Fair Research Organization</p>
            </div>
          </div>
          <nav className="flex space-x-6">
            <Link href="/about" className="text-sm hover:text-blue-600">About</Link>
            <Link href="/premium" className="text-sm hover:text-blue-600">Premium</Link>
            <a href="mailto:eytan_ellenberg@yahoo.fr" className="text-sm bg-blue-600 text-white px-4 py-2 rounded">Contact</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            Predictive Sport Analytics
            <br/><span className="text-blue-600">with Causal Attribution</span>
          </h2>
          <p className="text-xl text-gray-600">RAI pre-match + PAI post-match analysis</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-xl card-shadow">
            <TrendingUp className="w-6 h-6 text-blue-600 mb-4" />
            <h3 className="font-bold mb-2">Pre-Match RAI</h3>
            <p className="text-gray-600">Readiness prediction</p>
          </div>
          <div className="bg-white p-6 rounded-xl card-shadow">
            <BarChart3 className="w-6 h-6 text-blue-600 mb-4" />
            <h3 className="font-bold mb-2">Post-Match PAI</h3>
            <p className="text-gray-600">Performance analysis</p>
          </div>
          <div className="bg-white p-6 rounded-xl card-shadow">
            <Zap className="w-6 h-6 text-blue-600 mb-4" />
            <h3 className="font-bold mb-2">3-Lever Insights</h3>
            <p className="text-gray-600">Top causal drivers</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 card-shadow">
          <h3 className="text-2xl font-bold mb-6 text-center">Select Your Sport</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {sports.map(sport => (
              <Link
                key={sport.id}
                href={`/${sport.id}`}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition text-center"
              >
                <div className="text-5xl mb-3">{sport.icon}</div>
                <h4 className="font-semibold">{sport.name}</h4>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
