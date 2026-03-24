"use server";

import { supabase } from '@/lib/supabase'
import { getRequestClient, verifyAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import type { DBTeam, DBGame } from '@/lib/types'

export async function getTeams() {
    const { data: teams, error } = await supabase
        .from('teams')
        .select(`
            *,
            players (*)
        `)
        .order('name')

    if (error) {
        console.error('Error fetching teams:', error)
        return []
    }

    // Map snake_case to camelCase for the UI
    return (teams as DBTeam[]).map(team => ({
        ...team,
        players: team.players.map((p: any) => ({
            ...p,
            placeOfBirth: p.place_of_birth
        }))
    }))
}

export async function getGames() {
    // Fetch games first
    const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .order('id')

    if (gamesError) {
        console.error('Error fetching games:', gamesError)
        return []
    }

    // Fetch all batting stats
    const { data: battingStats, error: bError } = await supabase
        .from('batting_stats')
        .select('*')

    if (bError) {
        console.error('Error fetching batting_stats:', bError)
    }

    // Fetch all pitching stats
    const { data: pitchingStats, error: pError } = await supabase
        .from('pitching_stats')
        .select('*')

    if (pError) {
        console.error('Error fetching pitching_stats:', pError)
    }

    console.log(`[getGames] Fetched ${games?.length} games, ${battingStats?.length || 0} batting stats, ${pitchingStats?.length || 0} pitching stats`);

    // Helper to flatten stats from JSONB column
    const flattenStat = (dbRow: any) => {
        if (!dbRow) return null;
        // The stats are stored in a JSONB 'stats' column
        const statsData = dbRow.stats || {};
        return {
            playerId: dbRow.player_id,
            gameId: dbRow.game_id,
            ...statsData
        };
    };

    // Map stats to games
    return (games as DBGame[]).map(game => {
        const gameBattingStats = (battingStats || [])
            .filter((s: any) => s.game_id === game.id)
            .map(flattenStat)
            .filter(Boolean);
        const gamePitchingStats = (pitchingStats || [])
            .filter((s: any) => s.game_id === game.id)
            .map(flattenStat)
            .filter(Boolean);

        return {
            ...game,
            team1Id: String(game.team1_id),
            team2Id: String(game.team2_id),
            score1: game.score1?.toString() ?? "",
            score2: game.score2?.toString() ?? "",
            hits1: game.hits1?.toString() ?? "",
            hits2: game.hits2?.toString() ?? "",
            errors1: game.errors1?.toString() ?? "",
            errors2: game.errors2?.toString() ?? "",
            innings: game.innings || [],
            battingStats: gameBattingStats,
            pitchingStats: gamePitchingStats,
            isChampionship: game.id === 16
        };
    })
}

export async function updateGame(gameId: number, data: any, token?: string) {
    console.log(`[ACTION] Updating game ${gameId}`);
    const client = getRequestClient(token);
    await verifyAdmin(client, token);
    const updateData: any = {}

    // Helper to safely parse numbers and handle empty strings/NaN
    const safeNum = (v: any) => {
        if (v === "" || v === null || v === undefined) return null;
        const n = parseInt(v);
        return isNaN(n) ? null : n;
    }

    if (data.score1 !== undefined) updateData.score1 = safeNum(data.score1)
    if (data.score2 !== undefined) updateData.score2 = safeNum(data.score2)
    if (data.hits1 !== undefined) updateData.hits1 = safeNum(data.hits1)
    if (data.hits2 !== undefined) updateData.hits2 = safeNum(data.hits2)
    if (data.errors1 !== undefined) updateData.errors1 = safeNum(data.errors1)
    if (data.errors2 !== undefined) updateData.errors2 = safeNum(data.errors2)
    if (data.innings !== undefined) updateData.innings = data.innings

    if (data.team1Id !== undefined) updateData.team1_id = safeNum(data.team1Id)
    if (data.team2Id !== undefined) updateData.team2_id = safeNum(data.team2Id)

    const { error } = await client
        .from('games')
        .update(updateData)
        .eq('id', gameId)

    if (error) {
        console.error('Error updating game:', error)
        throw new Error(`Error al actualizar partido: ${error.message}`);
    }
    revalidatePath('/')
}
