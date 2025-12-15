import { NextRequest, NextResponse } from 'next/server';
import { fetchGameDetails, fetchTeamRecentGames, parseTeamStatsToFair } from '@/app/lib/balldontlie-api';
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
    // Fetch game details
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
    
    // Determine which team
    const isHome = gameDetails.homeTeam.id === teamId;
    const team = isHome ? gameDetails.homeTeam : gameDetails.awayTeam;
    const opponent = isHome ? gameDetails.awayTeam : gameDetails.homeTeam;
    
    // Fetch team's recent games for win streak calculation
    const recentGames = await fetchTeamRecentGames(teamId);
    
    // Parse ACTUAL match stats
    const espnStats = parseTeamStatsToFair(team.stats, teamId, isHome, recentGames);
    
    // Map to FAIR inputs
    const fairInputs = mapESPNToFair(espnStats);
    
    // Calculate PAI
    const paiOutput = calculatePAI(fairInputs);
    
    // Also fetch RAI for comparison
    const raiResponse = await fetch(
      `${request.nextUrl.origin}/api/rai?gameId=${gameId}&teamId=${teamId}`
    );
    const raiData = await raiResponse.json();
    
    // Calculate difference
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
      { error: 'Failed to calculate PAI', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
