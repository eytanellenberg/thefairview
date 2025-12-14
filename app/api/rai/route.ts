import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const game_id = searchParams.get('game_id');
  const homeTeam = searchParams.get('home_team');
  const awayTeam = searchParams.get('away_team');
  
  if (!game_id) {
    return Response.json({ error: 'Missing game_id' }, { status: 400 });
  }
  
  // RAI pour HOME team
  const homeIndividual = Math.floor(Math.random() * (85 - 60) + 60);
  const homeTeamScore = Math.floor(Math.random() * (90 - 65) + 65);
  const homeOpponent = Math.floor(Math.random() * (80 - 55) + 55);
  const homeOverall = Math.round(homeIndividual * 0.33 + homeTeamScore * 0.34 + homeOpponent * 0.33);
  
  // RAI pour AWAY team
  const awayIndividual = Math.floor(Math.random() * (85 - 60) + 60);
  const awayTeamScore = Math.floor(Math.random() * (90 - 65) + 65);
  const awayOpponent = Math.floor(Math.random() * (80 - 55) + 55);
  const awayOverall = Math.round(awayIndividual * 0.33 + awayTeamScore * 0.34 + awayOpponent * 0.33);
  
  const predictedDiff = homeOverall - awayOverall;
  
  return Response.json({
    game_id,
    home_team: {
      name: homeTeam,
      overall: homeOverall,
      confidence: Math.floor(Math.random() * (90 - 75) + 75),
      breakdown: [
        { category: 'Individual', value: homeIndividual },
        { category: 'Team', value: homeTeamScore },
        { category: 'Opponent', value: homeOpponent }
      ],
      top_levers: [
        {
          id: '1',
          name: 'Team Continuity',
          value: homeTeamScore,
          weight: 34,
          description: 'Starting lineup stability and tactical cohesion.'
        },
        {
          id: '2',
          name: 'Home Court Advantage',
          value: homeOpponent,
          weight: 33,
          description: 'Performance at home venue and crowd support.'
        },
        {
          id: '3',
          name: 'Player Readiness',
          value: homeIndividual,
          weight: 33,
          description: 'Key players rest and recent form.'
        }
      ]
    },
    away_team: {
      name: awayTeam,
      overall: awayOverall,
      confidence: Math.floor(Math.random() * (90 - 75) + 75),
      breakdown: [
        { category: 'Individual', value: awayIndividual },
        { category: 'Team', value: awayTeamScore },
        { category: 'Opponent', value: awayOpponent }
      ],
      top_levers: [
        {
          id: '1',
          name: 'Road Performance',
          value: awayTeamScore,
          weight: 34,
          description: 'Away game consistency and adaptability.'
        },
        {
          id: '2',
          name: 'Matchup History',
          value: awayOpponent,
          weight: 33,
          description: 'Historical performance against this opponent.'
        },
        {
          id: '3',
          name: 'Star Power',
          value: awayIndividual,
          weight: 33,
          description: 'Key player availability and recent form.'
        }
      ]
    },
    prediction: {
      favorite: predictedDiff > 0 ? homeTeam : awayTeam,
      predicted_margin: Math.abs(predictedDiff),
      confidence: Math.floor(Math.random() * (85 - 70) + 70)
    },
    narrative: {
      title: `${predictedDiff > 0 ? homeTeam : awayTeam} Favored by ${Math.abs(predictedDiff)} Points`,
      summary: `Pre-match analysis shows ${predictedDiff > 0 ? homeTeam : awayTeam} with edge in readiness factors. ${predictedDiff > 0 ? 'Home court advantage and roster continuity' : 'Superior road performance and matchup advantages'} create favorable conditions.`,
      key_points: [
        `${homeTeam} home readiness: ${homeOverall}/100`,
        `${awayTeam} road readiness: ${awayOverall}/100`,
        `Predicted margin: ${Math.abs(predictedDiff)} points`
      ]
    }
  });
}
