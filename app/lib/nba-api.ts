export async function getNBASchedule() {
  try {
    const allMatches = await fetchNBAMatches();
    
    // Grouper par équipe et prendre le dernier match de chaque
    const lastMatchPerTeam = getLastMatchPerTeam(allMatches.filter(m => m.status === 'completed'));
    const nextMatchPerTeam = getNextMatchPerTeam(allMatches.filter(m => m.status === 'upcoming'));
    
    return {
      recent: lastMatchPerTeam,
      upcoming: nextMatchPerTeam
    };
  } catch (error) {
    console.error('NBA API Error:', error);
    return getMockScheduleByTeam();
  }
}

async function fetchNBAMatches() {
  const matches: any[] = [];
  
  // Récupérer matchs des 7 derniers jours
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    try {
      const response = await fetch(
        'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json',
        { next: { revalidate: 300 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.scoreboard?.games) {
          data.scoreboard.games.forEach((game: any) => {
            matches.push({
              id: game.gameId,
              date: game.gameTimeUTC.split('T')[0],
              homeTeam: game.homeTeam.teamTricode,
              awayTeam: game.awayTeam.teamTricode,
              homeTeamName: game.homeTeam.teamName,
              awayTeamName: game.awayTeam.teamName,
              homeScore: game.homeTeam.score || null,
              awayScore: game.awayTeam.score || null,
              status: game.gameStatus === 3 ? 'completed' : 'upcoming',
            });
          });
        }
      }
    } catch (e) {
      console.error('Error fetching day:', e);
    }
  }
  
  if (matches.length === 0) {
    return getMockAllMatches();
  }
  
  return matches;
}

function getLastMatchPerTeam(completedMatches: any[]) {
  const teamLastMatch: Record<string, any> = {};
  
  // Trier par date décroissante
  const sorted = completedMatches.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  sorted.forEach(match => {
    // Pour l'équipe à domicile
    if (!teamLastMatch[match.homeTeam]) {
      teamLastMatch[match.homeTeam] = { ...match, perspective: 'home' };
    }
    // Pour l'équipe extérieure
    if (!teamLastMatch[match.awayTeam]) {
      teamLastMatch[match.awayTeam] = { ...match, perspective: 'away' };
    }
  });
  
  return Object.values(teamLastMatch);
}

function getNextMatchPerTeam(upcomingMatches: any[]) {
  const teamNextMatch: Record<string, any> = {};
  
  // Trier par date croissante
  const sorted = upcomingMatches.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  sorted.forEach(match => {
    if (!teamNextMatch[match.homeTeam]) {
      teamNextMatch[match.homeTeam] = { ...match, perspective: 'home' };
    }
    if (!teamNextMatch[match.awayTeam]) {
      teamNextMatch[match.awayTeam] = { ...match, perspective: 'away' };
    }
  });
  
  return Object.values(teamNextMatch);
}

function getMockAllMatches() {
  const teams = [
    'LAL', 'GSW', 'BOS', 'MIA', 'MIL', 'BKN', 'DEN', 'PHX', 
    'DAL', 'LAC', 'PHI', 'NYK', 'TOR', 'CHI', 'ATL', 'CLE',
    'MEM', 'SAC', 'NOP', 'MIN', 'OKC', 'POR', 'UTA', 'SAS',
    'HOU', 'ORL', 'WAS', 'DET', 'CHA', 'IND'
  ];
  
  const teamNames: Record<string, string> = {
    'LAL': 'Lakers', 'GSW': 'Warriors', 'BOS': 'Celtics', 'MIA': 'Heat',
    'MIL': 'Bucks', 'BKN': 'Nets', 'DEN': 'Nuggets', 'PHX': 'Suns',
    'DAL': 'Mavericks', 'LAC': 'Clippers', 'PHI': '76ers', 'NYK': 'Knicks',
    'TOR': 'Raptors', 'CHI': 'Bulls', 'ATL': 'Hawks', 'CLE': 'Cavaliers',
    'MEM': 'Grizzlies', 'SAC': 'Kings', 'NOP': 'Pelicans', 'MIN': 'Timberwolves',
    'OKC': 'Thunder', 'POR': 'Trail Blazers', 'UTA': 'Jazz', 'SAS': 'Spurs',
    'HOU': 'Rockets', 'ORL': 'Magic', 'WAS': 'Wizards', 'DET': 'Pistons',
    'CHA': 'Hornets', 'IND': 'Pacers'
  };
  
  const matches = [];
  
  // Créer un match passé pour chaque équipe (15 matchs = 30 équipes)
  for (let i = 0; i < 15; i++) {
    const home = teams[i * 2];
    const away = teams[i * 2 + 1];
    const homeScore = Math.floor(Math.random() * 30) + 95;
    const awayScore = Math.floor(Math.random() * 30) + 95;
    
    matches.push({
      id: `past-${i}`,
      date: new Date(Date.now() - (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      homeTeam: home,
      awayTeam: away,
      homeTeamName: teamNames[home],
      awayTeamName: teamNames[away],
      homeScore,
      awayScore,
      status: 'completed',
    });
  }
  
  // Créer un match futur pour chaque équipe
  for (let i = 0; i < 15; i++) {
    const home = teams[i * 2];
    const away = teams[i * 2 + 1];
    
    matches.push({
      id: `future-${i}`,
      date: new Date(Date.now() + (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      homeTeam: home,
      awayTeam: away,
      homeTeamName: teamNames[home],
      awayTeamName: teamNames[away],
      homeScore: null,
      awayScore: null,
      status: 'upcoming',
    });
  }
  
  return matches;
}

function getMockScheduleByTeam() {
  const allMatches = getMockAllMatches();
  return {
    recent: getLastMatchPerTeam(allMatches.filter(m => m.status === 'completed')),
    upcoming: getNextMatchPerTeam(allMatches.filter(m => m.status === 'upcoming'))
  };
}

export async function getNFLSchedule() {
  // TODO
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
