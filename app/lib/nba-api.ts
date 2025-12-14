// NBA API pour récupérer les vrais matchs
export async function getNBASchedule() {
  try {
    // API NBA officielle (gratuite)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 2);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);
    
    const response = await fetch(
      'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json',
      { next: { revalidate: 300 } } // Cache 5 minutes
    );
    
    if (!response.ok) throw new Error('NBA API failed');
    
    const data = await response.json();
    
    // Transformer les données NBA en notre format
    const matches = data.scoreboard.games.map((game: any) => ({
      id: game.gameId,
      date: game.gameTimeUTC.split('T')[0],
      time: game.gameTimeUTC.split('T')[1].substring(0, 5),
      homeTeam: game.homeTeam.teamTricode,
      awayTeam: game.awayTeam.teamTricode,
      homeScore: game.homeTeam.score || null,
      awayScore: game.awayTeam.score || null,
      status: game.gameStatus === 3 ? 'completed' : 'upcoming',
      homeTeamName: game.homeTeam.teamName,
      awayTeamName: game.awayTeam.teamName,
    }));
    
    return matches;
  } catch (error) {
    console.error('Error fetching NBA schedule:', error);
    // Fallback to mock data if API fails
    return getMockNBAMatches();
  }
}

// Mock data en cas d'échec de l'API
function getMockNBAMatches() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  return [
    {
      id: 'mock-1',
      date: today,
      time: '19:00',
      homeTeam: 'LAL',
      awayTeam: 'GSW',
      homeTeamName: 'Lakers',
      awayTeamName: 'Warriors',
      homeScore: 118,
      awayScore: 112,
      status: 'completed'
    },
    {
      id: 'mock-2',
      date: today,
      time: '20:30',
      homeTeam: 'BOS',
      awayTeam: 'MIA',
      homeTeamName: 'Celtics',
      awayTeamName: 'Heat',
      homeScore: 122,
      awayScore: 104,
      status: 'completed'
    },
    {
      id: 'mock-3',
      date: tomorrowStr,
      time: '19:30',
      homeTeam: 'MIL',
      awayTeam: 'BKN',
      homeTeamName: 'Bucks',
      awayTeamName: 'Nets',
      homeScore: null,
      awayScore: null,
      status: 'upcoming'
    },
    {
      id: 'mock-4',
      date: tomorrowStr,
      time: '21:00',
      homeTeam: 'DEN',
      awayTeam: 'PHX',
      homeTeamName: 'Nuggets',
      awayTeamName: 'Suns',
      homeScore: null,
      awayScore: null,
      status: 'upcoming'
    }
  ];
}

// Pour les autres sports (on ajoutera plus tard)
export async function getNFLSchedule() {
  // TODO: Intégrer ESPN API ou NFL API
  return [];
}

export async function getMLBSchedule() {
  // TODO: Intégrer MLB API
  return [];
}

export async function getNHLSchedule() {
  // TODO: Intégrer NHL API
  return [];
}

export async function getSoccerSchedule() {
  // TODO: Intégrer Football-Data.org API
  return [];
}
