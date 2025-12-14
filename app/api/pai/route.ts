import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const team = searchParams.get('team');
  
  if (!game_id || !team) {
    return Response.json({ error: 'Missing game_id or team' }, { status: 400 });
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
        description: 'Field goal percentage and three-point shooting performance exceeded expectations with hot shooting from key players.'
      },
      {
        id: '2',
        name: 'Defensive Impact',
        value: defense,
        weight: 32,
        description: 'Opponent points allowed and defensive rating. Team showed strong perimeter defense and rim protection.'
      },
      {
        id: '3',
        name: 'Star Performance',
        value: individual,
        weight: 30,
        description: 'Key player contributions and efficiency. Stars delivered in crucial moments with clutch plays.'
      }
    ],
    narrative: {
      title: delta >= 0 ? `${team} Exceeded Expectations` : `${team} Underperformed Predictions`,
      summary: delta >= 0 
        ? 'Team exceeded expectations through balanced execution across all performance dimensions.'
        : 'Team fell short of predictions despite some bright spots in execution.',
      key_points: [
        delta >= 0 ? 'Shooting efficiency surpassed projections' : 'Shooting below expected levels',
        delta >= 0 ? 'Defensive intensity matched game plan' : 'Defensive lapses cost opportunities',
        delta >= 0 ? 'Star players delivered in key moments' : 'Inconsistent execution from key players'
      ]
    }
  });
}
