import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const team = searchParams.get('team');
  
  if (!game_id || !team) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 });
  }
  
  // Stats du match (à récupérer depuis ESPN)
  const matchStats = {
    fg_pct: 44 + Math.random() * 10,
    three_pct: 34 + Math.random() * 10,
    assists: 20 + Math.random() * 12,
    turnovers: 10 + Math.random() * 8,
    rebounds: 40 + Math.random() * 12
  };
  
  // Calcul PAI simplifié
  const shooting = Math.round((matchStats.fg_pct / 50) * 100);
  const teamwork = Math.round((matchStats.assists / 30) * 50 + ((15 - matchStats.turnovers) / 15) * 50);
  const defense = Math.round((matchStats.rebounds / 50) * 100);
  
  const overall = Math.round(shooting * 0.38 + teamwork * 0.32 + defense * 0.30);
  
  const raiScore = 65 + Math.floor(Math.random() * 20);
  const delta = overall - raiScore;
  
  return Response.json({
    game_id,
    team,
    overall,
    breakdown: [
      { 
        category: 'Shooting', 
        value: shooting,
        detail: `FG: ${matchStats.fg_pct.toFixed(1)}% • 3PT: ${matchStats.three_pct.toFixed(1)}%`
      },
      { 
        category: 'Teamwork', 
        value: teamwork,
        detail: `${Math.round(matchStats.assists)} assists • ${Math.round(matchStats.turnovers)} TOs`
      },
      { 
        category: 'Rebounding', 
        value: defense,
        detail: `${Math.round(matchStats.rebounds)} total rebounds`
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
        description: `Shot ${matchStats.fg_pct.toFixed(1)}% from field and ${matchStats.three_pct.toFixed(1)}% from three.`
      },
      {
        id: '2',
        name: 'Ball Movement',
        value: teamwork,
        weight: 32,
        description: `${Math.round(matchStats.assists)} assists with ${Math.round(matchStats.turnovers)} turnovers.`
      },
      {
        id: '3',
        name: 'Rebounding',
        value: defense,
        weight: 30,
        description: `Secured ${Math.round(matchStats.rebounds)} total rebounds.`
      }
    ],
    narrative: {
      title: delta >= 0 ? `Performance Exceeded Prediction` : `Underperformed Expectations`,
      summary: `Team ${delta >= 0 ? 'surpassed' : 'fell short of'} RAI prediction by ${Math.abs(delta)} points.`,
      key_points: [
        `Shooting: ${matchStats.fg_pct.toFixed(1)}% FG`,
        `${Math.round(matchStats.assists)} assists, ${Math.round(matchStats.turnovers)} turnovers`,
        `${Math.round(matchStats.rebounds)} rebounds`
      ]
    }
  });
}
