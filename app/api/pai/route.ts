import { NextRequest, NextResponse } from 'next/server';
import { fetchGameDetails, parseTeamStats } from '@/app/lib/espn-api';
import { mapESPNToFair } from '@/app/lib/espn-mapper';
import { calculatePAI } from '@/app/lib/fair-core';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameId = searchParams.get('gameId');
  const teamId = searchParams.get('teamId');
  
  if (!gameId || !teamId) {
    return NextResponse.json(
      { error: 'gameId and teamId required' },
      { status: 400 }
    );
  }
  
  try {
    const gameDetails = await fetchGameDetails(gameId);
    if (!gameDetails) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    if (!gameDetails.completed) {
      return NextResponse.json(
        { error: 'Game not completed yet' },
        { status: 400 }
      );
    }
    
    const isHome = gameDetails.homeTeam.id === teamId;
    const team = isHome ? gameDetails.homeTeam : gameDetails.awayTeam;
    const opponent = isHome ? gameDetails.awayTeam : gameDetails.homeTeam;
    
    const matchStats = parseTeamStats(team.stats);
    
    const espnStats = {
      ...matchStats,
      days_rest: 2,
      is_back_to_back: false,
      injury_count: 1,
      minutes_played_avg: 35.0,
      win_streak: 0,
      is_home: isHome,
      last_5_wins: 3,
    };
    
    const fairInputs = mapESPNToFair(espnStats);
    const paiOutput = calculatePAI(fairInputs);
    
    const raiResponse = await fetch(
      `${request.nextUrl.origin}/api/rai?gameId=${gameId}&teamId=${teamId}`
    );
    const raiData = await raiResponse.json();
    
    const raiScore = raiData.rai?.rai_score || 0;
    const paiScore = paiOutput.rai_score;
    const difference = paiScore - raiScore;
    
    return NextResponse.json({
      gameId,
      teamId,
      teamName: team.name,
      opponentName: opponent.name,
      finalScore: {
        team: team.score,
        opponent: opponent.score,
      },
      won: team.score > opponent.score,
      timestamp: new Date().toISOString(),
      pai: paiOutput,
      rai_predicted: raiScore,
      difference: {
        score: difference,
        percentage: raiScore > 0 ? Math.round((difference / raiScore) * 100) : 0,
        direction: difference > 0 ? 'better' : difference < 0 ? 'worse' : 'same',
      },
      inputs: fairInputs,
      espn_stats: espnStats,
    });
    
  } catch (error) {
    console.error('PAI calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate PAI' },
      { status: 500 }
    );
  }
}
