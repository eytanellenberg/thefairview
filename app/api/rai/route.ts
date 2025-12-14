import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const team = searchParams.get('team');
  
  if (!game_id || !team) {
    return Response.json({ error: 'Missing game_id or team' }, { status: 400 });
  }
  
  // Calculs RAI (on affinera avec vraie méthodologie FAIR)
  const individual = Math.floor(Math.random() * (85 - 60) + 60);
  const teamScore = Math.floor(Math.random() * (90 - 65) + 65);
  const opponent = Math.floor(Math.random() * (80 - 55) + 55);
  const overall = Math.round(individual * 0.33 + teamScore * 0.34 + opponent * 0.33);
  
  return Response.json({
    game_id,
    team,
    overall,
    confidence: Math.floor(Math.random() * (90 - 75) + 75),
    breakdown: {
      individual,
      team: teamScore,
      opponent
    },
    top_levers: [
      {
        id: '1',
        name: 'Team Continuity',
        category: 'team',
        value: teamScore,
        weight: 34,
        description: 'Starting lineup stability and tactical cohesion',
        stats: [
          { label: 'Games Together', value: 12, unit: '' },
          { label: 'Win Rate L10', value: 70, unit: '%' }
        ]
      },
      {
        id: '2',
        name: 'Historical Matchup',
        category: 'opponent',
        value: opponent,
        weight: 33,
        description: 'Performance vs this opponent historically',
        stats: [
          { label: 'Win Rate vs Opp', value: 62, unit: '%' },
          { label: 'Avg Point Diff', value: 5.2, unit: '' }
        ]
      },
      {
        id: '3',
        name: 'Player Readiness',
        category: 'individual',
        value: individual,
        weight: 33,
        description: 'Key players rest and recent form',
        stats: [
          { label: 'Days Rest', value: 2, unit: '' },
          { label: 'Injury Status', value: 'Healthy', unit: '' }
        ]
      }
    ],
    narrative: {
      title: `${team} Shows Strong Pre-Match Readiness`,
      summary: 'Team enters with favorable conditions across multiple dimensions',
      key_points: [
        'Roster continuity creates tactical predictability',
        'Historical success against this opponent',
        'Key players optimally rested'
      ]
    }
  });
}
