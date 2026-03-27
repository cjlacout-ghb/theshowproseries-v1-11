
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { StatInput } from "./StatInput";
import type { Team, Player, PitchingStat } from "@/lib/types";

interface PitchingPanelProps {
    isAdmin: boolean;
    teams: Team[];
    allPlayers: Player[];
    selectedPitchers: number[];
    team1: Team | undefined;
    team2: Team | undefined;
    team1Pitchers: number[];
    team2Pitchers: number[];
    addPitcher: (id: string) => void;
    removePitcher: (id: number) => void;
    getStat: (id: number, field: keyof PitchingStat) => any;
    handleChange: (id: number, field: keyof PitchingStat, value: string) => void;
}

export function PitchingPanel({
    isAdmin, teams, allPlayers, selectedPitchers,
    team1, team2, team1Pitchers, team2Pitchers,
    addPitcher, removePitcher, getStat, handleChange
}: PitchingPanelProps) {
    return (
        <div className="p-4 bg-primary/[0.02] h-full flex flex-col">
            {isAdmin && (
                <div className="flex items-center gap-4 mb-4">
                    <Select onValueChange={addPitcher}>
                        <SelectTrigger className="w-full sm:w-[300px] h-11 sm:h-10 font-bold text-sm bg-background border-primary/20">
                            <SelectValue placeholder="AGREGAR LANZADOR..." />
                        </SelectTrigger>
                        <SelectContent>
                            {allPlayers
                                .filter(p => !selectedPitchers.includes(p.id))
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
                    {/* Team 1 Pitchers */}
                    {team1Pitchers.length > 0 && (
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-primary mb-2 border-b border-primary/20 pb-1">
                                {team1?.name} (Visitante)
                            </div>
                            <div className="space-y-1.5">
                                {team1Pitchers.map(playerId => {
                                    const player = allPlayers.find(p => p.id === playerId);
                                    return (
                                        <div key={playerId} className="flex flex-col gap-3 p-4 bg-background border border-primary/10 rounded-xl shadow-sm hover:border-primary/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="font-mono font-black text-sm uppercase tracking-tight">
                                                    #{player?.number} {player?.name}
                                                </div>
                                                {isAdmin && (
                                                    <Button variant="ghost" onClick={() => removePitcher(playerId)} className="h-11 w-11 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-primary/10 sm:border-0 rounded-lg">
                                                        <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                                <StatInput label="IP" value={getStat(playerId, "inningsPitched")} onChange={(v: string) => handleChange(playerId, "inningsPitched", v)} type="text" isAdmin={isAdmin} />
                                                <StatInput label="H" value={getStat(playerId, "hits")} onChange={(v: string) => handleChange(playerId, "hits", v)} isAdmin={isAdmin} />
                                                <StatInput label="R" value={getStat(playerId, "runs")} onChange={(v: string) => handleChange(playerId, "runs", v)} isAdmin={isAdmin} />
                                                <StatInput label="ER" value={getStat(playerId, "earnedRuns")} onChange={(v: string) => handleChange(playerId, "earnedRuns", v)} isAdmin={isAdmin} />
                                                <StatInput label="BB" value={getStat(playerId, "walks")} onChange={(v: string) => handleChange(playerId, "walks", v)} isAdmin={isAdmin} />
                                                <StatInput label="SO" value={getStat(playerId, "strikeOuts")} onChange={(v: string) => handleChange(playerId, "strikeOuts", v)} isAdmin={isAdmin} />
                                                <StatInput label="W" value={getStat(playerId, "wins")} onChange={(v: string) => handleChange(playerId, "wins", v)} isAdmin={isAdmin} />
                                                <StatInput label="L" value={getStat(playerId, "losses")} onChange={(v: string) => handleChange(playerId, "losses", v)} isAdmin={isAdmin} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Team 2 Pitchers */}
                    {team2Pitchers.length > 0 && (
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-primary mb-3 border-b border-primary/20 pb-2">
                                {team2?.name} (Local)
                            </div>
                            <div className="space-y-3">
                                {team2Pitchers.map(playerId => {
                                    const player = allPlayers.find(p => p.id === playerId);
                                    return (
                                        <div key={playerId} className="flex flex-col gap-3 p-4 bg-background border border-primary/10 rounded-xl shadow-sm hover:border-primary/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="font-mono font-black text-sm uppercase tracking-tight">
                                                    #{player?.number} {player?.name}
                                                </div>
                                                {isAdmin && (
                                                    <Button variant="ghost" onClick={() => removePitcher(playerId)} className="h-11 w-11 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-primary/10 sm:border-0 rounded-lg">
                                                        <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                                <StatInput label="IP" value={getStat(playerId, "inningsPitched")} onChange={(v: string) => handleChange(playerId, "inningsPitched", v)} type="text" isAdmin={isAdmin} />
                                                <StatInput label="H" value={getStat(playerId, "hits")} onChange={(v: string) => handleChange(playerId, "hits", v)} isAdmin={isAdmin} />
                                                <StatInput label="R" value={getStat(playerId, "runs")} onChange={(v: string) => handleChange(playerId, "runs", v)} isAdmin={isAdmin} />
                                                <StatInput label="ER" value={getStat(playerId, "earnedRuns")} onChange={(v: string) => handleChange(playerId, "earnedRuns", v)} isAdmin={isAdmin} />
                                                <StatInput label="BB" value={getStat(playerId, "walks")} onChange={(v: string) => handleChange(playerId, "walks", v)} isAdmin={isAdmin} />
                                                <StatInput label="SO" value={getStat(playerId, "strikeOuts")} onChange={(v: string) => handleChange(playerId, "strikeOuts", v)} isAdmin={isAdmin} />
                                                <StatInput label="W" value={getStat(playerId, "wins")} onChange={(v: string) => handleChange(playerId, "wins", v)} isAdmin={isAdmin} />
                                                <StatInput label="L" value={getStat(playerId, "losses")} onChange={(v: string) => handleChange(playerId, "losses", v)} isAdmin={isAdmin} />
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
