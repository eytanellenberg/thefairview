import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getNBASchedule, getNFLSchedule, getNHLSchedule, getMLBSchedule, getSoccerSchedule } from '../lib/sports-api';
import SportPageClient from './SportPageClient';

export default async function SportPage({ params }: { params: { sport: string } }) {
  const { sport } = params;
  
  let matches: any[] = [];
  
  switch(sport.toLowerCase()) {
    case 'nba':
      matches = await getNBASchedule();
      break;
    case 'nfl':
      matches = await getNFLSchedule();
      break;
    case 'nhl':
      matches = await getNHLSchedule();
      break;
    case 'mlb':
      matches = await getMLBSchedule();
      break;
    case 'soccer':
      matches = await getSoccerSchedule();
      break;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-600"><ArrowLeft className="w-6 h-6" /></Link>
            <h1 className="text-2xl font-bold uppercase">{sport}</h1>
          </div>
          <Link href="/premium" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition">
            Upgrade to Premium
          </Link>
        </div>
      </header>
      
      <SportPageClient sport={sport} matches={matches} />
    </div>
  );
}
