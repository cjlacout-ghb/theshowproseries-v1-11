import { useCallback } from 'react';
import type { Team, Game, Standing } from '@/lib/types';

export interface UseStandingsResult {
    calculateStandings: (games: Game[]) => Standing[];
}

/**
 * Hook for calculating tournament standings from game results.
 *
 * Tiebreakers follow WBSC Regulation C11:
 *  1. Head-to-head record (W-L%, among tied teams only)
 *  2. Overall TQB  (RS/innings_off − RA/innings_def)
 *  3. Overall run differential  (practical ER-TQB stand-in)
 *  4. Fewer games played
 *  5. Coin toss — stays tied, shown with * in the UI
 */
export function useStandings(teams: Team[]): UseStandingsResult {
    const calculateStandings = useCallback((gamesToProcess: Game[]): Standing[] => {

        // Initialize standings for each team
        const newStandings: Omit<Standing, 'pos' | 'gb'>[] = teams.map(team => ({
            teamId: team.id,
            w: 0,
            l: 0,
            rs: 0,
            ra: 0,
            pct: 0,
        }));

        // Abort if any game ended in a tie score
        for (const game of gamesToProcess) {
            if (game.score1 !== '' && game.score2 !== '' && game.score1 === game.score2) {
                return [];
            }
        }

        // Accumulate W / L / RS / RA
        gamesToProcess.forEach(game => {
            if (game.team1Id && game.team2Id && game.score1 !== '' && game.score2 !== '') {
                const t1 = parseInt(game.team1Id);
                const t2 = parseInt(game.team2Id);
                const s1 = parseInt(game.score1);
                const s2 = parseInt(game.score2);
                const st1 = newStandings.find(s => s.teamId === t1);
                const st2 = newStandings.find(s => s.teamId === t2);
                if (st1 && st2) {
                    st1.rs += s1; st1.ra += s2;
                    st2.rs += s2; st2.ra += s1;
                    if (s1 > s2) { st1.w++; st2.l++; }
                    else         { st2.w++; st1.l++; }
                }
            }
        });

        // Win %
        newStandings.forEach(s => {
            const gp = s.w + s.l;
            s.pct = gp > 0 ? s.w / gp : 0;
        });

        // ─────────────────────────────────────────────────────────────────────
        // WBSC C11 helpers
        // ─────────────────────────────────────────────────────────────────────

        /** Count non-empty innings cells for each team in a game. */
        const inningsPlayed = (inningsData: (string | number)[][]): { t1: number; t2: number } => {
            if (!inningsData || inningsData.length < 2) return { t1: 7, t2: 7 };
            const cnt = (row: (string | number)[]) =>
                (row || []).filter(v => v !== '' && v !== null && v !== undefined).length;
            return { t1: cnt(inningsData[0]) || 7, t2: cnt(inningsData[1]) || 7 };
        };

        /**
         * TQB = (RS / innings_off) − (RA / innings_def)
         * scope: if non-null, only count games where BOTH opponents are in the set.
         */
        const tqb = (teamId: number, scope: Set<number> | null): number => {
            let rs = 0, ra = 0, io = 0, id = 0;
            gamesToProcess.forEach(game => {
                if (game.score1 === '' || game.score2 === '') return;
                const t1 = parseInt(game.team1Id);
                const t2 = parseInt(game.team2Id);
                if (scope && (!scope.has(t1) || !scope.has(t2))) return;
                const { t1: i1, t2: i2 } = inningsPlayed(game.innings);
                if (t1 === teamId) { rs += parseInt(game.score1); ra += parseInt(game.score2); io += i1; id += i2; }
                else if (t2 === teamId) { rs += parseInt(game.score2); ra += parseInt(game.score1); io += i2; id += i1; }
            });
            if (io === 0 || id === 0) return 0;
            return (rs / io) - (ra / id);
        };

        /** Head-to-head W-L among a tier group. */
        const h2h = (teamId: number, tier: Set<number>): { w: number; l: number } => {
            let w = 0, l = 0;
            gamesToProcess.forEach(game => {
                if (game.score1 === '' || game.score2 === '') return;
                const t1 = parseInt(game.team1Id);
                const t2 = parseInt(game.team2Id);
                if (!tier.has(t1) || !tier.has(t2)) return;
                const s1 = parseInt(game.score1), s2 = parseInt(game.score2);
                if (t1 === teamId) { s1 > s2 ? w++ : l++; }
                else if (t2 === teamId) { s2 > s1 ? w++ : l++; }
            });
            return { w, l };
        };

        /**
         * WBSC C11 comparator (negative = a ranks higher, positive = b ranks higher).
         * Both a and b are assumed to be in the same PCT tier.
         */
        const wbscCmp = (
            a: Omit<Standing, 'pos' | 'gb'>,
            b: Omit<Standing, 'pos' | 'gb'>,
            tier: Set<number>
        ): number => {
            // C11-1: Head-to-head W% among tier
            const ha = h2h(a.teamId, tier), hb = h2h(b.teamId, tier);
            const wpA = (ha.w + ha.l) > 0 ? ha.w / (ha.w + ha.l) : 0;
            const wpB = (hb.w + hb.l) > 0 ? hb.w / (hb.w + hb.l) : 0;
            if (Math.abs(wpB - wpA) > 1e-9) return wpB - wpA;  // higher % → smaller return → ranks first

            // C11-2: Overall TQB
            const tA = tqb(a.teamId, null), tB = tqb(b.teamId, null);
            if (Math.abs(tB - tA) > 1e-9) return tB - tA;

            // C11-3: Run differential (overall)
            const dA = a.rs - a.ra, dB = b.rs - b.ra;
            if (dA !== dB) return dB - dA;

            // C11-4: Fewer games played
            const gA = a.w + a.l, gB = b.w + b.l;
            if (gA !== gB) return gA - gB;

            // C11-5: Coin toss — stays tied
            return 0;
        };

        // ─────────────────────────────────────────────────────────────────────
        // Sort: PCT first, then WBSC cascade within each PCT tier
        // ─────────────────────────────────────────────────────────────────────
        newStandings.sort((a, b) => b.pct - a.pct);

        let i = 0;
        while (i < newStandings.length) {
            let j = i + 1;
            while (j < newStandings.length && Math.abs(newStandings[j].pct - newStandings[i].pct) < 1e-9) {
                j++;
            }
            if (j - i > 1) {
                const tier = new Set(newStandings.slice(i, j).map(s => s.teamId));
                const sorted = [...newStandings.slice(i, j)].sort((a, b) => wbscCmp(a, b, tier));
                for (let k = 0; k < sorted.length; k++) newStandings[i + k] = sorted[k];
            }
            i = j;
        }

        // ─────────────────────────────────────────────────────────────────────
        // Assign positions and GB
        // ─────────────────────────────────────────────────────────────────────
        let rank = 1;
        const finalStandings: Standing[] = newStandings.map((standing, index) => {
            if (index > 0) {
                const prev = newStandings[index - 1];
                const samePct = Math.abs(standing.pct - prev.pct) < 1e-9;
                if (samePct) {
                    // Build tier for the comparison
                    const tierForCmp = new Set(
                        newStandings.filter(s => Math.abs(s.pct - standing.pct) < 1e-9).map(s => s.teamId)
                    );
                    const cmp = wbscCmp(standing, prev, tierForCmp);
                    if (cmp !== 0) rank = index + 1; // tiebreaker resolved → new rank
                    // cmp === 0 → coin-toss tie → same rank (shown with *)
                } else {
                    rank = index + 1;
                }
            }

            const fw = newStandings[0].w;
            const fl = newStandings[0].l;
            const gb = ((fw - standing.w) + (standing.l - fl)) / 2;
            const gp = standing.w + standing.l;
            const displayPct = gp > 0 ? Math.round((standing.w / gp) * 1000) : 0;

            return {
                ...standing,
                pos: rank,
                gb: gp === 0 ? 0 : gb,
                pct: displayPct,
            };
        });

        return finalStandings;
    }, [teams]);

    return { calculateStandings };
}
