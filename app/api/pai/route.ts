import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const homeTeam = searchParams.get('home_team');
  const awayTeam = searchParams.get('away_team');
  const homeScore = parseInt(searchParams.get('home_score') || '0');
  const awayScore = parseInt(searchParams.get('away_score') || '0');
  
  if (!game_id) {
    return Response.json({ error: 'Missing game_id' }, { status: 400 });
  }
  
  // PAI pour HOME
  const homeShooting = Math.floor(Math.random() * (95 - 70) + 70);
  const homeDefense = Math.floor(Math.random() * (90 - 65) + 65);
  const homeIndividual = Math.floor(Math.random() * (85 - 60) + 60);
  const homeOverall = Math.round(homeShooting * 0.38 + homeDefense * 0.32 + homeIndividual * 0.30);
  
  // PAI pour AWAY
  const awayShooting = Math.floor(Math.random() * (95 - 70) + 70);
  const awayDefense = Math.floor(Math.random() * (90 - 65) + 65);
  const awayIndividual = Math.floor(Math.random() * (85 - 60) + 60);
  const awayOverall = Math.round(awayShooting * 0.38 + awayDefense * 0.32 + awayIndividual * 0.30);
  
  // RAI predictions (simulated)
  const homeRAI = Math.floor(Math.random() * (85 - 65) + 65);
  const awayRAI = Math.floor(Math.random() * (85 - 65) + 65);
  
  const homeDelta = homeOverall - homeRAI;
  const awayDelta = awayOverall - awayRAI;
  
  const winner = homeScore > awayScore ? homeTeam : awayTeam;
  
  return Response.json({
    game_id,
    home_team: {
      name: homeTeam,
      score: homeScore,
      overall: homeOverall,
      rai_expected: homeRAI,
      delta: homeDelta,
      concordance: Math.floor(Math.random() * (95 - 80) + 80),
      breakdown: [
        { category: 'Shooting', value: homeShooting },
        { category: 'Defense', value: homeDefense },
        { category: 'Individual', value: homeIndividual }
      ],
      top_levers: [
        {
          id: '1',
          name: 'Shooting Efficiency',
          value: homeShooting,
          weight: 38,
          description: 'Field goal and three-point shooting performance.'
        },
        {
          id: '2',
          name: 'Defensive Impact',
          value: homeDefense,
          weight: 32,
          description: 'Points allowed and defensive rating.'
        },
        {
          id: '3',
          name: 'Star Performance',
          value: homeIndividual,
          weight: 30,
          description: 'Key player contributions and efficiency.'
        }
      ]
    },
    away_team: {
      name: awayTeam,
      score: awayScore,
      overall: awayOverall,
      rai_expected: awayRAI,
      delta: awayDelta,
      concordance: Math.floor(Math.random() * (95 - 80) + 80),
      breakdown: [
        { category: 'Shooting', value: awayShooting },
        { category: 'Defense', value: awayDefense },
        { category: 'Individual', value: awayIndividual }
      ],
      top_levers: [
        {
          id: '1',
          name: 'Shooting Efficiency',
          value: awayShooting,
          weight: 38,
          description: 'Field goal and three-point shooting performance.'
        },
        {
          id: '2',
          name: 'Defensive Impact',
          value: awayDefense,
          weight: 32,
          description: 'Points allowed and defensive rating.'
        },
        {
          id: '3',
          name: 'Star Performance',
          value: awayIndividual,
          weight: 30,
          description: 'Key player contributions and efficiency.'
        }
      ]
    },
    result: {
      winner: winner,
      actual_margin: Math.abs(homeScore - awayScore),
      performance_diff: Math.abs(homeOverall - awayOverall)
    },
    narrative: {
      title: `${winner} Wins by ${Math.abs(homeScore - awayScore)} Points`,
      summary: `${winner} ${homeDelta > awayDelta ? 'exceeded' : 'met'} expectations with strong execution. ${homeScore > awayScore ? homeTeam : awayTeam} delivered ${homeDelta > 0 ? 'above-prediction' : 'as-expected'} performance.`,
      key_points: [
        `${homeTeam}: ${homeDelta >= 0 ? 'Exceeded' : 'Below'} RAI by ${Math.abs(homeDelta)} points`,
        `${awayTeam}: ${awayDelta >= 0 ? 'Exceeded' : 'Below'} RAI by ${Math.abs(awayDelta)} points`,
        `Winner performance: ${winner === homeTeam ? homeOverall : awayOverall}/100`
      ]
    }
  });
}
