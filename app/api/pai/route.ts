import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const team = searchParams.get('team');
  
  if (!game_id || !team) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 });
  }
  
  const shooting = Math.floor(Math.random() * (95 - 70) + 70);
  const defense = Math.floor(Math.random() * (90 - 65) + 65);
  const individual = Math.floor(Math.random() * (85 - 60) + 60);
  const overall = Math.round(shooting * 0.38 + defense * 0.32 + individual * 0.30);
  
  const raiScore = Math.floor(Math.random() * (85 - 65) + 65);
  const delta = overall - raiScore;
  
  return Response.json({
    game_id,
    team,
    overall,
    concordance: Math.floor(Math.random() * (95 - 80) + 80),
    breakdown: [
      { category: 'Shooting', value: shooting },
      { category: 'Defense', value: defense },
      { category: 'Individual', value: individual }
    ],
    rai_comparison: {
      expected: raiScore,
      actual: overall,
      delta: delta
    },
    top_levers: [
      {
        id: '1',
        name: 'Shooting Efficiency',
        value: shooting,
        weight: 38,
        description: 'Field goal percentage and three-point shooting performance.'
      },
      {
        id: '2',
        name: 'Defensive Impact',
        value: defense,
        weight: 32,
        description: 'Opponent points allowed and defensive rating.'
      },
      {
        id: '3',
        name: 'Star Performance',
        value: individual,
        weight: 30,
        description: 'Key player contributions and efficiency.'
      }
    ],
    narrative: {
      title: delta >= 0 ? `${team} Exceeded Expectations` : `${team} Underperformed`,
      summary: delta >= 0 
        ? 'Team exceeded expectations through balanced execution.'
        : 'Team fell short of predictions despite bright spots.',
      key_points: [
        delta >= 0 ? 'Shooting efficiency surpassed projections' : 'Shooting below expected',
        delta >= 0 ? 'Defensive intensity matched plan' : 'Defensive lapses costly',
        delta >= 0 ? 'Stars delivered in key moments' : 'Inconsistent execution'
      ]
    }
  });
}
