"use client";

import { useEffect } from "react";
import type { Game, Team, BattingStat, PitchingStat } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

import { Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// New Hooks
import { useBoxScoreStats } from "@/hooks/useBoxScoreStats";

// New Components
import { BattingPanel } from "./box-score/BattingPanel";
import { PitchingPanel } from "./box-score/PitchingPanel";

interface BoxScoreDialogProps {
    game: Game;
    teams: Team[];
    onSaveBatting: (playerId: number, stats: Partial<BattingStat>) => Promise<void>;
    onSavePitching: (playerId: number, stats: Partial<PitchingStat>) => Promise<void>;
    isAdmin?: boolean;
    onImportStats?: (text: string) => Promise<void>;
}

export default function BoxScoreDialog({ game, teams, onSaveBatting, onSavePitching, isAdmin = false, onImportStats }: BoxScoreDialogProps) {
    const {
        selectedBatters,
        selectedPitchers,
        handleBattingChange,
        handlePitchingChange,
        getBattingStat,
        getPitchingStat,
        addBatter,
        removeBatter,
        addPitcher,
        removePitcher,
        initializeFromGame
    } = useBoxScoreStats(game.id, onSaveBatting, onSavePitching);

    const { toast } = useToast();
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importText, setImportText] = useState("");
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async () => {
        if (!onImportStats) return;
        setIsImporting(true);
        try {
            await onImportStats(importText);
            toast({
                title: "Importación Exitosa",
                description: "Las estadísticas se han cargado correctamente."
            });
            setIsImportOpen(false);
            setImportText("");
            // Force re-initialize stats
            initializeFromGame(game);
            // We might need to reload the page or trigger a refresh from parent to see changes in the schedule card immediately,
            // but initializeFromGame might handle internal state. The parent (ScheduleCard) data might be stale though.
            // Ideally onImportStats should trigger a router refresh in parent.
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error de Importación",
                description: error.message || "Verifique el formato del archivo."
            });
        } finally {
            setIsImporting(false);
        }
    };

    useEffect(() => {
        initializeFromGame(game);
    }, [game, initializeFromGame]);

    const team1 = teams.find(t => String(t.id) === game.team1Id);
    const team2 = teams.find(t => String(t.id) === game.team2Id);
    const allPlayersFromTeams = [...(team1?.players || []), ...(team2?.players || [])];

    // Group selected batters by team
    const team1Batters = selectedBatters.filter(id => team1?.players.some(p => p.id === id));
    const team2Batters = selectedBatters.filter(id => team2?.players.some(p => p.id === id));

    // Group selected pitchers by team
    const team1Pitchers = selectedPitchers.filter(id => team1?.players.some(p => p.id === id));
    const team2Pitchers = selectedPitchers.filter(id => team2?.players.some(p => p.id === id));

    const getTeamForPlayer = (playerId: number) => {
        if (team1?.players.some(p => p.id === playerId)) return team1;
        if (team2?.players.some(p => p.id === playerId)) return team2;
        return null;
    };



    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-primary/10 hover:text-primary transition-all">
                    <ClipboardList className="w-4 h-4" />
                    BOX SCORE
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden border-primary/20 flex flex-col">
                <DialogHeader className="py-3 px-4 bg-primary/5 border-b border-primary/10">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <ClipboardList className="w-6 h-6 text-primary" />
                        </div>
                        Estadísticas del Partido
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="batting" className="w-full flex-1 flex flex-col overflow-hidden">
                    <TabsList className="w-full justify-start rounded-none border-b border-primary/10 bg-muted/30 p-0 h-10 flex-shrink-0">
                        <TabsTrigger value="batting" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-8 h-full font-bold text-xs uppercase tracking-widest">Bateo</TabsTrigger>
                        <TabsTrigger value="pitching" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-8 h-full font-bold text-xs uppercase tracking-widest">Pitcheo</TabsTrigger>
                    </TabsList>

                    {isAdmin && (
                        <div className="absolute right-4 top-4">
                            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="gap-2 border-primary/20 text-[10px] font-black uppercase tracking-widest hover:border-primary hover:bg-primary/5">
                                        <Upload className="w-3 h-3" />
                                        Importar TXT
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl border-primary/20 bg-card/95 backdrop-blur-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-black uppercase tracking-tighter">Importar desde TXT</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Textarea
                                            value={importText}
                                            onChange={(e) => setImportText(e.target.value)}
                                            placeholder={`GAME_ID: ${game.id}\n...`}
                                            className="h-[300px] font-mono text-xs"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setIsImportOpen(false)} className="text-[10px] font-bold uppercase tracking-widest">Cancelar</Button>
                                        <Button
                                            onClick={handleImport}
                                            disabled={isImporting || !importText.trim()}
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            {isImporting ? "Procesando..." : "Importar Datos"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}



                    <TabsContent value="batting" className="p-0 m-0 flex-1 overflow-hidden">
                        <BattingPanel
                            isAdmin={isAdmin}
                            teams={teams}
                            allPlayers={allPlayersFromTeams}
                            selectedBatters={selectedBatters}
                            team1={team1}
                            team2={team2}
                            team1Batters={team1Batters}
                            team2Batters={team2Batters}
                            addBatter={addBatter}
                            removeBatter={removeBatter}
                            getStat={getBattingStat}
                            handleChange={handleBattingChange}
                        />
                    </TabsContent>

                    <TabsContent value="pitching" className="p-0 m-0 flex-1 overflow-hidden">
                        <PitchingPanel
                            isAdmin={isAdmin}
                            teams={teams}
                            allPlayers={allPlayersFromTeams}
                            selectedPitchers={selectedPitchers}
                            team1={team1}
                            team2={team2}
                            team1Pitchers={team1Pitchers}
                            team2Pitchers={team2Pitchers}
                            addPitcher={addPitcher}
                            removePitcher={removePitcher}
                            getStat={getPitchingStat}
                            handleChange={handlePitchingChange}
                        />
                    </TabsContent>
                </Tabs>

                <DialogFooter className="py-3 px-4 bg-muted/30 border-t border-primary/10">
                    <Button variant="outline" className="w-full font-black uppercase tracking-widest text-[11px] h-10" asChild>
                        <DialogTrigger>Cerrar Panel</DialogTrigger>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
