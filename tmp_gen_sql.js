
const fs = require('fs');

const players = JSON.parse(fs.readFileSync('players_list.json', 'utf8'));

const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/,/g, "").trim();

const findPlayerId = (name) => {
  const targetParts = normalize(name).split(' ').filter(p => p.length > 2);
  const match = players.find(p => {
    const dbParts = normalize(p.name).split(' ').filter(p => p.length > 2);
    // Intersection of name parts
    const intersection = targetParts.filter(part => dbParts.includes(part));
    return intersection.length >= 2 || (targetParts.length === 1 && intersection.length === 1);
  });
  if (match) return match.id;
  return null;
};

const data = JSON.parse(fs.readFileSync('parsed_game_11.json', 'utf8'));

let sql = `-- SQL Import for Game 11\n\n`;

// 1. Update Game Scoreboard
const inningsJson = JSON.stringify(data.visitorInnings.map((v, i) => [v, data.localInnings[i] || ""]));
sql += `UPDATE games SET 
  score1 = ${data.visitorRHE.r}, 
  hits1 = ${data.visitorRHE.h}, 
  errors1 = ${data.visitorRHE.e},
  score2 = ${data.localRHE.r}, 
  hits2 = ${data.localRHE.h}, 
  errors2 = ${data.localRHE.e},
  innings = '${inningsJson}'::jsonb
WHERE id = 11;\n\n`;

// 2. Batting Stats
const allBatters = [...data.visitorBatters, ...data.localBatters];
for (const b of allBatters) {
  const pid = findPlayerId(b.name);
  if (pid) {
    const statsObj = {
      plateAppearances: b.pa,
      atBats: b.ab,
      runs: b.r,
      hits: b.h,
      doubles: b.doubles,
      triples: b.triples,
      homeRuns: b.hr,
      rbi: b.rbi,
      walks: b.bb,
      hitByPitch: b.hbp,
      sacHits: b.sh,
      sacFlies: b.sf,
      strikeOuts: b.so,
      stolenBases: b.sb
    };
    sql += `INSERT INTO batting_stats (player_id, game_id, stats) 
VALUES (${pid}, 11, '${JSON.stringify(statsObj)}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();\n`;
  } else {
    sql += `-- WARNING: Player not found: ${b.name}\n`;
  }
}

sql += `\n`;

// 3. Pitching Stats
const allPitchers = [...data.visitorPitchers, ...data.localPitchers];
for (const p of allPitchers) {
  const pid = findPlayerId(p.name);
  if (pid) {
    const statsObj = {
      inningsPitched: p.ip,
      hits: p.h,
      runs: p.r,
      earnedRuns: p.er,
      walks: p.bb,
      strikeOuts: p.so,
      homeRuns: p.hr,
      wins: p.w,
      losses: p.l,
      saves: p.s
    };
    sql += `INSERT INTO pitching_stats (player_id, game_id, stats) 
VALUES (${pid}, 11, '${JSON.stringify(statsObj)}'::jsonb)
ON CONFLICT (player_id, game_id) DO UPDATE SET stats = EXCLUDED.stats, updated_at = now();\n`;
  } else {
    sql += `-- WARNING: Player not found: ${p.name}\n`;
  }
}

fs.writeFileSync('import_game_11.sql', sql);
console.log('SQL generated: import_game_11.sql');
