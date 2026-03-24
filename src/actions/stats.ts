"use server";

import { supabase } from '@/lib/supabase'
import { getRequestClient, verifyAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

function mapToSnakeCase(obj: any) {
    const result: any = {};
    if (!obj) return result;
    for (const key in obj) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[snakeKey] = obj[key];
    }
    return result;
}

export async function saveBattingStat(data: { playerId: number, gameId: number, stats: any, token?: string }) {
    console.log(`[ACTION] Saving batting stats for player ${data.playerId} in game ${data.gameId}`);
    const client = getRequestClient(data.token);
    await verifyAdmin(client, data.token);

    // Map camelCase keys to snake_case for DB
    const mappedStats = mapToSnakeCase(data.stats);

    const { error } = await client
        .from('batting_stats')
        .upsert({
            player_id: data.playerId,
            game_id: data.gameId,
            ...mappedStats,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'player_id,game_id'
        });

    if (error) {
        console.error('Error saving batting stat:', error);
        throw new Error(`Error en base de datos: ${error.message}`);
    }
    revalidatePath('/');
}

export async function savePitchingStat(data: { playerId: number, gameId: number, stats: any, token?: string }) {
    console.log(`[ACTION] Saving pitching stats for player ${data.playerId} in game ${data.gameId}`);
    const client = getRequestClient(data.token);
    await verifyAdmin(client, data.token);

    // Map camelCase keys to snake_case for DB
    const mappedStats = mapToSnakeCase(data.stats);

    const { error } = await client
        .from('pitching_stats')
        .upsert({
            player_id: data.playerId,
            game_id: data.gameId,
            ...mappedStats,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'player_id,game_id'
        });

    if (error) {
        console.error('Error saving pitching stat:', error);
        throw new Error(`Error en base de datos: ${error.message}`);
    }
    revalidatePath('/');
}

export async function getAllStats() {
    const { data: bStats, error: bError } = await supabase
        .from('batting_stats')
        .select(`
            *,
            player:players (
                *,
                team:teams (*)
            )
        `)

    const { data: pStats, error: pError } = await supabase
        .from('pitching_stats')
        .select(`
            *,
            player:players (
                *,
                team:teams (*)
            )
        `)

    if (bError || pError) console.error('Error fetching all stats:', bError || pError)

    // Map structure to match frontend expectations
    const mapStat = (stat: any) => ({
        ...stat,
        playerId: stat.player_id,
        gameId: stat.game_id,
        player: {
            ...stat.player,
            placeOfBirth: stat.player.place_of_birth,
            team: stat.player.team
        }
    })

    return {
        battingStats: (bStats || []).map(mapStat),
        pitchingStats: (pStats || []).map(mapStat)
    };
}
