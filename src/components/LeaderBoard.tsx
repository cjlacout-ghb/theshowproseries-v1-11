"use client";

import type { Game, Team } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    aggregatePlayerStats,
    calculateTeamGamesPlayed,
    getBattingLeaders,
    getPitchingLeaders,
    type BattingLeader,
    type PitchingLeader
} from "@/lib/stats-utils";
import LeaderBoardTable from "./LeaderBoardTable";
import AwardsSection from "./AwardsSection";

interface LeaderBoardProps {
    games: Game[];
    teams: Team[];
    isAdmin?: boolean;
}

export default function LeaderBoard({ games, teams, isAdmin }: LeaderBoardProps) {
    const preliminaryGames = games.filter(g => !g.isChampionship && g.id !== 16);
    // ... rest of logic remains same ...
    const teamGamesPlayed = calculateTeamGamesPlayed(preliminaryGames, teams);
    const playerStats = aggregatePlayerStats(preliminaryGames, teams);

    const battingLeaders = getBattingLeaders(playerStats, teamGamesPlayed);
    const pitchingLeaders = getPitchingLeaders(playerStats, teamGamesPlayed);

    const battingColumns = [
        { key: 'rank' as const, label: '' },
        { key: 'name' as const, label: 'Jugador / Equipo' },
        {
            key: 'avg' as const,
            label: 'AVG',
            align: 'center' as const,
            isPrimary: true,
            format: (v: number) => v.toFixed(3).replace(/^0/, '')
        },
        { key: 'pa' as const, label: 'PA', align: 'center' as const },
        { key: 'ab' as const, label: 'AB', align: 'center' as const },
        { key: 'h' as const, label: 'H', align: 'center' as const },
        { key: 'bbHbp' as const, label: 'BB/HBP', align: 'center' as const },
        { key: 'sac' as const, label: 'SH/SF', align: 'center' as const },
        { key: 'hr' as const, label: 'HR', align: 'center' as const },
        { key: 'rbi' as const, label: 'RBI', align: 'center' as const },
    ];

    const pitchingColumns = [
        { key: 'rank' as const, label: '' },
        { key: 'name' as const, label: 'Jugador / Equipo' },
        { key: 'w' as const, label: 'G', align: 'center' as const, isPrimary: true },
        { key: 'l' as const, label: 'P', align: 'center' as const },
        {
            key: 'era' as const,
            label: 'ERA',
            align: 'center' as const,
            format: (v: number) => v.toFixed(2)
        },
        { key: 'er' as const, label: 'ER', align: 'center' as const },
        {
            key: 'ip' as const,
            label: 'IP',
            align: 'center' as const,
            format: (v: number) => v.toFixed(1)
        },
        { key: 'so' as const, label: 'SO', align: 'center' as const },
    ];

    return (
        <Tabs defaultValue="ataque" className="w-full">
            <TabsList className="flex w-full bg-primary/5 p-1 border border-primary/10 rounded-xl mb-8 items-center">
                <TabsTrigger
                    value="ataque"
                    className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] py-3 transition-all"
                >
                    BATEADORES
                </TabsTrigger>
                <div className="h-4 w-[1px] bg-primary/20 shrink-0" />
                <TabsTrigger
                    value="pitcheo"
                    className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] py-3 transition-all"
                >
                    LANZADORES
                </TabsTrigger>
                <div className="h-4 w-[1px] bg-primary/20 shrink-0" />
                <TabsTrigger
                    value="premios"
                    className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[11px] py-3 transition-all"
                >
                    PREMIOS
                </TabsTrigger>
            </TabsList>

            <TabsContent value="ataque" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                    <div>
                        <h3 className="font-black text-2xl uppercase tracking-tighter text-primary">TOP BATEADORES</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ronda Inicial</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">mínimo 2.1 PA / Juego</span>
                    </div>
                </div>
                <LeaderBoardTable<BattingLeader> leaders={battingLeaders} columns={battingColumns} />
            </TabsContent>

            <TabsContent value="pitcheo" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                    <div>
                        <h3 className="font-black text-2xl uppercase tracking-tighter text-primary">TOP LANZADORES</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ronda Inicial</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">mínimo 2.1 IP / Juego</span>
                    </div>
                </div>
                <LeaderBoardTable<PitchingLeader> leaders={pitchingLeaders} columns={pitchingColumns} />
            </TabsContent>

            <TabsContent value="premios" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                    <div>
                        <h3 className="font-black text-2xl uppercase tracking-tighter text-primary">PREMIOS INDIVIDUALES</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Premios del Torneo</p>
                    </div>
                </div>
                <AwardsSection isAdmin={isAdmin} />
            </TabsContent>
        </Tabs>
    );
}
