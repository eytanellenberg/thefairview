import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const team = searchParams.get('team');
  
  if (!game_id || !team) {
    return Response.json({ error: 'Missing game_id or team' }, { status: 400 });
  }
  
  // Calculs PAI
  const shooting = Math.floor(Math.random() * (95 - 70) + 70);
  const defense = Math.floor(Math.random() * (85 - 65) + 65);
  const individual = Math.floor(Math.random() * (90 - 60) + 60);
  const overall = Math.round(shooting * 0.38 + defense * 0.32 + individual * 0.30);
  const concordance = Math.floor(Math.random() * (85 - 65) + 65);
  
  return Response.json({
    game_id,
    team,
    overall,
    concordance,
    breakdown: {
      individual,
      team: Math.round((shooting + defense) / 2),
      opponent: Math.round(100 - overall)
    },
    top_levers: [
      {
        id: '1',
        name: 'Shooting Efficiency',
        category: 'team',
        value: shooting,
        weight: 38,
        description: 'Field goal and three-point shooting performance',
        stats: [
          { label: 'FG%', value: 47.8, unit: '%' },
          { label: '3PT%', value: 38.5, unit: '%' }
        ]
      },
      {
        id: '2',
        name: 'Defensive Control',
        category: 'team',
        value: defense,
        weight: 32,
        description: 'Defensive rebounding and opponent FG%',
        stats: [
          { label: 'Def Reb%', value: 75.2, unit: '%' },
          { label: 'Opp FG%', value: 41.2, unit: '%' }
        ]
      },
      {
        id: '3',
        name: 'Star Impact',
        category: 'individual',
        value: individual,
        weight: 30,
        description: 'Key player contribution and efficiency',
        stats: [
          { label: 'Points', value: 28, unit: '' },
          { label: 'Plus/Minus', value: 15, unit: '' }
        ]
      }
    ],
    narrative: {
      title: `${team} Performance Analysis`,
      summary: 'Team exceeded expectations through balanced execution',
      key_points: [
        'Shooting efficiency above season average',
        'Defensive control limited opponent scoring',
        'Star players delivered expected impact'
      ]
    },
    rai_comparison: {
      expected: Math.floor(Math.random() * (80 - 65) + 65),
      actual: overall,
      delta: Math.floor(Math.random() * 20 - 10),
      accuracy: concordance
    }
  });
}
