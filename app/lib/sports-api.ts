// ============= NBA =============
export async function getNBASchedule() {
  try {
    const response = await fetch(
      'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json',
      { next: { revalidate: 300 } }
    );
    
    if (response.ok) {
      const data = await response.json();
      const games = data.scoreboard?.games || [];
      
      return games.map((game: any) => ({
        id: game.gameId,
        date: game.gameDateTimeUTC.split('T')[0],
        time: game.gameDateTimeUTC.split('T')[1].substring(0, 5),
        homeTeam: game.homeTeam.teamTricode,
        awayTeam: game.awayTeam.teamTricode,
        homeTeamName: game.homeTeam.teamName,
        awayTeamName: game.awayTeam.teamName,
        homeScore: game.homeTeam.score,
        awayScore: game.awayTeam.score,
        status: game.gameStatusText === 'Final' ? 'completed' : 'upcoming',
        sport: 'NBA'
      }));
    }
  } catch (error) {
    console.error('NBA API error:', error);
  }
  
  return getMockNBA();
}

// ============= NFL =============
export async function getNFLSchedule() {
  try {
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
      { next: { revalidate: 300 } }
    );
    
    if (response.ok) {
      const data = await response.json();
      const games = data.events || [];
      
      return games.map((event: any) => ({
        id: event.id,
        date: event.date.split('T')[0],
        time: event.date.split('T')[1].substring(0, 5),
        homeTeam: event.competitions[0].competitors[0].team.abbreviation,
        awayTeam: event.competitions[0].competitors[1].team.abbreviation,
        homeTeamName: event.competitions[0].competitors[0].team.displayName,
        awayTeamName: event.competitions[0].competitors[1].team.displayName,
        homeScore: parseInt(event.competitions[0].competitors[0].score) || null,
        awayScore: parseInt(event.competitions[0].competitors[1].score) || null,
        status: event.status.type.completed ? 'completed' : 'upcoming',
        sport: 'NFL'
      }));
    }
  } catch (error) {
    console.error('NFL API error:', error);
  }
  
  return getMockNFL();
}

// ============= NHL =============
export async function getNHLSchedule() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://api-web.nhle.com/v1/schedule/${today}`,
      { next: { revalidate: 300 } }
    );
    
    if (response.ok) {
      const data = await response.json();
      const games = data.gameWeek?.[0]?.games || [];
      
      return games.map((game: any) => ({
        id: game.id.toString(),
        date: game.startTimeUTC.split('T')[0],
        time: game.startTimeUTC.split('T')[1].substring(0, 5),
        homeTeam: game.homeTeam.abbrev,
        awayTeam: game.awayTeam.abbrev,
        homeTeamName: game.homeTeam.placeName.default,
        awayTeamName: game.awayTeam.placeName.default,
        homeScore: game.homeTeam.score || null,
        awayScore: game.awayTeam.score || null,
        status: game.gameState === 'OFF' ? 'completed' : 'upcoming',
        sport: 'NHL'
      }));
    }
  } catch (error) {
    console.error('NHL API error:', error);
  }
  
  return getMockNHL();
}

// ============= MLB =============
export async function getMLBSchedule() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}`,
      { next: { revalidate: 300 } }
    );
    
    if (response.ok) {
      const data = await response.json();
      const games = data.dates?.[0]?.games || [];
      
      return games.map((game: any) => ({
        id: game.gamePk.toString(),
        date: game.gameDate.split('T')[0],
        time: game.gameDate.split('T')[1].substring(0, 5),
        homeTeam: game.teams.home.team.abbreviation || game.teams.home.team.teamCode,
        awayTeam: game.teams.away.team.abbreviation || game.teams.away.team.teamCode,
        homeTeamName: game.teams.home.team.name,
        awayTeamName: game.teams.away.team.name,
        homeScore: game.teams.home.score || null,
        awayScore: game.teams.away.score || null,
        status: game.status.detailedState === 'Final' ? 'completed' : 'upcoming',
        sport: 'MLB'
      }));
    }
  } catch (error) {
    console.error('MLB API error:', error);
  }
  
  return getMockMLB();
}

// ============= SOCCER =============
export async function getSoccerSchedule() {
  return getMockSoccer();
}

// ============= MOCK DATA =============
function getMockNBA() {
  const teams = ['LAL', 'GSW', 'BOS', 'MIA', 'MIL', 'BKN', 'DEN', 'PHX', 'DAL', 'LAC'];
  return generateMockMatches(teams, 'NBA');
}

function getMockNFL() {
  const teams = ['KC', 'SF', 'BAL', 'BUF', 'PHI', 'DAL', 'MIA', 'DET', 'CIN', 'JAX'];
  return generateMockMatches(teams, 'NFL');
}

function getMockNHL() {
  const teams = ['TOR', 'BOS', 'TBL', 'FLA', 'NYR', 'CAR', 'COL', 'VGK', 'EDM', 'DAL'];
  return generateMockMatches(teams, 'NHL');
}

function getMockMLB() {
  const teams = ['LAD', 'NYY', 'HOU', 'ATL', 'TB', 'SD', 'TOR', 'SEA', 'PHI', 'STL'];
  return generateMockMatches(teams, 'MLB');
}

function getMockSoccer() {
  const teams = ['MCI', 'ARS', 'LIV', 'CHE', 'MUN', 'TOT', 'NEW', 'WHU', 'BHA', 'AVL'];
  return generateMockMatches(teams, 'SOCCER');
}

function generateMockMatches(teams: string[], sport: string) {
  const matches = [];
  const now = Date.now();
  
  for (let i = 0; i < 10; i++) {
    const home = teams[Math.floor(Math.random() * teams.length)];
    const away = teams[Math.floor(Math.random() * teams.length)];
    if (home === away) continue;
    
    matches.push({
      id: `${sport}-past-${i}`,
      date: new Date(now - (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:00',
      homeTeam: home,
      awayTeam: away,
      homeTeamName: home,
      awayTeamName: away,
      homeScore: Math.floor(Math.random() * 50) + 80,
      awayScore: Math.floor(Math.random() * 50) + 80,
      status: 'completed',
      sport
    });
  }
  
  for (let i = 0; i < 10; i++) {
    const home = teams[Math.floor(Math.random() * teams.length)];
    const away = teams[Math.floor(Math.random() * teams.length)];
    if (home === away) continue;
    
    matches.push({
      id: `${sport}-future-${i}`,
      date: new Date(now + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:00',
      homeTeam: home,
      awayTeam: away,
      homeTeamName: home,
      awayTeamName: away,
      homeScore: null,
      awayScore: null,
      status: 'upcoming',
      sport
    });
  }
  
  return matches;
}
