// Ball Don't Lie API - Real NBA Stats
// API Key: 0afc2b09-e279-4768-958c-a89cee58ba70
// Free tier: 1000 requests/day

const BALLDONTLIE_API = 'https://api.balldontlie.io/v1';
const API_KEY = '0afc2b09-e279-4768-958c-a89cee58ba70';

const headers = {
  'Authorization': API_KEY,
};

export interface Game {
  id: number;
  date: string;
  home_team: Team;
  visitor_team: Team;
  home_team_score: number;
  visitor_team_score: number;
  status: string;
}

export interface Team {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  full_name: string;
}

export interface GameStats {
  team_id: number;
  team_name: string;
  game_id: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  ast: number;
  reb: number;
  oreb: number;
  dreb: number;
  stl: number;
  blk: number;
  turnover: number;
}

/**
 * Fetch recent completed games from last 7 days
 */
export async function fetchRecentGames(): Promise<any[]> {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    const response = await fetch(
      `${BALLDONTLIE_API}/games?start_date=${startDate}&end_date=${endDate}&per_page=20`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`BallDontLie API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform to match our format
    return data.data
      .filter((game: any) => game.status === 'Final')
      .map((game: any) => ({
        id: game.id.toString(),
        date: game.date,
        name: `${game.visitor_team.full_name} at ${game.home_team.full_name}`,
        shortName: `${game.visitor_team.abbreviation} @ ${game.home_team.abbreviation}`,
        competitions: [{
          id: game.id.toString(),
          date: game.date,
          competitors: [
            {
              id: game.home_team.id.toString(),
              team: {
                id: game.home_team.id.toString(),
                name: game.home_team.name,
                abbreviation: game.home_team.abbreviation,
                displayName: game.home_team.full_name,
              },
              score: game.home_team_score.toString(),
              homeAway: 'home',
              winner: game.home_team_score > game.visitor_team_score,
            },
            {
              id: game.visitor_team.id.toString(),
              team: {
                id: game.visitor_team.id.toString(),
                name: game.visitor_team.name,
                abbreviation: game.visitor_team.abbreviation,
                displayName: game.visitor_team.full_name,
              },
              score: game.visitor_team_score.toString(),
              homeAway: 'away',
              winner: game.visitor_team_score > game.home_team_score,
            },
          ],
          status: {
            type: {
              completed: true,
            },
          },
        }],
      }));
  } catch (error) {
    console.error('Failed to fetch games from BallDontLie:', error);
    return [];
  }
}

/**
 * Fetch game stats for a specific game
 */
export async function fetchGameStats(gameId: string): Promise<any> {
  try {
    const response = await fetch(
      `${BALLDONTLIE_API}/stats?game_ids[]=${gameId}&per_page=100`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`BallDontLie stats error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Aggregate stats by team
    const teamStats: { [key: string]: any } = {};
    
    data.data.forEach((playerStat: any) => {
      const teamId = playerStat.team.id.toString();
      
      if (!teamStats[teamId]) {
        teamStats[teamId] = {
          team_id: teamId,
          team_name: playerStat.team.full_name,
          game_id: gameId,
          fgm: 0,
          fga: 0,
          fg3m: 0,
          fg3a: 0,
          ftm: 0,
          fta: 0,
          ast: 0,
          reb: 0,
          oreb: 0,
          dreb: 0,
          stl: 0,
          blk: 0,
          turnover: 0,
          players: 0,
        };
      }
      
      // Sum up player stats
      teamStats[teamId].fgm += playerStat.fgm || 0;
      teamStats[teamId].fga += playerStat.fga || 0;
      teamStats[teamId].fg3m += playerStat.fg3m || 0;
      teamStats[teamId].fg3a += playerStat.fg3a || 0;
      teamStats[teamId].ftm += playerStat.ftm || 0;
      teamStats[teamId].fta += playerStat.fta || 0;
      teamStats[teamId].ast += playerStat.ast || 0;
      teamStats[teamId].reb += playerStat.reb || 0;
      teamStats[teamId].oreb += playerStat.oreb || 0;
      teamStats[teamId].dreb += playerStat.dreb || 0;
      teamStats[teamId].stl += playerStat.stl || 0;
      teamStats[teamId].blk += playerStat.blk || 0;
      teamStats[teamId].turnover += playerStat.turnover || 0;
      teamStats[teamId].players += 1;
    });
    
    // Calculate percentages
    Object.values(teamStats).forEach((stats: any) => {
      stats.fg_pct = stats.fga > 0 ? (stats.fgm / stats.fga) * 100 : 0;
      stats.fg3_pct = stats.fg3a > 0 ? (stats.fg3m / stats.fg3a) * 100 : 0;
      stats.ft_pct = stats.fta > 0 ? (stats.ftm / stats.fta) * 100 : 0;
    });
    
    return teamStats;
  } catch (error) {
    console.error('Failed to fetch game stats:', error);
    return {};
  }
}

/**
 * Fetch team's recent games for win streak calculation
 */
export async function fetchTeamRecentGames(teamId: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${BALLDONTLIE_API}/games?team_ids[]=${teamId}&per_page=10`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`BallDontLie team games error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.filter((game: any) => game.status === 'Final');
  } catch (error) {
    console.error('Failed to fetch team recent games:', error);
    return [];
  }
}

/**
 * Parse team stats to FAIR input format
 */
export function parseTeamStatsToFair(teamStats: any, teamId: string, isHome: boolean, recentGames: any[]): any {
  // Calculate win streak
  let winStreak = 0;
  let last5Wins = 0;
  
  for (let i = 0; i < Math.min(recentGames.length, 5); i++) {
    const game = recentGames[i];
    const won = (game.home_team.id.toString() === teamId && game.home_team_score > game.visitor_team_score) ||
                 (game.visitor_team.id.toString() === teamId && game.visitor_team_score > game.home_team_score);
    
    if (i < 5 && won) last5Wins++;
    
    if (i === 0) {
      winStreak = won ? 1 : -1;
    } else if ((won && winStreak > 0) || (!won && winStreak < 0)) {
      winStreak += won ? 1 : -1;
    } else {
      break;
    }
  }
  
  // Calculate days rest (estimate: 1-2 days between games on average)
  const daysRest = recentGames.length > 1 ? 2 : 3;
  
  return {
    field_goal_pct: teamStats.fg_pct || 45.0,
    three_point_pct: teamStats.fg3_pct || 35.0,
    free_throw_pct: teamStats.ft_pct || 75.0,
    assists: teamStats.ast || 24,
    turnovers: teamStats.turnover || 13,
    rebounds_offensive: teamStats.oreb || 10,
    rebounds_defensive: teamStats.dreb || 35,
    rebounds_total: teamStats.reb || 45,
    steals: teamStats.stl || 8,
    blocks: teamStats.blk || 5,
    days_rest: daysRest,
    is_back_to_back: false,
    injury_count: 1, // Default, would need separate injury API
    minutes_played_avg: 35.0,
    win_streak: winStreak,
    is_home: isHome,
    last_5_wins: last5Wins,
  };
}

export async function fetchGameDetails(gameId: string): Promise<any> {
  try {
    // Fetch game info
    const gameResponse = await fetch(
      `${BALLDONTLIE_API}/games/${gameId}`,
      { headers }
    );
    
    if (!gameResponse.ok) {
      throw new Error(`Game not found: ${gameId}`);
    }
    
    const game = await gameResponse.json();
    
    // Fetch stats for this game
    const teamStats = await fetchGameStats(gameId);
    
    const homeTeamId = game.home_team.id.toString();
    const awayTeamId = game.visitor_team.id.toString();
    
    return {
      gameId,
      homeTeam: {
        id: homeTeamId,
        name: game.home_team.full_name,
        score: game.home_team_score,
        stats: teamStats[homeTeamId] || {},
      },
      awayTeam: {
        id: awayTeamId,
        name: game.visitor_team.full_name,
        score: game.visitor_team_score,
        stats: teamStats[awayTeamId] || {},
      },
      completed: game.status === 'Final',
    };
  } catch (error) {
    console.error('Failed to fetch game details:', error);
    return null;
  }
}
