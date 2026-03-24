import { useState, useCallback, useEffect, useRef } from "react";
import type { Team, Game, Standing, BattingStat, PitchingStat } from "@/lib/types";
import { updateGame } from "@/actions/games";
import { saveBattingStat, savePitchingStat } from "@/actions/stats";
import { resetTournamentScores, importGameStatsFromTxt, resetGameData } from "@/actions/admin";
import { useToast } from "@/hooks/use-toast";
import { useStandings } from "./useStandings";
import { updateGameInning, swapGameTeams, ensureGameInnings } from "@/lib/innings-utils";
import { supabase } from "@/lib/supabase";

export interface UseTournamentStateProps {
    initialTeams: Team[];
    initialGames: Game[];
    isAdmin?: boolean;
}

export function useTournamentState({ initialTeams, initialGames, isAdmin }: UseTournamentStateProps) {
    const [teams, setTeams] = useState<Team[]>(initialTeams);
    const [preliminaryGames, setPreliminaryGames] = useState<Game[]>(
        initialGames
            .filter(g => !g.isChampionship)
            .map(ensureGameInnings)
    );
    const [championshipGame, setChampionshipGame] = useState<Game>(() => {
        const found = initialGames.find(g => g.isChampionship);
        if (found) {
            return ensureGameInnings(found);
        }
        return {
            id: 16,
            team1Id: "",
            score1: "",
            hits1: "",
            errors1: "",
            team2Id: "",
            score2: "",
            hits2: "",
            errors2: "",
            day: "DÍA 4: Sábado, 21 de marzo",
            time: "21:00",
            innings: Array(7).fill(0).map(() => ["", ""]),
            isChampionship: true
        };
    });

    const [champion, setChampion] = useState<string | null>(null);
    const [standings, setStandings] = useState<Standing[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);

    // Sync teams state if initialTeams prop updates (e.g. after router.refresh())
    useEffect(() => {
        setTeams(initialTeams);
    }, [initialTeams]);

    const gamesToPersist = useRef<Set<number>>(new Set());
    const persistTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();
    const { calculateStandings } = useStandings(teams);

    const authTokenRef = useRef<string | null>(null);

    // Track auth session
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("[AUTH] Session updated in useTournamentState:", session?.user?.email);
            authTokenRef.current = session?.access_token || null;
        });

        // Get initial
        supabase.auth.getSession().then(({ data: { session } }) => {
            authTokenRef.current = session?.access_token || null;
        });

        return () => subscription.unsubscribe();
    }, []);

    const markGameForPersistence = useCallback((gameId: number) => {
        gamesToPersist.current.add(gameId);
    }, []);

    const getAuthToken = useCallback(async () => {
        if (authTokenRef.current) return authTokenRef.current;
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
    }, []);

    // Standings calculation effect
    useEffect(() => {
        const newStandings = calculateStandings(preliminaryGames);
        setStandings(newStandings);

        if (newStandings.length > 1) {
            const team2Id = String(newStandings[0].teamId);
            const team1Id = String(newStandings[1].teamId);

            if (championshipGame.team1Id !== team1Id || championshipGame.team2Id !== team2Id) {
                setChampionshipGame(prev => ({
                    ...prev,
                    team1Id,
                    team2Id
                }));
                if (isAdmin) {
                    markGameForPersistence(championshipGame.id);
                }
            }
        }
    }, [preliminaryGames, calculateStandings, markGameForPersistence, championshipGame.id, championshipGame.team1Id, championshipGame.team2Id, isAdmin]);

    const checkChampionshipWinner = useCallback((finalGame: Game) => {
        const { team1Id, team2Id, score1, score2, innings } = finalGame;
        if (score1 !== "" && score2 !== "" && score1 !== score2) {
            // Only define a champion if the game is actually over.
            // A game is over if it reaches at least 7 innings AND the bottom of the last inning is filled.
            if (innings && innings.length >= 7) {
                const lastInning = innings[innings.length - 1];
                const bottomValue = lastInning[1];

                // Check if there is any inning data entered.
                // If there is, we enforce the "last inning complete" rule.
                const hasInningData = innings.some(inn => inn[0] !== "" || inn[1] !== "");

                if (hasInningData && (bottomValue === "" || bottomValue === null)) {
                    // Game is still in progress (inning-by-inning mode)
                    return;
                }
            }

            const s1 = parseInt(score1);
            const s2 = parseInt(score2);
            const winnerId = s1 > s2 ? team1Id : team2Id;

            const winner = teams.find(t => String(t.id) === winnerId);
            // Avoid repeating the toast if the champion is already set
            if (winner && champion !== winner.name) {
                setChampion(winner.name);
                setShowConfetti(true);
                toast({
                    title: "¡Campeón Definido!",
                    description: `El equipo campeón es ${winner.name}.`
                });
            }
        }
    }, [teams, toast, champion]);

    // Championship winner check effect
    useEffect(() => {
        checkChampionshipWinner(championshipGame);
    }, [championshipGame, checkChampionshipWinner]);

    // Persistence effect
    useEffect(() => {
        if (gamesToPersist.current.size === 0) return;

        if (persistTimeoutRef.current) {
            clearTimeout(persistTimeoutRef.current);
        }

        persistTimeoutRef.current = setTimeout(async () => {
            const gameIds = Array.from(gamesToPersist.current);
            gamesToPersist.current.clear();

            for (const gameId of gameIds) {
                try {
                    let gameToSave: Game | undefined;
                    if (championshipGame.id === gameId) {
                        gameToSave = championshipGame;
                    } else {
                        gameToSave = preliminaryGames.find(g => g.id === gameId);
                    }

                    if (gameToSave) {
                        const token = await getAuthToken();
                        if (!token) {
                            // Silent exit if no token - especially for auto-updates like the championship game.
                            // We don't want to show an error toast to regular users just because standings changed.
                            console.warn(`[PERSISTENCE] Skipping save for game ${gameId} because no auth token is available.`);
                            continue;
                        }
                        await updateGame(gameToSave.id, gameToSave, token);
                    }
                } catch (error: any) {
                    console.error(`Failed to save game ${gameId}`, error);
                    toast({
                        variant: "destructive",
                        title: "Error de Guardado",
                        description: error.message || "No se pudieron guardar los cambios.",
                    });
                }
            }
        }, 500);

        return () => {
            if (persistTimeoutRef.current) {
                clearTimeout(persistTimeoutRef.current);
            }
        };
    }, [preliminaryGames, championshipGame, toast]);

    const handleGameChange = useCallback((
        gameId: number,
        field: keyof Game,
        value: string,
        isChampionship = false
    ) => {
        if (isChampionship) {
            setChampionshipGame(prev => ({ ...prev, [field]: value }));
            markGameForPersistence(gameId);
        } else {
            setPreliminaryGames(prevGames => {
                const newGames = prevGames.map(game =>
                    game.id === gameId ? { ...game, [field]: value } : game
                );
                markGameForPersistence(gameId);
                return newGames;
            });
        }
    }, [markGameForPersistence]);

    const handleInningChange = useCallback((
        gameId: number,
        inningIndex: number,
        teamIndex: 0 | 1,
        value: string,
        isChampionship = false
    ) => {
        if (isChampionship) {
            setChampionshipGame(prev => updateGameInning(prev, inningIndex, teamIndex, value));
            markGameForPersistence(gameId);
        } else {
            setPreliminaryGames(prevGames => {
                const newGames = prevGames.map(game =>
                    game.id === gameId ? updateGameInning(game, inningIndex, teamIndex, value) : game
                );
                markGameForPersistence(gameId);
                return newGames;
            });
        }
    }, [markGameForPersistence]);

    const handleSaveBatting = useCallback(async (gameId: number, playerId: number, stats: Partial<BattingStat>) => {
        try {
            const token = await getAuthToken();
            await saveBattingStat({ gameId, playerId, stats, token: token || undefined });

            const updateGameStats = (game: Game): Game => {
                const existingStats = game.battingStats || [];
                const index = existingStats.findIndex(s => s.playerId === playerId);
                const newBattingStats = [...existingStats];
                if (index > -1) {
                    newBattingStats[index] = { ...newBattingStats[index], ...stats };
                } else {
                    newBattingStats.push({ gameId, playerId, ...stats } as BattingStat);
                }
                return { ...game, battingStats: newBattingStats };
            };

            if (championshipGame.id === gameId) {
                setChampionshipGame(prev => updateGameStats(prev));
            } else {
                setPreliminaryGames(prev => prev.map(g => g.id === gameId ? updateGameStats(g) : g));
            }
        } catch (error) {
            console.error("Failed to save batting stats", error);
        }
    }, [championshipGame.id]);

    const handleSavePitching = useCallback(async (gameId: number, playerId: number, stats: Partial<PitchingStat>) => {
        try {
            const token = await getAuthToken();
            await savePitchingStat({ gameId, playerId, stats, token: token || undefined });

            const updateGameStats = (game: Game): Game => {
                const existingStats = game.pitchingStats || [];
                const index = existingStats.findIndex(s => s.playerId === playerId);
                const newPitchingStats = [...existingStats];
                if (index > -1) {
                    newPitchingStats[index] = { ...newPitchingStats[index], ...stats };
                } else {
                    newPitchingStats.push({ gameId, playerId, ...stats } as PitchingStat);
                }
                return { ...game, pitchingStats: newPitchingStats };
            };

            if (championshipGame.id === gameId) {
                setChampionshipGame(prev => updateGameStats(prev));
            } else {
                setPreliminaryGames(prev => prev.map(g => g.id === gameId ? updateGameStats(g) : g));
            }
        } catch (error) {
            console.error("Failed to save pitching stats", error);
        }
    }, [championshipGame.id]);

    const handleSwapTeams = useCallback((gameId: number) => {
        if (championshipGame.id === gameId) {
            setChampionshipGame(prev => {
                const updated = swapGameTeams(prev);
                markGameForPersistence(gameId);
                return updated;
            });
        } else {
            setPreliminaryGames(prev => {
                const updated = prev.map(g => g.id === gameId ? swapGameTeams(g) : g);
                markGameForPersistence(gameId);
                return updated;
            });
        }
    }, [championshipGame.id, markGameForPersistence]);

    const handleImportStats = useCallback(async (gameId: number, txt: string) => {
        const token = await getAuthToken();
        if (!token) {
            throw new Error("No has iniciado sesión como administrador (Token faltante).");
        }
        const result = await importGameStatsFromTxt(gameId, txt, token);
        if (result.success) {
            // Force a reload to refresh all data (Standings, Leaders, etc.)
            window.location.reload();
        }
        return result;
    }, [getAuthToken]);


    const handleResetTournament = useCallback(async () => {
        console.log("[HOOK] handleResetTournament triggered");
        // Removed window.confirm as it was being suppressed/auto-cancelled in some environments

        console.log("[HOOK] Reset proceeding to server...");

        const { dismiss: dismissLoading } = toast({
            title: "Procesando Reinicio",
            description: "Conectando con el servidor y verificando credenciales...",
        });

        try {
            console.log("Initiating tournament reset...");

            // 1. Get token with a local timeout to prevent hanging the UI
            const tokenPromise = getAuthToken();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Tiempo de espera agotado al verificar sesión. Reintenta.")), 8000)
            );

            const token = await Promise.race([tokenPromise, timeoutPromise]) as string;

            // 2. Perform the database reset (Server Action)
            const result = await resetTournamentScores(token || undefined);

            dismissLoading();

            if (result.success) {
                // 3. If DB reset succeeded, clear local state
                if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
                gamesToPersist.current.clear();

                setPreliminaryGames(prev => prev.map(g => ({
                    ...g,
                    score1: "", score2: "", hits1: "", hits2: "", errors1: "", errors2: "",
                    innings: Array(7).fill(0).map(() => ["", ""])
                })));
                setChampionshipGame(prev => ({
                    ...prev,
                    team1Id: "", team2Id: "",
                    score1: "", score2: "", hits1: "", hits2: "", errors1: "", errors2: "",
                    innings: Array(7).fill(0).map(() => ["", ""])
                }));
                setChampion(null);
                setShowConfetti(false);

                toast({
                    title: "Torneo Reiniciado",
                    description: "La base de datos se ha limpiado correctamente. Recargando para sincronizar..."
                });

                // 4. Force a hard reload to ensure everything is fresh
                setTimeout(() => {
                    window.location.href = '/?t=' + Date.now();
                }, 1500);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error al Reiniciar",
                    description: result.error || "El servidor no pudo completar el reinicio."
                });
            }
        } catch (error: any) {
            dismissLoading();
            console.error("Reset error catch block:", error);
            toast({
                variant: "destructive",
                title: "Error de Operación",
                description: error.message || "No se pudo comunicar con el servidor."
            });
        }
    }, [toast, getAuthToken]);

    const handleResetGame = useCallback(async (gameId: number) => {
        console.log(`[HOOK] handleResetGame triggered for game ${gameId}`);

        const { dismiss: dismissLoading } = toast({
            title: "Borrando Resultados",
            description: "Conectando con el servidor para limpiar datos del juego...",
        });

        try {
            const tokenPromise = getAuthToken();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Tiempo de espera agotado.")), 8000)
            );

            const token = await Promise.race([tokenPromise, timeoutPromise]) as string;
            const result = await resetGameData(gameId, token || undefined);

            dismissLoading();

            if (result.success) {
                toast({
                    title: "Juego Borrado",
                    description: "Los resultados y estadísticas del juego se han eliminado correctamente. Recargando..."
                });

                // Full reload as requested to ensure consistency
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error al Borrar",
                    description: result.error || "No se pudo borrar la información del juego."
                });
            }
        } catch (error: any) {
            dismissLoading();
            console.error("Reset game error:", error);
            toast({
                variant: "destructive",
                title: "Error de Operación",
                description: error.message || "No se pudo comunicar con el servidor."
            });
        }
    }, [toast, getAuthToken]);

    return {
        teams,
        preliminaryGames,
        championshipGame,
        champion,
        standings,
        showConfetti,
        setShowConfetti,
        handleGameChange,
        handleInningChange,
        handleSaveBatting,
        handleSavePitching,
        handleSwapTeams,
        handleImportStats,
        handleResetTournament,
        handleResetGame
    };
}
