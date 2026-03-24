
import { createClient } from '@supabase/supabase-js'
import { parseGameStats } from '../src/lib/stats-parser'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqfcfqflodpewdssicak.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2par32BiPa4FahajE_7vog_XbZ46--K';
const supabase = createClient(supabaseUrl, supabaseKey);

const boxScoreText = `
GAME_ID: 11
VISITOR: ACCIN VORTEX
LOCAL: CACIQUES BY SWING

SECTION: SCOREBOARD
VISITOR_INNINGS: 0, 0, 0, 0, 0, 5, 2
VISITOR_RHE: 7, 10, 0
LOCAL_INNINGS: 1, 0, 0, 0, 0, 0, 0
LOCAL_RHE: 1, 6, 2

SECTION: VISITOR_BATTING
// # (Número), Nombre, PA, AB, R, H, 2B, 3B, HR, RBI, BB, SO, SB
24, Malarczuk Ladislao, 4, 2, 1, 1, 0, 0, 0, 0, 1, 1, 0
21, Ferrara Nahuel, 3, 3, 1, 1, 0, 0, 0, 1, 0, 1, 1
43, Muñoz Alejo, 4, 3, 1, 2, 1, 0, 0, 1, 1, 0, 1
52, Godoy Manuel, 4, 3, 0, 1, 0, 0, 0, 2, 1, 1, 0
5, Siviero Fausto, 4, 3, 1, 0, 0, 0, 0, 0, 1, 2, 0
27, Torrejon Luis, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0
12, Guape Junior, 4, 4, 2, 3, 1, 1, 0, 0, 0, 0, 0
10, Ortellado Franco, 4, 4, 1, 1, 0, 0, 0, 1, 0, 1, 1
59, Garcia Lautaro, 3, 2, 0, 1, 0, 0, 0, 0, 1, 0, 1
49, Muñoz Felipe, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0
23, Olheiser Federico, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0
88, Prieto Adolfo, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0

SECTION: LOCAL_BATTING
// # (Número), Nombre, PA, AB, R, H, 2B, 3B, HR, RBI, BB, SO, SB
72, Fernandez Julian, 3, 3, 1, 2, 0, 0, 0, 0, 0, 0, 0
8, Boyer Domingo, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0
18, Garolini Juan, 4, 3, 0, 1, 0, 0, 0, 1, 1, 2, 0
6, Saulo España, 3, 3, 0, 1, 0, 0, 0, 0, 0, 1, 0
13, Matute Jorge, 3, 3, 0, 0, 0, 0, 0, 0, 0, 2, 0
14, Ramirez Diego, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0
5, Macias Dermar, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
87, Lozada Miguel, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
27, Rafael Borges, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0
7, Villavicencio Gabriel, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
21, Bambozzi Juan Cruz, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0
3, Kiukukawa Tomoki, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
17, Diego Ramirez, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0

SECTION: VISITOR_PITCHING
// # (Número), Nombre, IP, H, R, ER, BB, SO, HR, W, L, S
36, Leonardo Bress, 2.00, 3, 1, 1, 0, 0, 0, 0, 0, 0
8, Segura Jorge, 2.33, 2, 0, 0, 1, 3, 0, 1, 0, 0
1, Morales Juan, 2.67, 1, 0, 0, 0, 4, 0, 0, 0, 1

SECTION: LOCAL_PITCHING
// # (Número), Nombre, IP, H, R, ER, BB, SO, HR, W, L, S
10, Chaparro Erick, 6.00, 7, 5, 2, 5, 8, 0, 0, 1, 0
1, Mata Valentin, 1.00, 3, 2, 2, 0, 3, 0, 0, 0, 0
`;

async function importGame11() {
    console.log('--- STARTING IMPORT OF GAME 11 ---');
    const gameId = 11;
    const parsedData = parseGameStats(boxScoreText);

    // 1. Fetch current game info
    const { data: game, error: gameError } = await supabase
        .from('games')
        .select('team1_id, team2_id')
        .eq('id', gameId)
        .single();

    if (gameError || !game) {
        console.error("No se encontró el juego.");
        return;
    }

    const team1Id = game.team1_id;
    const team2Id = game.team2_id;

    if (!team1Id || !team2Id) {
        console.error("El juego no tiene equipos asignados todavía.");
        return;
    }

    // 2. Fetch all players
    const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name, number, team_id')
        .in('team_id', [team1Id, team2Id]);

    if (playersError) {
        console.error("Error obteniendo jugadores:", playersError);
        return;
    }

    const findPlayer = (name: string, number: number, teamId: number) => {
        const exactMatch = players?.find(p => p.team_id === teamId && p.number === number);
        if (exactMatch) return exactMatch;

        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/,/g, "");
        const targetName = normalize(name);

        return players?.find(p => p.team_id === teamId && normalize(p.name) === targetName);
    };

    // Helper to process batter list
    const processBatters = async (batters: any[], teamId: number) => {
        for (const b of batters) {
            const player = findPlayer(b.name, b.number, teamId);
            if (player) {
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
                const { error } = await supabase.from('batting_stats').upsert({
                    player_id: player.id,
                    game_id: gameId,
                    stats: statsObj,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'player_id,game_id' });
                if (error) console.error(`Failed batter ${player.id}:`, error);
            } else {
                console.warn(`[WARN] Batter not found: #${b.number} ${b.name} (Team ${teamId})`);
            }
        }
    };

    // Helper to process pitcher list
    const processPitchers = async (pitchers: any[], teamId: number) => {
        for (const p of pitchers) {
            const player = findPlayer(p.name, p.number, teamId);
            if (player) {
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
                const { error } = await supabase.from('pitching_stats').upsert({
                    player_id: player.id,
                    game_id: gameId,
                    stats: statsObj,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'player_id,game_id' });
                if (error) console.error(`Failed pitcher ${player.id}:`, error);
            } else {
                console.warn(`[WARN] Pitcher not found: #${p.number} ${p.name} (Team ${teamId})`);
            }
        }
    }

    // 3. Update Game Scoreboard
    const inningsArray: string[][] = [];
    const maxInnings = Math.max(parsedData.visitorInnings.length, parsedData.localInnings.length);
    for (let i = 0; i < maxInnings; i++) {
        inningsArray.push([
            parsedData.visitorInnings[i] || "",
            parsedData.localInnings[i] || ""
        ]);
    }

    await supabase.from('games').update({
        score1: parsedData.visitorRHE.r,
        hits1: parsedData.visitorRHE.h,
        errors1: parsedData.visitorRHE.e,
        score2: parsedData.localRHE.r,
        hits2: parsedData.localRHE.h,
        errors2: parsedData.localRHE.e,
        innings: inningsArray
    }).eq('id', gameId);

    // 4. Process Player Stats
    await processBatters(parsedData.visitorBatters, team1Id);
    await processBatters(parsedData.localBatters, team2Id);
    await processPitchers(parsedData.visitorPitchers, team1Id);
    await processPitchers(parsedData.localPitchers, team2Id);

    console.log('--- IMPORT COMPLETED ---');
}

importGame11();
