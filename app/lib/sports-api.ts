export async function getNBASchedule() {
  const matches: any[] = [];
  
  try {
    // Récupérer matchs des 7 derniers jours + 7 prochains jours
    for (let i = -7; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateStr}`,
        { next: { revalidate: 300 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        const events = data.events || [];
        
        events.forEach((event: any) => {
          const competition = event.competitions[0];
          const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
          const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');
          
          matches.push({
            id: event.id,
            date: event.date.split('T')[0],
            time: event.date.split('T')[1].substring(0, 5),
            homeTeam: homeTeam.team.abbreviation,
            awayTeam: awayTeam.team.abbreviation,
            homeTeamName: homeTeam.team.displayName,
            awayTeamName: awayTeam.team.displayName,
            homeScore: parseInt(homeTeam.score) || null,
            awayScore: parseInt(awayTeam.score) || null,
            status: event.status.type.completed ? 'completed' : 'upcoming',
            sport: 'NBA'
          });
        });
      }
    }
    
    if (matches.length > 0) {
      return matches;
    }
    
  } catch (error) {
    console.error('ESPN API error:', error);
  }
  
  // Fallback sur mock data si API échoue
  return getMockNBA();
}

function getMockNBA() {
  const teams = ['LAL', 'GSW', 'BOS', 'MIA', 'MIL', 'BKN', 'DEN', 'PHX', 'DAL', 'LAC'];
  const matches = [];
  const now = Date.now();
  
  for (let i = 0; i < 10; i++) {
    const home = teams[Math.floor(Math.random() * teams.length)];
    const away = teams[Math.floor(Math.random() * teams.length)];
    if (home === away) continue;
    
    matches.push({
      id: `past-${i}`,
      date: new Date(now - (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:00',
      homeTeam: home,
      awayTeam: away,
      homeTeamName: home,
      awayTeamName: away,
      homeScore: Math.floor(Math.random() * 30) + 95,
      awayScore: Math.floor(Math.random() * 30) + 95,
      status: 'completed',
      sport: 'NBA'
    });
  }
  
  for (let i = 0; i < 10; i++) {
    const home = teams[Math.floor(Math.random() * teams.length)];
    const away = teams[Math.floor(Math.random() * teams.length)];
    if (home === away) continue;
    
    matches.push({
      id: `future-${i}`,
      date: new Date(now + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:00',
      homeTeam: home,
      awayTeam: away,
      homeTeamName: home,
      awayTeamName: away,
      homeScore: null,
      awayScore: null,
      status: 'upcoming',
      sport: 'NBA'
    });
  }
  
  return matches;
}

export async function getNFLSchedule() { return []; }
export async function getMLBSchedule() { return []; }
export async function getNHLSchedule() { return []; }
export async function getSoccerSchedule() { return []; }
