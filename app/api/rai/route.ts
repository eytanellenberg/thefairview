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
    
    // Parse stats (use recent season averages for pre-match)
    // For RAI, we need PREDICTED stats, not actual match stats
    // So we'll use ESPN's season averages or recent form
    
    // Fetch team schedule for rest calculation
    // For mock data, use default values
    const daysRest = 2; // Default: well-rested
    const isBackToBack = false;
    
    // Fetch injuries
    const injuryCount = 1; // Default for mock data
    
    // Calculate win streak from recent games
    const wins = 3; // Default for mock data
    const winStreak = wins >= 3 ? wins - 3 : -(3 - wins);
    
    // Build ESPN stats object with predicted/average values
    // For demo, we'll use reasonable defaults - in production, fetch season averages
    const espnStats = {
      field_goal_pct: 46.0,      // NBA average
      three_point_pct: 36.0,     // NBA average
      free_throw_pct: 78.0,      // NBA average
      assists: 25,
      turnovers: 13,
      rebounds_offensive: 10,
      rebounds_defensive: 35,
      rebounds_total: 45,
      steals: 8,
      blocks: 5,
      days_rest: daysRest,
      is_back_to_back: isBackToBack,
      injury_count: injuryCount,
      minutes_played_avg: 35.0,
      win_streak: winStreak,
      is_home: isHome,
      last_5_wins: wins,
    };
    
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
      { error: 'Failed to calculate RAI' },
      { status: 500 }
    );
  }
}
