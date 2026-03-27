"use server";

import { getRequestClient, verifyAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { parseGameStats } from '@/lib/stats-parser'

export async function importPlayers(teamId: number, csvData: string, token?: string, replace: boolean = false) {
    const client = getRequestClient(token);
    await verifyAdmin(client, token);
    const lines = csvData.trim().split('\n');
    const playersToInsert: any[] = [];


    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.includes('UNIFORME N') || trimmedLine.toUpperCase().startsWith('TEAM')) continue;

        let parts = trimmedLine.split(',').map(p => p.trim());
        if (parts.length < 3) parts = trimmedLine.split('\t').map(p => p.trim());

        if (parts.length >= 2) {
            const number = parseInt(parts[0]) || 0;
            let fullName = "";
            let role = "UNKNOWN";
            let placeOfBirth = "UNKNOWN";

            if (parts.length >= 3) {
                const lastName = parts[1] || "";
                const firstName = parts[2] || "";
                fullName = `${firstName} ${lastName}`.trim();
                if (parts.length > 3) role = parts[3];
                if (parts.length > 4) placeOfBirth = parts[4];
            } else {
                fullName = parts[1];
            }

            playersToInsert.push({
                id: Math.floor(Math.random() * 100000000), // Larger random ID to avoid collisions
                team_id: teamId,
                number: number,
                name: fullName,
                role: role,
                place_of_birth: placeOfBirth
            });
        }
    }

    if (replace && teamId) {
        const { error: deleteError } = await client
            .from('players')
            .delete()
            .eq('team_id', teamId);

        if (deleteError) {
            console.error('Error deleting old roster:', deleteError);
            return { success: false, error: "Error al borrar roster anterior: " + deleteError.message };
        }
    }

    if (playersToInsert.length > 0) {
        const { error, count } = await client.from('players').insert(playersToInsert)
        if (error) {
            console.error('Error importing players:', error)
            return { success: false, error: error.message }
        }
        revalidatePath('/');
        return { success: true, count: playersToInsert.length };
    }

    return { success: true, count: 0 };
}

export async function updatePlayer(playerId: number, data: { number?: number, name?: string, role?: string, placeOfBirth?: string }, token?: string) {
    const client = getRequestClient(token);
    await verifyAdmin(client, token);
    const updateData: any = { ...data }
    if (data.placeOfBirth) {
        updateData.place_of_birth = data.placeOfBirth
        delete updateData.placeOfBirth
    }

    const { error } = await client
        .from('players')
        .update(updateData)
        .eq('id', playerId)

    if (error) {
        console.error('Error updating player:', error)
        return { success: false }
    }
    revalidatePath('/');
    return { success: true };
}

export async function resetTournamentScores(token?: string) {
    try {
        const client = getRequestClient(token);
        await verifyAdmin(client, token);

        // 1. Delete all batting stats
        const { error: bError, count: bCount } = await client
            .from('batting_stats')
            .delete({ count: 'exact' })
            .gte('player_id', 0);

        if (bError) {
            console.error('Error clearing batting stats:', bError);
            throw new Error(`Error en batting_stats: ${bError.message}`);
        }

        // 2. Delete all pitching stats
        const { error: pError, count: pCount } = await client
            .from('pitching_stats')
            .delete({ count: 'exact' })
            .gte('player_id', 0);

        if (pError) {
            console.error('Error clearing pitching stats:', pError);
            throw new Error(`Error en pitching_stats: ${pError.message}`);
        }

        // 3. Reset all games scores, innings, hits, and errors
        const { data: updatedGames, error: error1 } = await client
            .from('games')
            .update({
                score1: null,
                score2: null,
                hits1: null,
                hits2: null,
                errors1: null,
                errors2: null,
                innings: []
            })
            .gte('id', 0)
            .select();

        if (error1) {
            console.error('Error resetting games:', error1);
            throw new Error(`Error al resetear juegos: ${error1.message}`);
        }

        if (!updatedGames || updatedGames.length === 0) {
            console.warn('Warning: No games were updated during reset. This might indicate an RLS policy issue.');
            throw new Error('No se pudieron actualizar los juegos. Verifique los permisos RLS en Supabase.');
        }

        console.log(`Updated ${updatedGames.length} games.`);

        // 4. Specifically reset team assignments for the championship game (ID 16)
        const { error: error2 } = await client
            .from('games')
            .update({
                team1_id: null,
                team2_id: null
            })
            .eq('id', 16);

        if (error2) {
            console.error('Error resetting championship game teams:', error2);
            throw new Error(`Error en juego 16: ${error2.message}`);
        }

        revalidatePath('/');
        return { success: true };
    } catch (err: any) {
        console.error('Reset action failed:', err);
        return { success: false, error: err.message || 'Error desconocido al reiniciar el torneo' };
    }
}

export async function resetGameData(gameId: number, token?: string) {
    try {
        const client = getRequestClient(token);
        await verifyAdmin(client, token);

        // 1. Delete batting stats for this game
        const { error: bError } = await client
            .from('batting_stats')
            .delete()
            .eq('game_id', gameId);

        if (bError) {
            console.error(`Error clearing batting stats for game ${gameId}:`, bError);
            throw new Error(`Error en batting_stats: ${bError.message}`);
        }

        // 2. Delete pitching stats for this game
        const { error: pError } = await client
            .from('pitching_stats')
            .delete()
            .eq('game_id', gameId);

        if (pError) {
            console.error(`Error clearing pitching stats for game ${gameId}:`, pError);
            throw new Error(`Error en pitching_stats: ${pError.message}`);
        }

        // 3. Reset game results
        const { error: gError } = await client
            .from('games')
            .update({
                score1: null,
                score2: null,
                hits1: null,
                hits2: null,
                errors1: null,
                errors2: null,
                innings: []
            })
            .eq('id', gameId);

        if (gError) {
            console.error(`Error resetting results for game ${gameId}:`, gError);
            throw new Error(`Error al resetear juego: ${gError.message}`);
        }

        revalidatePath('/');
        return { success: true };
    } catch (err: any) {
        console.error(`Reset action failed for game ${gameId}:`, err);
        return { success: false, error: err.message || 'Error desconocido al reiniciar el juego' };
    }
}

export async function importGameStatsFromTxt(gameId: number, txtData: string, token?: string) {
    console.log(`[ACTION] Importing stats for game ${gameId}`);
    const client = getRequestClient(token);
    await verifyAdmin(client, token);

    const parsedData = parseGameStats(txtData);

    // Verify game ID matches
    if (parsedData.gameId && parsedData.gameId !== gameId) {
        throw new Error(`El archivo contiene datos para el Juego ${parsedData.gameId}, pero estás intentando importar en el Juego ${gameId}.`);
    }

    // 1. Fetch current game info to know teams
    const { data: game, error: gameError } = await client
        .from('games')
        .select('team1_id, team2_id')
        .eq('id', gameId)
        .single();

    if (gameError || !game) throw new Error("No se encontró el juego.");

    // Assumption: Team 1 is Visitor, Team 2 is Local.
    const team1Id = game.team1_id;
    const team2Id = game.team2_id;

    if (!team1Id || !team2Id) throw new Error("El juego no tiene equipos asignados todavía.");

    // 2. Fetch all players for these teams to match names efficiently
    const { data: players, error: playersError } = await client
        .from('players')
        .select('id, name, number, team_id')
        .in('team_id', [team1Id, team2Id]);

    if (playersError) throw new Error("Error obteniendo jugadores.");

    const findPlayer = (name: string, number: number, teamId: number) => {
        // First try finding by Number + Team (Closest match)
        const exactMatch = players?.find(p => p.team_id === teamId && p.number === number);
        if (exactMatch) return exactMatch;

        // Fallback: finding by Name in that team (using a loose match)
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/,/g, "").trim();
        const targetParts = normalize(name).split(' ').filter(p => p.length > 2); // ignora iniciales o preposiciones de 1 o 2 letras
        
        const nameMatch = players?.find(p => {
            if (p.team_id !== teamId) return false;
            const dbParts = normalize(p.name).split(' ').filter(p => p.length > 2);
            // Intersection of name parts
            const intersection = targetParts.filter(part => dbParts.includes(part));
            // Consider match if at least 2 parts match (e.g. FirstName LastName) or if both only have 1 significant word matching
            return intersection.length >= 2 || (targetParts.length === 1 && intersection.length === 1);
        });

        return nameMatch;
    };

    // Helper to process batter list
    const processBatters = async (batters: any[], teamId: number) => {
        let successCount = 0;
        for (const b of batters) {
            const player = findPlayer(b.name, b.number, teamId);
            if (player) {
                console.log(`[IMPORT] Matched batter #${b.number} "${b.name}" to player ID ${player.id} (${player.name})`);
                // Database uses a JSONB 'stats' column, not individual columns
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
                const { error } = await client.from('batting_stats').upsert({
                    player_id: player.id,
                    game_id: gameId,
                    stats: statsObj,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'player_id,game_id' });
                if (error) {
                    console.error(`[IMPORT ERROR] Failed to upsert batter ${player.id}:`, error);
                } else {
                    successCount++;
                }
            } else {
                console.warn(`[WARN] Batter not found: #${b.number} ${b.name} (Team ${teamId})`);
            }
        }
        console.log(`[IMPORT] Processed ${successCount}/${batters.length} batters for team ${teamId}`);
    };

    // Helper to process pitcher list
    const processPitchers = async (pitchers: any[], teamId: number) => {
        let successCount = 0;
        for (const p of pitchers) {
            const player = findPlayer(p.name, p.number, teamId);
            if (player) {
                console.log(`[IMPORT] Matched pitcher #${p.number} "${p.name}" to player ID ${player.id} (${player.name})`);
                // Database uses a JSONB 'stats' column, not individual columns
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
                const { error } = await client.from('pitching_stats').upsert({
                    player_id: player.id,
                    game_id: gameId,
                    stats: statsObj,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'player_id,game_id' });
                if (error) {
                    console.error(`[IMPORT ERROR] Failed to upsert pitcher ${player.id}:`, error);
                } else {
                    successCount++;
                }
            } else {
                console.warn(`[WARN] Pitcher not found: #${p.number} ${p.name} (Team ${teamId})`);
            }
        }
        console.log(`[IMPORT] Processed ${successCount}/${pitchers.length} pitchers for team ${teamId}`);
    }

    // 3. Update Game Scoreboard (Innings, R, H, E)
    // Construct innings array: zip visitor and local innings
    // The format in DB is [[rVis, rLoc], [rVis, rLoc], ...]
    const inningsArray: string[][] = [];
    const maxInnings = Math.max(parsedData.visitorInnings.length, parsedData.localInnings.length);
    for (let i = 0; i < maxInnings; i++) {
        inningsArray.push([
            parsedData.visitorInnings[i] || "",
            parsedData.localInnings[i] || ""
        ]);
    }

    await client.from('games').update({
        score1: parsedData.visitorRHE.r,
        hits1: parsedData.visitorRHE.h,
        errors1: parsedData.visitorRHE.e,
        score2: parsedData.localRHE.r,
        hits2: parsedData.localRHE.h,
        errors2: parsedData.localRHE.e,
        innings: inningsArray
    }).eq('id', gameId);

    // 4. Process Player Stats
    // Visitor = team1, Local = team2 (By convention in schedule-card)
    await processBatters(parsedData.visitorBatters, team1Id);
    await processBatters(parsedData.localBatters, team2Id);

    await processPitchers(parsedData.visitorPitchers, team1Id);
    await processPitchers(parsedData.localPitchers, team2Id);

    revalidatePath('/');
    return {
        success: true,
        updatedGame: {
            score1: String(parsedData.visitorRHE.r ?? ""),
            hits1: String(parsedData.visitorRHE.h ?? ""),
            errors1: String(parsedData.visitorRHE.e ?? ""),
            score2: String(parsedData.localRHE.r ?? ""),
            hits2: String(parsedData.localRHE.h ?? ""),
            errors2: String(parsedData.localRHE.e ?? ""),
            innings: inningsArray,
        }
    };
}
