import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getNBASchedule } from '../lib/nba-api';
import SportPageClient from './SportPageClient';

export default async function SportPage({ params }: { params: { sport: string } }) {
  const { sport } = params;
  
  // Fetch real data based on sport
  let matches = [];
  
  if (sport === 'nba') {
    matches = await getNBASchedule();
  } else {
    // Mock data for other sports for now
    matches = [
      {
        id: `${sport}-1`,
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeTeamName: 'Team A',
        awayTeamName: 'Team B',
        homeScore: 3,
        awayScore: 1,
        status: 'completed'
      }
    ];
  }

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
      
      <SportPageClient sport={sport} matches={matches} />
    </div>
  );
}
