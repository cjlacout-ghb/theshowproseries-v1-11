
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { StatInput } from "./StatInput";
import type { Team, Player, BattingStat } from "@/lib/types";

interface BattingPanelProps {
    isAdmin: boolean;
    teams: Team[];
    allPlayers: Player[];
    selectedBatters: number[];
    team1: Team | undefined;
    team2: Team | undefined;
    team1Batters: number[];
    team2Batters: number[];
    addBatter: (id: string) => void;
    removeBatter: (id: number) => void;
    getStat: (id: number, field: keyof BattingStat) => any;
    handleChange: (id: number, field: keyof BattingStat, value: string) => void;
}

export function BattingPanel({
    isAdmin, teams, allPlayers, selectedBatters,
    team1, team2, team1Batters, team2Batters,
    addBatter, removeBatter, getStat, handleChange
}: BattingPanelProps) {
    return (
        <div className="p-4 bg-primary/[0.02] h-full flex flex-col">
            {isAdmin && (
                <div className="flex items-center gap-4 mb-4">
                    <Select onValueChange={addBatter}>
                        <SelectTrigger className="w-full sm:w-[300px] h-11 sm:h-10 font-bold text-sm bg-background border-primary/20">
                            <SelectValue placeholder="AGREGAR BATEADOR..." />
                        </SelectTrigger>
                        <SelectContent>
                            {allPlayers
                                .filter(p => !selectedBatters.includes(p.id))
                                .map(p => (
                                    <SelectItem key={p.id} value={String(p.id)} className="font-bold text-xs">
                                        {p.name} ({teams.find(t => t.id === p.teamId)?.name})
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                    {/* Team 1 Batters */}
                    {team1Batters.length > 0 && (
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-primary mb-2 border-b border-primary/20 pb-1">
                                {team1?.name} (Visitante)
                            </div>
                            <div className="space-y-1.5">
                                {team1Batters.map(playerId => {
                                    const player = allPlayers.find(p => p.id === playerId);
                                    return (
                                        <div key={playerId} className="flex flex-col gap-1.5 p-2.5 bg-background border border-primary/10 rounded-xl shadow-sm hover:border-primary/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="font-mono font-black text-sm uppercase tracking-tight">
                                                    #{player?.number} {player?.name}
                                                </div>
                                                {isAdmin && (
                                                    <Button variant="ghost" onClick={() => removeBatter(playerId)} className="h-11 w-11 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-primary/10 sm:border-0 rounded-lg">
                                                        <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-4 sm:grid-cols-11 gap-2">
                                                <StatInput label="PA" value={getStat(playerId, "plateAppearances")} onChange={(v: string) => handleChange(playerId, "plateAppearances", v)} isAdmin={isAdmin} />
                                                <StatInput label="AB" value={getStat(playerId, "atBats")} onChange={(v: string) => handleChange(playerId, "atBats", v)} isAdmin={isAdmin} />
                                                <StatInput label="H" value={getStat(playerId, "hits")} onChange={(v: string) => handleChange(playerId, "hits", v)} isAdmin={isAdmin} />
                                                <StatInput label="R" value={getStat(playerId, "runs")} onChange={(v: string) => handleChange(playerId, "runs", v)} isAdmin={isAdmin} />
                                                <StatInput label="RBI" value={getStat(playerId, "rbi")} onChange={(v: string) => handleChange(playerId, "rbi", v)} isAdmin={isAdmin} />
                                                <StatInput label="HR" value={getStat(playerId, "homeRuns")} onChange={(v: string) => handleChange(playerId, "homeRuns", v)} isAdmin={isAdmin} />
                                                <StatInput label="BB" value={getStat(playerId, "walks")} onChange={(v: string) => handleChange(playerId, "walks", v)} isAdmin={isAdmin} />
                                                <StatInput label="HBP" value={getStat(playerId, "hitByPitch")} onChange={(v: string) => handleChange(playerId, "hitByPitch", v)} isAdmin={isAdmin} />
                                                <StatInput label="SH" value={getStat(playerId, "sacHits")} onChange={(v: string) => handleChange(playerId, "sacHits", v)} isAdmin={isAdmin} />
                                                <StatInput label="SF" value={getStat(playerId, "sacFlies")} onChange={(v: string) => handleChange(playerId, "sacFlies", v)} isAdmin={isAdmin} />
                                                <StatInput label="SO" value={getStat(playerId, "strikeOuts")} onChange={(v: string) => handleChange(playerId, "strikeOuts", v)} isAdmin={isAdmin} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Team 2 Batters */}
                    {team2Batters.length > 0 && (
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-primary mb-3 border-b border-primary/20 pb-2">
                                {team2?.name} (Local)
                            </div>
                            <div className="space-y-3">
                                {team2Batters.map(playerId => {
                                    const player = allPlayers.find(p => p.id === playerId);
                                    return (
                                        <div key={playerId} className="flex flex-col gap-3 p-4 bg-background border border-primary/10 rounded-xl shadow-sm hover:border-primary/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="font-mono font-black text-sm uppercase tracking-tight">
                                                    #{player?.number} {player?.name}
                                                </div>
                                                {isAdmin && (
                                                    <Button variant="ghost" onClick={() => removeBatter(playerId)} className="h-11 w-11 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-primary/10 sm:border-0 rounded-lg">
                                                        <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-4 sm:grid-cols-11 gap-2">
                                                <StatInput label="PA" value={getStat(playerId, "plateAppearances")} onChange={(v: string) => handleChange(playerId, "plateAppearances", v)} isAdmin={isAdmin} />
                                                <StatInput label="AB" value={getStat(playerId, "atBats")} onChange={(v: string) => handleChange(playerId, "atBats", v)} isAdmin={isAdmin} />
                                                <StatInput label="H" value={getStat(playerId, "hits")} onChange={(v: string) => handleChange(playerId, "hits", v)} isAdmin={isAdmin} />
                                                <StatInput label="R" value={getStat(playerId, "runs")} onChange={(v: string) => handleChange(playerId, "runs", v)} isAdmin={isAdmin} />
                                                <StatInput label="RBI" value={getStat(playerId, "rbi")} onChange={(v: string) => handleChange(playerId, "rbi", v)} isAdmin={isAdmin} />
                                                <StatInput label="HR" value={getStat(playerId, "homeRuns")} onChange={(v: string) => handleChange(playerId, "homeRuns", v)} isAdmin={isAdmin} />
                                                <StatInput label="BB" value={getStat(playerId, "walks")} onChange={(v: string) => handleChange(playerId, "walks", v)} isAdmin={isAdmin} />
                                                <StatInput label="HBP" value={getStat(playerId, "hitByPitch")} onChange={(v: string) => handleChange(playerId, "hitByPitch", v)} isAdmin={isAdmin} />
                                                <StatInput label="SH" value={getStat(playerId, "sacHits")} onChange={(v: string) => handleChange(playerId, "sacHits", v)} isAdmin={isAdmin} />
                                                <StatInput label="SF" value={getStat(playerId, "sacFlies")} onChange={(v: string) => handleChange(playerId, "sacFlies", v)} isAdmin={isAdmin} />
                                                <StatInput label="SO" value={getStat(playerId, "strikeOuts")} onChange={(v: string) => handleChange(playerId, "strikeOuts", v)} isAdmin={isAdmin} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
