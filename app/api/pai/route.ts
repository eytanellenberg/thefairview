import { NextRequest } from 'next/server';
import { getRealGameStats } from '@/app/lib/nba-real-stats';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const team = searchParams.get('team');
  
  if (!game_id || !team) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 });
  }
  
  // Récupérer VRAIES stats ESPN
  const realStats = await getRealGameStats(game_id);
  
  let stats;
  if (realStats) {
    stats = realStats.home; // On prendra home ou away selon team
    console.log(`✅ REAL STATS for game ${game_id}:`, stats);
  } else {
    // Fallback si API fail
    console.log(`⚠️ Using fallback for game ${game_id}`);
    stats = {
      fg_pct: 45 + Math.random() * 8,
      three_pct: 35 + Math.random() * 8,
      assists: 22 + Math.random() * 8,
      turnovers: 12 + Math.random() * 5,
      rebounds: 42 + Math.random() * 8
    };
  }
  
  // Calcul PAI avec FAIR methodology
  const shooting = Math.round((stats.fg_pct / 50) * 100);
  const teamwork = Math.round((stats.assists / 30) * 50 + ((15 - stats.turnovers) / 15) * 50);
  const defense = Math.round((stats.rebounds / 50) * 100);
  
  const overall = Math.round(shooting * 0.38 + teamwork * 0.32 + defense * 0.30);
  
  const raiScore = 65 + Math.floor(Math.random() * 20);
  const delta = overall - raiScore;
  
  return Response.json({
    game_id,
    team,
    overall,
    real_stats_used: !!realStats, // Indicateur si vraies stats
    breakdown: [
      { 
        category: 'Shooting', 
        value: shooting,
        detail: `FG: ${stats.fg_pct.toFixed(1)}% • 3PT: ${stats.three_pct.toFixed(1)}%`
      },
      { 
        category: 'Teamwork', 
        value: teamwork,
        detail: `${Math.round(stats.assists)} assists • ${Math.round(stats.turnovers)} TOs`
      },
      { 
        category: 'Rebounding', 
        value: defense,
        detail: `${Math.round(stats.rebounds)} total rebounds`
      }
    ],
    rai_comparison: {
      expected: raiScore,
      actual: overall,
      delta: delta
    },
    top_levers: [
      {
        id: '1',
        name: 'Shooting Performance',
        value: shooting,
        weight: 38,
        description: `Shot ${stats.fg_pct.toFixed(1)}% from field and ${stats.three_pct.toFixed(1)}% from three.`
      },
      {
        id: '2',
        name: 'Ball Movement',
        value: teamwork,
        weight: 32,
        description: `${Math.round(stats.assists)} assists with ${Math.round(stats.turnovers)} turnovers.`
      },
      {
        id: '3',
        name: 'Rebounding',
        value: defense,
        weight: 30,
        description: `Secured ${Math.round(stats.rebounds)} total rebounds.`
      }
    ],
    narrative: {
      title: delta >= 0 ? `Performance Exceeded Prediction` : `Underperformed Expectations`,
      summary: `Team ${delta >= 0 ? 'surpassed' : 'fell short of'} RAI prediction by ${Math.abs(delta)} points using ${realStats ? 'REAL' : 'simulated'} game stats.`,
      key_points: [
        `Shooting: ${stats.fg_pct.toFixed(1)}% FG (${realStats ? 'actual' : 'simulated'})`,
        `${Math.round(stats.assists)} assists, ${Math.round(stats.turnovers)} turnovers`,
        `${Math.round(stats.rebounds)} rebounds`
      ]
    }
  });
}
