export async function getNBASchedule() {
  try {
    // Récupérer les vrais matchs d'aujourd'hui
    const response = await fetch(
      'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json',
      { next: { revalidate: 60 } }
    );
    
    if (response.ok) {
      const data = await response.json();
      const games = data.scoreboard?.games || [];
      
      if (games.length > 0) {
        const matches = games.map((game: any) => ({
          id: game.gameId,
          date: game.gameDateTimeUTC.split('T')[0],
          homeTeam: game.homeTeam.teamTricode,
          awayTeam: game.awayTeam.teamTricode,
          homeTeamName: game.homeTeam.teamName,
          awayTeamName: game.awayTeam.teamName,
          homeScore: game.homeTeam.score,
          awayScore: game.awayTeam.score,
          status: game.gameStatusText === 'Final' ? 'completed' : 'upcoming',
        }));
        
        return matches;
      }
    }
  } catch (error) {
    console.error('NBA API error:', error);
  }
  
  // Fallback: données mock réalistes
  return getMockSchedule();
}

function getMockSchedule() {
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

  const matches = [];
  const now = Date.now();

  for (let i = 0; i < 10; i++) {
    const home = teams[Math.floor(Math.random() * teams.length)];
    const away = teams[Math.floor(Math.random() * teams.length)];
    if (home.code === away.code) continue;

    matches.push({
      id: `past-${i}`,
      date: new Date(now - (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      homeTeam: home.code,
      awayTeam: away.code,
      homeTeamName: home.name,
      awayTeamName: away.name,
      homeScore: Math.floor(Math.random() * 30) + 95,
      awayScore: Math.floor(Math.random() * 30) + 95,
      status: 'completed',
    });
  }

  for (let i = 0; i < 10; i++) {
    const home = teams[Math.floor(Math.random() * teams.length)];
    const away = teams[Math.floor(Math.random() * teams.length)];
    if (home.code === away.code) continue;

    matches.push({
      id: `future-${i}`,
      date: new Date(now + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      homeTeam: home.code,
      awayTeam: away.code,
      homeTeamName: home.name,
      awayTeamName: away.name,
      homeScore: null,
      awayScore: null,
      status: 'upcoming',
    });
  }

  return matches;
}

export async function getNFLSchedule() { return []; }
export async function getMLBSchedule() { return []; }
export async function getNHLSchedule() { return []; }
export async function getSoccerSchedule() { return []; }
