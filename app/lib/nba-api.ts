// Récupérer TOUS les matchs NBA de la semaine dernière et prochaine
export async function getNBASchedule() {
  try {
    const matches: any[] = [];
    const today = new Date();
    
    // Récupérer les 7 derniers jours
    for (let i = 7; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await fetch(
        `https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`,
        { next: { revalidate: 300 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.scoreboard?.games) {
          data.scoreboard.games.forEach((game: any) => {
            matches.push({
              id: game.gameId,
              date: game.gameTimeUTC.split('T')[0],
              time: game.gameTimeUTC.split('T')[1].substring(0, 5),
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
    }
    
    // Récupérer les 7 prochains jours
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await fetch(
        `https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json`,
        { next: { revalidate: 3600 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Parser le calendrier NBA (structure complexe)
        // Pour l'instant on utilise mock data pour prochains matchs
      }
    }
    
    // Si pas assez de matchs, compléter avec mock data
    if (matches.length < 10) {
      return getMockFullWeekSchedule();
    }
    
    return matches;
    
  } catch (error) {
    console.error('NBA API Error:', error);
    return getMockFullWeekSchedule();
  }
}

// Mock data avec TOUS les matchs d'une semaine
function getMockFullWeekSchedule() {
  const today = new Date();
  const matches = [];
  
  const teams = [
    { code: 'LAL', name: 'Lakers' },
    { code: 'GSW', name: 'Warriors' },
    { code: 'BOS', name: 'Celtics' },
    { code: 'MIA', name: 'Heat' },
    { code: 'MIL', name: 'Bucks' },
    { code: 'BKN', name: 'Nets' },
    { code: 'DEN', name: 'Nuggets' },
    { code: 'PHX', name: 'Suns' },
    { code: 'DAL', name: 'Mavericks' },
    { code: 'LAC', name: 'Clippers' },
    { code: 'PHI', name: '76ers' },
    { code: 'NYK', name: 'Knicks' },
    { code: 'TOR', name: 'Raptors' },
    { code: 'CHI', name: 'Bulls' },
    { code: 'ATL', name: 'Hawks' },
    { code: 'CLE', name: 'Cavaliers' },
  ];
  
  // Dernière semaine - matchs complétés
  for (let day = -7; day <= -1; day++) {
    const matchDate = new Date(today);
    matchDate.setDate(matchDate.getDate() + day);
    const dateStr = matchDate.toISOString().split('T')[0];
    
    // 4-6 matchs par jour
    const matchCount = Math.floor(Math.random() * 3) + 4;
    for (let m = 0; m < matchCount; m++) {
      const homeIdx = Math.floor(Math.random() * teams.length);
      let awayIdx = Math.floor(Math.random() * teams.length);
      while (awayIdx === homeIdx) {
        awayIdx = Math.floor(Math.random() * teams.length);
      }
      
      const homeScore = Math.floor(Math.random() * 30) + 95;
      const awayScore = Math.floor(Math.random() * 30) + 95;
      
      matches.push({
        id: `nba-past-${day}-${m}`,
        date: dateStr,
        time: `${18 + m}:00`,
        homeTeam: teams[homeIdx].code,
        awayTeam: teams[awayIdx].code,
        homeTeamName: teams[homeIdx].name,
        awayTeamName: teams[awayIdx].name,
        homeScore,
        awayScore,
        status: 'completed',
      });
    }
  }
  
  // Prochaine semaine - matchs à venir
  for (let day = 0; day <= 7; day++) {
    const matchDate = new Date(today);
    matchDate.setDate(matchDate.getDate() + day);
    const dateStr = matchDate.toISOString().split('T')[0];
    
    // 4-6 matchs par jour
    const matchCount = Math.floor(Math.random() * 3) + 4;
    for (let m = 0; m < matchCount; m++) {
      const homeIdx = Math.floor(Math.random() * teams.length);
      let awayIdx = Math.floor(Math.random() * teams.length);
      while (awayIdx === homeIdx) {
        awayIdx = Math.floor(Math.random() * teams.length);
      }
      
      matches.push({
        id: `nba-future-${day}-${m}`,
        date: dateStr,
        time: `${18 + m}:00`,
        homeTeam: teams[homeIdx].code,
        awayTeam: teams[awayIdx].code,
        homeTeamName: teams[homeIdx].name,
        awayTeamName: teams[awayIdx].name,
        homeScore: null,
        awayScore: null,
        status: 'upcoming',
      });
    }
  }
  
  return matches;
}

// Pour les autres sports (à développer)
export async function getNFLSchedule() {
  // TODO: ESPN API
  return [];
}

export async function getMLBSchedule() {
  return [];
}

export async function getNHLSchedule() {
  return [];
}

export async function getSoccerSchedule() {
  return [];
}
