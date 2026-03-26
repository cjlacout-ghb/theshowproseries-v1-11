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
        
        // Helper to determine if a line is a pipe-separated award header
        const isPipeCategoryHeader = (text: string) => {
            if (!text.includes('|')) return false;
            const cat = text.split('|')[0].trim().toUpperCase();
            return cat.includes('RONDA_INICIAL') || cat.includes('PARTIDO_FINAL') || cat.includes('JUEGO 16');
        };

        // --- NEW PIPE-SEPARATED FORMAT SUPPORT ---
        // Format: CATEGORIA | TITULO | JUGADOR | EQUIPO | DESC
        if (isPipeCategoryHeader(line)) {
            const parts = line.split('|').map(p => p.trim());
            const categoryRaw = parts[0].toUpperCase();
            const titleRaw = parts[1].toUpperCase();

            // Map category
            let category: 'ronda_inicial' | 'partido_final' = 'ronda_inicial';
            if (categoryRaw.includes('FINAL') || categoryRaw.includes('JUEGO 16')) {
                category = 'partido_final';
            }

            // Map title to canonical version
            let canonicalTitle = parts[1];
            if (titleRaw.includes(KEY_BATEADOR)) canonicalTitle = "MEJOR BATEADOR DEL TORNEO";
            else if (titleRaw.includes(KEY_LANZADOR)) canonicalTitle = "LANZADOR DESTACADO";
            else if (titleRaw.includes(KEY_MVP)) canonicalTitle = "JUGADOR MVP";
            else if (titleRaw.includes(KEY_ALL_STAR) || titleRaw.includes(KEY_EQUIPO_IDEAL)) canonicalTitle = "ALL THE SHOW TEAM";

            let descriptionVal = parts[4] || "";

            // If it's a team award, we might have multiple lines below
            if (canonicalTitle === "ALL THE SHOW TEAM") {
                 const players: string[] = [];
                 if (descriptionVal) players.push(descriptionVal);
                 
                 let j = i + 1;
                 while (j < lines.length) {
                     const nextLine = lines[j];
                     const nextUpper = nextLine.toUpperCase();
                     
                     if (isPipeCategoryHeader(nextLine)) break; // Next pipe award
                     if (nextUpper.includes('PREMIOS_') || nextUpper.startsWith('SECTION:') || nextUpper.startsWith('PREMIO:')) break; // Next tag award
                     
                     if (!nextUpper.startsWith('//') && nextLine.trim() !== '') {
                         players.push(nextLine);
                     }
                     j++;
                 }
                 descriptionVal = players.join('\n');
                 i = j - 1; // Advance loop
            } else if (!descriptionVal) {
                descriptionVal = "Sin descripción";
            }

            awards.push({
                category,
                title: canonicalTitle,
                player_name: parts[2] || (canonicalTitle === "ALL THE SHOW TEAM" ? "EQUIPO IDEAL" : "Por Determinar"),
                team_name: parts[3] || (canonicalTitle === "ALL THE SHOW TEAM" ? "SELECCIÓN DEL TORNEO" : "N/A"),
                description: descriptionVal,
                updated_at: new Date().toISOString()
            });
            console.log(`[IMPORT] Captured Pipe Format: ${canonicalTitle} -> ${parts[2]}`);
            continue; // Skip the rest of the loop for this line
        }

        // 1. Context Switching (Sections for tag-based format)
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

        // 2. Identifying Awards (Tag-based)
        let canonicalTitle = "";
        let isTeam = false;

        // Check for Team Award Trigger
        if (upperLine.includes(KEY_ALL_STAR) || upperLine.includes(KEY_EQUIPO_IDEAL)) {
            canonicalTitle = "ALL THE SHOW TEAM";
            isTeam = true;
        }
        // Check for Individual Awards
        else if (upperLine.startsWith('PREMIO:')) {
            if (upperLine.includes(KEY_BATEADOR)) canonicalTitle = "MEJOR BATEADOR DEL TORNEO";
            else if (upperLine.includes(KEY_LANZADOR)) canonicalTitle = "LANZADOR DESTACADO";
            else if (upperLine.includes(KEY_MVP)) canonicalTitle = "JUGADOR MVP";
        }

        // 3. Process Award if identified (Tag-based)
        if (canonicalTitle) {
            console.log(`[IMPORT] Found Award Header: ${canonicalTitle} (Line: ${line})`);

            if (isTeam) {
                const players: string[] = [];
                let j = i + 1;
                while (j < lines.length) {
                    const nextLine = lines[j];
                    const nextUpper = nextLine.toUpperCase();
                    if (nextUpper.startsWith('SECTION:') || nextUpper.startsWith('PREMIO:') || isPipeCategoryHeader(nextLine)) break;
                    if (!nextUpper.startsWith('//') && nextLine.trim() !== '') players.push(nextLine);
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
                    i = j - 1;
                }
            }
            else {
                let playerName = "";
                let teamName = "";
                let description = "";

                let j = i + 1;
                while (j < lines.length) {
                    const nextLine = lines[j];
                    const nextUpper = nextLine.toUpperCase();
                    if (nextUpper.startsWith('SECTION:') || nextUpper.startsWith('PREMIO:') || isPipeCategoryHeader(nextLine)) break;
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
