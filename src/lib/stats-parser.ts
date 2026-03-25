
export interface ParsedGameData {
    gameId: number;
    visitorTeamName: string;
    localTeamName: string;
    visitorInnings: string[]; // as strings to handle "X" or "-"
    localInnings: string[];
    visitorRHE: { r: number; h: number; e: number };
    localRHE: { r: number; h: number; e: number };
    visitorBatters: ParsedBatter[];
    localBatters: ParsedBatter[];
    visitorPitchers: ParsedPitcher[];
    localPitchers: ParsedPitcher[];
}

export interface ParsedBatter {
    number: number;
    name: string;
    pa: number;
    ab: number;
    r: number;
    h: number;
    doubles: number;
    triples: number;
    hr: number;
    rbi: number;
    bb: number;
    hbp: number;
    sh: number;
    sf: number;
    so: number;
    sb: number;
}

export interface ParsedPitcher {
    number: number;
    name: string;
    ip: number; // float
    h: number;
    r: number;
    er: number;
    bb: number;
    so: number;
    hr: number;
    w: number;
    l: number;
    s: number;
}

export function parseGameStats(text: string): ParsedGameData {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('//'));

    const data: Partial<ParsedGameData> = {
        visitorBatters: [],
        localBatters: [],
        visitorPitchers: [],
        localPitchers: []
    };

    let currentSection = '';

    for (const line of lines) {
        if (line.startsWith('GAME_ID:')) {
            data.gameId = parseInt(line.split(':')[1].trim());
        } else if (line.startsWith('VISITOR:')) {
            data.visitorTeamName = line.split(':')[1].trim();
        } else if (line.startsWith('LOCAL:')) {
            data.localTeamName = line.split(':')[1].trim();
        } else if (line.startsWith('SECTION:')) {
            currentSection = line.split(':')[1].trim();
        } else if (line.startsWith('VISITOR_INNINGS:')) {
            data.visitorInnings = line.split(':')[1].split(',').map(s => s.trim());
        } else if (line.startsWith('LOCAL_INNINGS:')) {
            data.localInnings = line.split(':')[1].split(',').map(s => s.trim());
        } else if (line.startsWith('VISITOR_RHE:')) {
            const parts = line.split(':')[1].split(',').map(s => parseInt(s.trim()));
            data.visitorRHE = { r: parts[0], h: parts[1], e: parts[2] };
        } else if (line.startsWith('LOCAL_RHE:')) {
            const parts = line.split(':')[1].split(',').map(s => parseInt(s.trim()));
            data.localRHE = { r: parts[0], h: parts[1], e: parts[2] };
        } else {
            // Parsing stats based on section
            if (currentSection === 'VISITOR_BATTING' || currentSection === 'LOCAL_BATTING') {
                const parts = line.split(',').map(s => s.trim());
                if (parts.length >= 11) {
                    // Batter columns: # [0], NAME [1...N-statCount], STATS [...]
                    // The spec says: #, Nombre, PA, AB, R, H, 2B, 3B, HR, RBI, BB, SO, SB (13 columns)
                    // The code before expected 14 stats. Let's make it flexible.

                    // Possible STATS columns in order:
                    // PA, AB, R, H, 2B, 3B, HR, RBI, BB, [HBP], [SH], [SF], SO, SB

                    const number = parseInt(parts[0]);
                    // Last 2 columns are usually SO, SB
                    const sb = parseInt(parts[parts.length - 1]) || 0;
                    const so = parseInt(parts[parts.length - 2]) || 0;

                    // First 9 stats after name: PA, AB, R, H, 2B, 3B, HR, RBI, BB
                    // Let's find where Name ends. We assume at least 11 columns total.
                    // If we have 13 columns total: # (1), Name (1), Stats (11)
                    // Stats: PA, AB, R, H, 2B, 3B, HR, RBI, BB, SO, SB

                    const isStandard13 = parts.length === 13;
                    const nameEndIndex = isStandard13 ? 2 : (parts.length - 11); // Fallback logic
                    const name = parts.slice(1, nameEndIndex).join(', ');
                    const stats = parts.slice(nameEndIndex);

                    const batter: ParsedBatter = {
                        number: number,
                        name: name,
                        pa: parseInt(stats[0]) || 0,
                        ab: parseInt(stats[1]) || 0,
                        r: parseInt(stats[2]) || 0,
                        h: parseInt(stats[3]) || 0,
                        doubles: parseInt(stats[4]) || 0,
                        triples: parseInt(stats[5]) || 0,
                        hr: parseInt(stats[6]) || 0,
                        rbi: parseInt(stats[7]) || 0,
                        bb: parseInt(stats[8]) || 0,
                        hbp: isStandard13 ? 0 : (parseInt(stats[9]) || 0),
                        sh: isStandard13 ? 0 : (parseInt(stats[10]) || 0),
                        sf: isStandard13 ? 0 : (parseInt(stats[11]) || 0),
                        so: isStandard13 ? parseInt(stats[9]) : (parseInt(stats[12]) || 0),
                        sb: isStandard13 ? parseInt(stats[10]) : (parseInt(stats[13]) || 0),
                    };

                    if (currentSection === 'VISITOR_BATTING') {
                        data.visitorBatters?.push(batter);
                    } else {
                        data.localBatters?.push(batter);
                    }
                }
            } else if (currentSection === 'VISITOR_PITCHING' || currentSection === 'LOCAL_PITCHING') {
                const parts = line.split(',').map(s => s.trim());
                if (parts.length >= 10) {
                    // Pitcher has 12 standard columns in spec, but lets be flexible
                    // Columns: # [0], NAME [1...N-10], STATS [N-10 ... N-1]
                    // StatCount is usually 10: IP, H, R, ER, BB, SO, HR, W, L, S
                    const statCount = 10;
                    const nameEndIndex = parts.length - statCount;
                    const name = parts.slice(1, nameEndIndex).join(', ');
                    const stats = parts.slice(nameEndIndex);

                    const pitcher: ParsedPitcher = {
                        number: parseInt(parts[0]),
                        name: name,
                        ip: parseFloat(stats[0]) || 0,
                        h: parseInt(stats[1]) || 0,
                        r: parseInt(stats[2]) || 0,
                        er: parseInt(stats[3]) || 0,
                        bb: parseInt(stats[4]) || 0,
                        so: parseInt(stats[5]) || 0,
                        hr: parseInt(stats[6]) || 0,
                        w: parseInt(stats[7]) || 0,
                        l: parseInt(stats[8]) || 0,
                        s: parseInt(stats[9]) || 0,
                    };

                    if (currentSection === 'VISITOR_PITCHING') {
                        data.visitorPitchers?.push(pitcher);
                    } else {
                        data.localPitchers?.push(pitcher);
                    }
                }
            }
        }
    }

    return data as ParsedGameData;
}
