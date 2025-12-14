export async function getNBASchedule() {
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

  // 20 matchs passés
  for (let i = 0; i < 20; i++) {
    const home = teams[Math.floor(Math.random() * teams.length)];
    const away = teams[Math.floor(Math.random() * teams.length)];
    if (home.code === away.code) continue;

    matches.push({
      id: `match-past-${i}`,
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

  // 20 matchs futurs
  for (let i = 0; i < 20; i++) {
    const home = teams[Math.floor(Math.random() * teams.length)];
    const away = teams[Math.floor(Math.random() * teams.length)];
    if (home.code === away.code) continue;

    matches.push({
      id: `match-future-${i}`,
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

export async function getNFLSchedule() {
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
