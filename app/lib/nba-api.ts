export interface Match {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'completed' | 'upcoming';
}

const NBA_TEAMS: Record<string, string> = {
  'LAL': 'Lakers',
  'GSW': 'Warriors',
  'BOS': 'Celtics',
  'MIA': 'Heat',
  'MIL': 'Bucks',
  'BKN': 'Nets',
  'DEN': 'Nuggets',
  'PHX': 'Suns',
  'DAL': 'Mavericks',
  'LAC': 'Clippers',
  'PHI': '76ers',
  'NYK': 'Knicks',
  'TOR': 'Raptors',
  'CHI': 'Bulls',
  'ATL': 'Hawks',
  'CLE': 'Cavaliers',
  'MEM': 'Grizzlies',
  'SAC': 'Kings',
  'NOP': 'Pelicans',
  'MIN': 'Timberwolves',
  'OKC': 'Thunder',
  'POR': 'Trail Blazers',
  'UTA': 'Jazz',
  'SAS': 'Spurs',
  'HOU': 'Rockets',
  'ORL': 'Magic',
  'WAS': 'Wizards',
  'DET': 'Pistons',
  'CHA': 'Hornets',
  'IND': 'Pacers'
};

function getMockSchedule(): { recent: Match[], upcoming: Match[] } {
  const teams = Object.keys(NBA_TEAMS);
  const recent: Match[] = [];
  const upcoming: Match[] = [];
  
  // Créer 15 matchs passés (30 équipes)
  for (let i = 0; i < 15; i++) {
    const homeTeam = teams[i * 2];
    const awayTeam = teams[i * 2 + 1];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7) - 1);
    
    recent.push({
      id: `past-${i}`,
      date: date.toISOString().split('T')[0],
      homeTeam,
      awayTeam,
      homeTeamName: NBA_TEAMS[homeTeam],
      awayTeamName: NBA_TEAMS[awayTeam],
      homeScore: Math.floor(Math.random() * 30) + 95,
      awayScore: Math.floor(Math.random() * 30) + 95,
      status: 'completed'
    });
  }
  
  // Créer 15 matchs futurs
  for (let i = 0; i < 15; i++) {
    const homeTeam = teams[i * 2];
    const awayTeam = teams[i * 2 + 1];
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 7) + 1);
    
    upcoming.push({
      id: `future-${i}`,
      date: date.toISOString().split('T')[0],
      homeTeam,
      awayTeam,
      homeTeamName: NBA_TEAMS[homeTeam],
      awayTeamName: NBA_TEAMS[awayTeam],
      homeScore: null,
      awayScore: null,
      status: 'upcoming'
    });
  }
  
  return { recent, upcoming };
}

export async function getNBASchedule(): Promise<{ recent: Match[], upcoming: Match[] }> {
  try {
    const response = await fetch(
      'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json',
      { next: { revalidate: 300 } }
    );
    
    if (!response.ok) {
      throw new Error('NBA API failed');
    }
    
    const data = await response.json();
    
    if (!data.scoreboard?.games || data.scoreboard.games.length === 0) {
      return getMockSchedule();
    }
    
    const matches: Match[] = data.scoreboard.games.map((game: any) => ({
      id: game.gameId,
      date: game.gameTimeUTC.split('T')[0],
      homeTeam: game.homeTeam.teamTricode,
      awayTeam: game.awayTeam.teamTricode,
      homeTeamName: game.homeTeam.teamName,
      awayTeamName: game.awayTeam.teamName,
      homeScore: game.homeTeam.score || null,
      awayScore: game.awayTeam.score || null,
      status: game.gameStatus === 3 ? 'completed' : 'upcoming',
    }));
    
    const recent = matches.filter(m => m.status === 'completed');
    const upcoming = matches.filter(m => m.status === 'upcoming');
    
    // Si pas assez de données, compléter avec mock
    if (recent.length < 10 || upcoming.length < 10) {
      const mock = getMockSchedule();
      return {
        recent: recent.length > 0 ? recent : mock.recent,
        upcoming: upcoming.length > 0 ? upcoming : mock.upcoming
      };
    }
    
    return { recent, upcoming };
    
  } catch (error) {
    console.error('NBA API error:', error);
    return getMockSchedule();
  }
}

export async function getNFLSchedule() {
  return { recent: [], upcoming: [] };
}

export async function getMLBSchedule() {
  return { recent: [], upcoming: [] };
}

export async function getNHLSchedule() {
  return { recent: [], upcoming: [] };
}

export async function getSoccerSchedule() {
  return { recent: [], upcoming: [] };
}
