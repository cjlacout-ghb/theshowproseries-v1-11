"use server";

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { getRequestClient, verifyAdmin } from '@/lib/auth-utils';

export async function getAwards() {
    const { data, error } = await supabase
        .from('awards')
        .select('*')
        .order('id');

    if (error) {
        console.error("Error fetching awards:", error);
        return [];
    }
    console.log(`[getAwards] Fetched ${data.length} awards from DB`);
    data.forEach((a: any) => console.log(` - Found: "${a.title}" (${a.category})`));

    return data.map((a: any) => ({
        id: a.id,
        category: a.category,
        title: a.title,
        playerName: a.player_name,
        teamName: a.team_name,
        description: a.description
    }));
}

export async function saveAward(data: { id?: number, category: string, title: string, playerName: string, teamName: string, description: string, token?: string }) {
    const client = getRequestClient(data.token);
    await verifyAdmin(client, data.token);

    const awardData = {
        category: data.category,
        title: data.title,
        player_name: data.playerName,
        team_name: data.teamName,
        description: data.description,
        updated_at: new Date().toISOString()
    };

    let error;
    if (data.id) {
        ({ error } = await client.from('awards').update(awardData).eq('id', data.id));
    } else {
        ({ error } = await client.from('awards').insert(awardData));
    }

    if (error) {
        console.error("Error saving award:", error);
        throw new Error(error.message);
    }
    revalidatePath('/');
}

export async function importAwardsFromTxt(txtData: string, token?: string) {
    const client = getRequestClient(token);
    await verifyAdmin(client, token);

    // Normalize line endings and keys
    const lines = txtData
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    let currentCategory: 'ronda_inicial' | 'partido_final' = 'ronda_inicial';
    const awards: any[] = [];

    // Key Patterns
    const KEY_BATEADOR = "BATEADOR";
    const KEY_LANZADOR = "LANZADOR";
    const KEY_MVP = "MVP";
    const KEY_ALL_STAR = "ALL_THE_SHOW_TEAM"; // Matches user input
    const KEY_EQUIPO_IDEAL = "EQUIPO IDEAL";

    console.log(`[IMPORT] Starting Import of ${lines.length} lines.`);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const upperLine = line.toUpperCase();

        // 1. Context Switching (Sections that are NOT awards)
        if (upperLine.includes('PREMIOS_PARTIDO_FINAL') || upperLine.includes('JUEGO 16')) {
            currentCategory = 'partido_final';
            console.log(`[IMPORT] Context switched to: ${currentCategory}`);
            continue;
        }
        if (upperLine.includes('PREMIOS_RONDA_INICIAL')) {
            currentCategory = 'ronda_inicial';
            console.log(`[IMPORT] Context switched to: ${currentCategory}`);
            continue;
        }

        // 2. Identifying Awards
        let canonicalTitle = "";
        let isTeam = false;

        // Check for Team Award Trigger (matches exact keywords in line)
        if (upperLine.includes(KEY_ALL_STAR) || upperLine.includes(KEY_EQUIPO_IDEAL)) {
            canonicalTitle = "ALL THE SHOW TEAM";
            isTeam = true;
        }
        // Check for Individual Awards (Must start with PREMIO: to avoid false positives)
        else if (upperLine.startsWith('PREMIO:')) {
            if (upperLine.includes(KEY_BATEADOR)) canonicalTitle = "MEJOR BATEADOR DEL TORNEO";
            else if (upperLine.includes(KEY_LANZADOR)) canonicalTitle = "LANZADOR DESTACADO";
            else if (upperLine.includes(KEY_MVP)) canonicalTitle = "JUGADOR MVP";
        }

        // 3. Process Award if identified
        if (canonicalTitle) {
            console.log(`[IMPORT] Found Award Header: ${canonicalTitle} (Line: ${line})`);

            if (isTeam) {
                const players: string[] = [];
                let j = i + 1;
                while (j < lines.length) {
                    const nextLine = lines[j];
                    const nextUpper = nextLine.toUpperCase();

                    // Stop conditions: Next Section or Next Award Header
                    if (nextUpper.startsWith('SECTION:') || nextUpper.startsWith('PREMIO:')) {
                        break;
                    }

                    // Filter noise
                    if (!nextUpper.startsWith('//') && nextUpper.length > 2) {
                        players.push(nextLine);
                    }
                    j++;
                }

                if (players.length > 0) {
                    awards.push({
                        category: currentCategory,
                        title: canonicalTitle,
                        player_name: "EQUIPO IDEAL",
                        team_name: "SELECCIÓN DEL TORNEO",
                        description: players.join('\n'),
                        updated_at: new Date().toISOString()
                    });
                    console.log(`[IMPORT] Captured ${players.length} players for Team Award.`);
                    i = j - 1; // Advance main loop
                } else {
                    console.warn(`[IMPORT] Team award header found but no players captured.`);
                }
            }
            else {
                // Individual Award Parsing
                let playerName = "";
                let teamName = "";
                let description = "";

                let j = i + 1;
                while (j < lines.length) {
                    const nextLine = lines[j];
                    const nextUpper = nextLine.toUpperCase();

                    if (nextUpper.startsWith('SECTION:') || nextUpper.startsWith('PREMIO:')) {
                        break;
                    }

                    if (nextUpper.startsWith('GANADOR:')) playerName = nextLine.substring(8).trim();
                    else if (nextUpper.startsWith('EQUIPO:')) teamName = nextLine.substring(7).trim();
                    else if (nextUpper.startsWith('ESTADÍSTICAS:')) description = nextLine.substring(13).trim();

                    j++;
                }

                awards.push({
                    category: currentCategory,
                    title: canonicalTitle,
                    player_name: playerName || "Por Determinar",
                    team_name: teamName || "N/A",
                    description: description || "Sin descripción",
                    updated_at: new Date().toISOString()
                });
                console.log(`[IMPORT] Captured Individual Award: ${canonicalTitle} -> ${playerName}`);
                i = j - 1;
            }
        }
    }

    // Deduplicate logic
    const uniqueAwards = Array.from(new Map(awards.map(item => [item.category + item.title, item])).values());

    console.log(`[IMPORT] Saving ${uniqueAwards.length} unique awards...`);

    for (const award of uniqueAwards) {
        const { error } = await client.from('awards').upsert(award, { onConflict: 'category,title' });
        if (error) {
            console.error(`[IMPORT DB ERROR] ${award.title}:`, error.message);
            throw new Error(`Error database: ${error.message}`);
        } else {
            console.log(`[IMPORT SUCCESS] Saved ${award.title}`);
        }
    }

    revalidatePath('/');
}

export async function clearAwards(token?: string) {
    const client = getRequestClient(token);
    await verifyAdmin(client, token);

    const { error } = await client.from('awards').delete().neq('id', 0); // Delete all rows

    if (error) {
        console.error("Error clearing awards:", error);
        throw new Error(error.message);
    }

    revalidatePath('/');
}
