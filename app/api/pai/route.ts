import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const team = searchParams.get('team');
  
  if (!game_id || !team) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 });
  }
  
  // Simulation basée sur un score réel (à remplacer par vraie logique)
  // Pour l'instant: PAI = fonction du score
  // Si équipe a gagné: PAI entre 75-95
  // Si équipe a perdu: PAI entre 50-74
  
  const wonGame = Math.random() > 0.5; // À remplacer par vrai résultat
  
  const shooting = wonGame 
    ? Math.floor(Math.random() * (95 - 75) + 75)
    : Math.floor(Math.random() * (74 - 55) + 55);
    
  const defense = wonGame
    ? Math.floor(Math.random() * (90 - 70) + 70)
    : Math.floor(Math.random() * (70 - 50) + 50);
    
  const individual = wonGame
    ? Math.floor(Math.random() * (90 - 70) + 70)
    : Math.floor(Math.random() * (75 - 55) + 55);
  
  const overall = Math.round(shooting * 0.38 + defense * 0.32 + individual * 0.30);
  
  // RAI était entre 65-85
  const raiScore = Math.floor(Math.random() * (85 - 65) + 65);
  const delta = overall - raiScore;
  
  return Response.json({
    game_id,
    team,
    overall,
    concordance: Math.floor(Math.random() * (95 - 80) + 80),
    breakdown: [
      { 
        category: 'Shooting', 
        value: shooting,
        detail: wonGame 
          ? `FG%: ${(45 + Math.random() * 8).toFixed(1)}% • 3PT%: ${(36 + Math.random() * 8).toFixed(1)}%`
          : `FG%: ${(38 + Math.random() * 6).toFixed(1)}% • 3PT%: ${(28 + Math.random() * 6).toFixed(1)}%`
      },
      { 
        category: 'Defense', 
        value: defense,
        detail: wonGame
          ? `Opponent FG%: ${(40 + Math.random() * 5).toFixed(1)}% • Forced TOs: ${Math.floor(12 + Math.random() * 8)}`
          : `Opponent FG%: ${(48 + Math.random() * 6).toFixed(1)}% • Forced TOs: ${Math.floor(6 + Math.random() * 6)}`
      },
      { 
        category: 'Individual', 
        value: individual,
        detail: wonGame
          ? `Top scorer: ${Math.floor(25 + Math.random() * 15)} pts • Team assists: ${Math.floor(22 + Math.random() * 8)}`
          : `Top scorer: ${Math.floor(18 + Math.random() * 10)} pts • Team assists: ${Math.floor(15 + Math.random() * 7)}`
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
        name: 'Shooting Efficiency',
        value: shooting,
        weight: 38,
        description: wonGame
          ? `Strong shooting night with ${(45 + Math.random() * 8).toFixed(1)}% from field. Key players hit clutch shots in 4th quarter.`
          : `Struggled from field at ${(38 + Math.random() * 6).toFixed(1)}%. Missed open looks and failed to capitalize on opportunities.`
      },
      {
        id: '2',
        name: 'Defensive Impact',
        value: defense,
        weight: 32,
        description: wonGame
          ? `Held opponent to ${(40 + Math.random() * 5).toFixed(1)}% shooting. Forced ${Math.floor(12 + Math.random() * 8)} turnovers and controlled paint.`
          : `Defense struggled, allowing ${(48 + Math.random() * 6).toFixed(1)}% shooting. Failed to contest shots and gave up easy baskets.`
      },
      {
        id: '3',
        name: 'Clutch Performance',
        value: individual,
        weight: 30,
        description: wonGame
          ? `Stars delivered in key moments. 4th quarter execution was sharp with ${Math.floor(8 + Math.random() * 6)} assists and 0 turnovers in final 5 min.`
          : `Failed to execute down the stretch. Turnovers and missed free throws cost the game in final minutes.`
      }
    ],
    narrative: {
      title: wonGame ? `${team} Delivered Strong Performance` : `${team} Failed to Execute`,
      summary: wonGame
        ? 'Team exceeded expectations through balanced execution across shooting, defense, and individual contributions.'
        : 'Team fell short despite some bright spots. Key deficiencies in shooting and defense prevented competitive finish.',
      key_points: wonGame ? [
        `Shooting efficiency surpassed season average`,
        `Defensive intensity forced opponent errors`,
        `Stars delivered in clutch moments`
      ] : [
        `Shooting below season benchmarks`,
        `Defensive lapses allowed easy baskets`,
        `Failed to execute in critical moments`
      ]
    }
  });
}
