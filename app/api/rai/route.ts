import { NextRequest, NextResponse } from 'next/server';
import { fetchGameDetails, fetchTeamRecentGames, parseTeamStatsToFair } from '@/app/lib/balldontlie-api';
import { mapESPNToFair } from '@/app/lib/espn-mapper';
import { calculateRAI } from '@/app/lib/fair-core';

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
    
    // Determine which team
    const isHome = gameDetails.homeTeam.id === teamId;
    const team = isHome ? gameDetails.homeTeam : gameDetails.awayTeam;
    const opponent = isHome ? gameDetails.awayTeam : gameDetails.homeTeam;
    
    // Fetch team's recent games for win streak calculation
    const recentGames = await fetchTeamRecentGames(teamId);
    
    // For RAI (pre-match), we use season averages or recent form
    // Since we're calculating post-match, we'll use game stats as proxy
    // In production, you'd fetch season averages separately
    const espnStats = parseTeamStatsToFair(team.stats, teamId, isHome, recentGames);
    
    // Map to FAIR inputs
    const fairInputs = mapESPNToFair(espnStats);
    
    // Calculate RAI
    const raiOutput = calculateRAI(fairInputs);
    
    return NextResponse.json({
      gameId,
      teamId,
      teamName: team.name,
      opponentName: opponent.name,
      isHome,
      timestamp: new Date().toISOString(),
      rai: raiOutput,
      inputs: fairInputs,
      espn_stats: espnStats,
    });
    
  } catch (error) {
    console.error('RAI calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate RAI', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
