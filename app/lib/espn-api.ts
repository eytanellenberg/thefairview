bash

cat /home/claude/thefairview-v2/app/lib/espn-api.ts | head -200
Output

// ESPN API client for NBA stats
import { MOCK_GAMES, MOCK_GAME_DETAILS } from './mock-data';

const ESPN_NBA_API = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const USE_MOCK_DATA = true; // Set to false when ESPN API is accessible

export interface ESPNGame {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: Array<{
    id: string;
    date: string;
    competitors: Array<{
      id: string;
      team: {
        id: string;
        name: string;
        abbreviation: string;
        displayName: string;
      };
      score: string;
      homeAway: 'home' | 'away';
      winner: boolean;
    }>;
    status: {
      type: {
        completed: boolean;
      };
    };
  }>;
}

export interface ESPNGameDetails {
  gameId: string;
  homeTeam: {
    id: string;
    name: string;
    score: number;
    stats: any;
  };
  awayTeam: {
    id: string;
    name: string;
    score: number;
    stats: any;
  };
  completed: boolean;
}

/**
 * Fetch recent completed games (last 14 days)
 */
export async function fetchRecentGames(): Promise<ESPNGame[]> {
  if (USE_MOCK_DATA) {
    return MOCK_GAMES as ESPNGame[];
  }
  
  try {
    const response = await fetch(`${ESPN_NBA_API}/scoreboard`);
    if (!response.ok) throw new Error('ESPN API failed');
    
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Failed to fetch recent games:', error);
    return MOCK_GAMES as ESPNGame[];
  }
}

/**
 * Fetch game details and stats
 */
export async function fetchGameDetails(gameId: string): Promise<ESPNGameDetails | null> {
  if (USE_MOCK_DATA && MOCK_GAME_DETAILS[gameId as keyof typeof MOCK_GAME_DETAILS]) {
    return MOCK_GAME_DETAILS[gameId as keyof typeof MOCK_GAME_DETAILS] as ESPNGameDetails;
  }
  
  try {
    const response = await fetch(`${ESPN_NBA_API}/summary?event=${gameId}`);
    if (!response.ok) throw new Error('ESPN game details failed');
    
    const data = await response.json();
    
    // Parse teams
    const competition = data.boxscore?.teams || [];
    const homeTeam = competition.find((t: any) => t.homeAway === 'home');
    const awayTeam = competition.find((t: any) => t.homeAway === 'away');
    
    if (!homeTeam || !awayTeam) return null;
    
    return {
      gameId,
      homeTeam: {
        id: homeTeam.team.id,
        name: homeTeam.team.displayName,
        score: parseInt(homeTeam.score || '0'),
        stats: homeTeam.statistics || [],
      },
      awayTeam: {
        id: awayTeam.team.id,
        name: awayTeam.team.displayName,
        score: parseInt(awayTeam.score || '0'),
        stats: awayTeam.statistics || [],
      },
      completed: data.header?.competitions?.[0]?.status?.type?.completed || false,
    };
  } catch (error) {
    console.error('Failed to fetch game details:', error);
    return USE_MOCK_DATA && MOCK_GAME_DETAILS[gameId as keyof typeof MOCK_GAME_DETAILS] 
      ? MOCK_GAME_DETAILS[gameId as keyof typeof MOCK_GAME_DETAILS] as ESPNGameDetails
      : null;
  }
}

/**
 * Parse team statistics from ESPN format
 */
export function parseTeamStats(rawStats: any[]): any {
  const stats: any = {};
  
  rawStats.forEach((stat: any) => {
    const name = stat.name.toLowerCase().replace(/\s+/g, '_');
    stats[name] = parseFloat(stat.displayValue) || 0;
  });
  
  return {
    field_goal_pct: stats.field_goal_percentage || 0,
    three_point_pct: stats.three_point_field_goal_percentage || 0,
    free_throw_pct: stats.free_throw_percentage || 0,
    assists: stats.assists || 0,
    turnovers: stats.turnovers || 0,
    rebounds_offensive: stats.offensive_rebounds || 0,
    rebounds_defensive: stats.defensive_rebounds || 0,
    rebounds_total: stats.total_rebounds || 0,
    steals: stats.steals || 0,
    blocks: stats.blocks || 0,
  };
}

/**
 * Fetch team schedule to determine rest days
 */
export async function fetchTeamSchedule(teamId: string): Promise<any[]> {
  try {
    const response = await fetch(`${ESPN_NBA_API}/teams/${teamId}/schedule`);
    if (!response.ok) throw new Error('Team schedule failed');
    
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Failed to fetch team schedule:', error);
    return [];
  }
}

/**
 * Calculate days of rest for a team
 */
export function calculateDaysRest(schedule: any[], gameDate: string): number {
  const currentGame = new Date(gameDate);
  
  // Find previous game
  const previousGames = schedule
    .filter((event: any) => new Date(event.date) < currentGame)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (previousGames.length === 0) return 7; // Default to well-rested
  
  const previousGame = new Date(previousGames[0].date);
  const diffTime = Math.abs(currentGame.getTime() - previousGame.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Fetch team injury report
 */
export async function fetchTeamInjuries(teamId: string): Promise<number> {
  try {
    const response = await fetch(`${ESPN_NBA_API}/teams/${teamId}`);
    if (!response.ok) throw new Error('Team info failed');
    
    const data = await response.json();
    const injuries = data.team?.injuries || [];
    
    // Count only significant injuries (out, doubtful)
    return injuries.filter((inj: any) => 
      inj.status === 'Out' || inj.status === 'Doubtful'
    ).length;
  } catch (error) {
    console.error('Failed to fetch injuries:', error);
    return 0;
  }
}
