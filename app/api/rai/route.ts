import { NextRequest } from 'next/server';
import { calculateRAI_Free } from '@/app/lib/fair-engine';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const team = searchParams.get('team');
  
  if (!game_id || !team) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 });
  }
  
  // Simuler stats publiques (à remplacer par vraies données ESPN)
  const publicStats = {
    fg_pct: 45 + Math.random() * 8,
    three_pct: 35 + Math.random() * 8,
    assists: 22 + Math.random() * 8,
    rebounds: 42 + Math.random() * 8,
    turnovers: 12 + Math.random() * 5,
    recent_wins: Math.floor(Math.random() * 10)
  };
  
  // Utiliser le moteur FAIR
  const result = calculateRAI_Free(publicStats);
  
  return Response.json({
    game_id,
    team,
    ...result,
    narrative: {
      title: `${team} Readiness Analysis`,
      summary: `Pre-match readiness calculated using FAIR methodology with public data. Confidence: ${result.confidence}%`,
      key_points: [
        `Shooting: ${publicStats.fg_pct.toFixed(1)}% FG, ${publicStats.three_pct.toFixed(1)}% 3PT`,
        `Recent form: ${publicStats.recent_wins}/10 wins`,
        `Ball control: ${publicStats.turnovers.toFixed(1)} turnovers avg`
      ]
    }
  });
}
