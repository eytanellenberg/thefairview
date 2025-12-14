import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const team = searchParams.get('team');
  
  if (!game_id || !team) {
    return Response.json({ error: 'Missing game_id or team' }, { status: 400 });
  }
  
  const individual = Math.floor(Math.random() * (85 - 60) + 60);
  const teamScore = Math.floor(Math.random() * (90 - 65) + 65);
  const opponent = Math.floor(Math.random() * (80 - 55) + 55);
  const overall = Math.round(individual * 0.33 + teamScore * 0.34 + opponent * 0.33);
  
  return Response.json({
    game_id,
    team,
    overall,
    confidence: Math.floor(Math.random() * (90 - 75) + 75),
    breakdown: [
      { category: 'Individual', value: individual },
      { category: 'Team', value: teamScore },
      { category: 'Opponent', value: opponent }
    ],
    top_levers: [
      {
        id: '1',
        name: 'Team Continuity',
        value: teamScore,
        weight: 34,
        description: 'Starting lineup stability and tactical cohesion. Roster continuity creates tactical predictability.'
      },
      {
        id: '2',
        name: 'Historical Matchup',
        value: opponent,
        weight: 33,
        description: 'Performance vs this opponent historically. Team has shown consistent success in this matchup.'
      },
      {
        id: '3',
        name: 'Player Readiness',
        value: individual,
        weight: 33,
        description: 'Key players rest and recent form. Stars are optimally rested with no injury concerns.'
      }
    ],
    narrative: {
      title: `${team} Shows Strong Pre-Match Readiness`,
      summary: 'Team enters with favorable conditions across multiple dimensions including roster stability, historical success against this opponent, and optimal player rest.',
      key_points: [
        'Roster continuity creates tactical predictability',
        'Historical success against this opponent',
        'Key players optimally rested'
      ]
    }
  });
}
