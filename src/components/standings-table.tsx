"use client";

import { useState, useMemo } from "react";
import type { Standing, Team, Game } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { TieBreakRulesDialog } from "./TieBreakRulesDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrophyIcon } from "./icons";

type StandingsTableProps = {
  standings: Standing[];
  teams: Team[];
  games: Game[];
  onNavigate?: () => void;
  champion?: string | null;
};

export default function StandingsTable({
  standings,
  teams,
  games,
  onNavigate,
  champion
}: StandingsTableProps) {
  const [hoveredTeamId, setHoveredTeamId] = useState<number | null>(null);

  // Columns hidden on mobile to prevent truncation — show all on sm screens and above
  const tableColumns = [
    { key: "POS",  hide: false },
    { key: "TEAM", hide: false },
    { key: "G",   hide: false },
    { key: "W",   hide: false },
    { key: "L",   hide: false },
    { key: "RS",  hide: true  }, // hidden on mobile
    { key: "RA",  hide: true  }, // hidden on mobile
    { key: "PCT", hide: false },
    { key: "GB",  hide: true  }, // hidden on mobile
  ];

  const getTeamName = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.name || "Unknown Team";
  };

  const formatPct = (pct: number) => {
    if (pct === 1000) return "1.000";
    return `.${pct.toString().padStart(3, '0')}`;
  }

  const getTeamRecord = (teamId: number) => {
    return games
      .filter(g =>
        (String(g.team1Id) === String(teamId) || String(g.team2Id) === String(teamId)) &&
        g.score1 !== "" && g.score2 !== ""
      )
      .map((g, index) => {
        const isTeam1 = String(g.team1Id) === String(teamId);
        const opponentId = isTeam1 ? g.team2Id : g.team1Id;
        const opponent = teams.find(t => String(t.id) === String(opponentId));
        const myScore = parseInt(isTeam1 ? g.score1 : g.score2);
        const oppScore = parseInt(isTeam1 ? g.score2 : g.score1);
        const won = myScore > oppScore;

        return {
          gameNum: index + 1,
          opponentName: opponent?.name || "Unknown",
          result: won ? "Ganó" : "Perdió",
          score: `${myScore}-${oppScore}`
        };
      });
  };

  const isTied = (standing: Standing, index: number) => {
    if (index > 0 && standing.pos === standings[index - 1].pos) return true;
    if (index < standings.length - 1 && standing.pos === standings[index + 1].pos) return true;
    return false;
  }

  // Pre-compute all team records once to avoid recalculation on hover
  const allTeamRecords = useMemo(() => {
    const records: Record<number, ReturnType<typeof getTeamRecord>> = {};
    standings.forEach(s => {
      records[s.teamId] = getTeamRecord(s.teamId);
    });
    return records;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games, teams, standings]);

  const hasTies = standings.some(isTied);

  return (
    <Card className="border-primary/10 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.5)] bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-primary/5 bg-primary/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <span className="text-primary">📊</span> Tabla de Posiciones
          </CardTitle>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
        <CardDescription className="text-xs uppercase tracking-wider font-medium opacity-70">
          RONDA INICIAL
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 relative">
        <TooltipProvider>
          {/* Wrapper: overflow-x-auto with right-fade to hint at scrollability */}
          <div className="relative">
            <div className="overflow-x-auto">
              <Table className="min-w-[480px]">
              <TableHeader className="bg-primary/[0.03]">
                <TableRow className="border-b border-primary/10 hover:bg-transparent">
                  {tableColumns.map(({ key, hide }) => (
                    <TableHead key={key} className={cn(
                      "h-12 text-[11px] font-black uppercase tracking-[0.1em] text-primary/70",
                      key === "TEAM" ? "w-[40%] min-w-[130px]" : "text-center whitespace-nowrap",
                      hide && "hidden sm:table-cell"
                    )}>
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((standing, index) => {
                  const teamName = getTeamName(standing.teamId);
                  const isLeader = index === 0 && standing.w > 0;

                  return (
                    <TableRow key={standing.teamId} className="group hover:bg-primary/[0.02] border-b border-primary/5 transition-colors">
                      <TableCell className="text-center font-mono font-bold text-sm">
                        {isTied(standing, index) ? (
                          <span className="flex items-center justify-center gap-1 text-amber-500">
                            {standing.pos}*
                          </span>
                        ) : (
                          <span className={isLeader ? "text-primary scale-110 inline-block" : ""}>
                            {standing.pos}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <div 
                          className="flex flex-col cursor-help py-2"
                          onMouseEnter={() => setHoveredTeamId(standing.teamId)}
                          onMouseLeave={() => setHoveredTeamId(null)}
                          onTouchStart={() => setHoveredTeamId(standing.teamId)}
                          onTouchEnd={() => setHoveredTeamId(null)}
                        >
                          <span className={cn(
                            "text-sm font-bold uppercase tracking-tight transition-colors group-hover:text-primary",
                            isLeader ? "text-primary" : "text-foreground"
                          )}>
                            {teamName}
                          </span>
                          {isLeader && (
                            <span className="text-[9px] font-black tracking-widest text-primary/60 uppercase">
                              Líder del Torneo
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-sm text-primary/60">
                        {standing.w + standing.l}
                      </TableCell>
                      <TableCell className="text-center font-bold text-sm">{standing.w}</TableCell>
                      <TableCell className="text-center font-bold text-sm text-muted-foreground">{standing.l}</TableCell>
                      <TableCell className="hidden sm:table-cell text-center text-sm font-medium">{standing.rs}</TableCell>
                      <TableCell className="hidden sm:table-cell text-center text-sm font-medium">{standing.ra}</TableCell>
                      <TableCell className="text-center font-mono text-sm font-bold text-primary/80">
                        {formatPct(standing.pct)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center font-mono text-sm font-bold">
                        {standing.gb === 0 ? <span className="text-primary/40">—</span> : standing.gb.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {/* Right-edge fade: visible only while table can still scroll (i.e. on small screens) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card/80 to-transparent sm:hidden" />
        </div>

          {/* Overlay fijo para el historial de partidos */}
          {(() => {
            const hoveredTeamRecord = hoveredTeamId ? (allTeamRecords[hoveredTeamId] ?? []) : [];
            return (
              <div className={cn(
                "absolute top-1/2 left-1/2 md:left-[30%] lg:left-[25%] xl:left-[22%] -translate-x-1/2 md:translate-x-0 -translate-y-1/2 pointer-events-none z-[100] w-[280px] sm:w-[320px] p-4 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl transition-all duration-300",
                hoveredTeamId ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Historial de Partidos</span>
                  </div>
                  <div className="space-y-3">
                    {hoveredTeamRecord.length > 0 ? (
                      hoveredTeamRecord.map((row) => (
                        <div key={row.gameNum} className="flex justify-between items-center text-xs gap-3 py-1 border-b border-primary/5 last:border-0">
                          <span className="font-bold text-foreground/80 leading-tight">vs. {row.opponentName}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase shadow-sm border whitespace-nowrap flex-shrink-0",
                            row.result === "Ganó"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          )}>
                            {row.result} {row.score}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] italic text-muted-foreground py-2 text-center">
                        Aún no se han registrado juegos finalizados.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {champion && (() => {
            const finalGame = games.find(g => g.isChampionship);
            if (!finalGame || finalGame.score1 === "" || finalGame.score2 === "") return (
              <div className="relative overflow-hidden group border-t border-white/20">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 opacity-95" />
                <div className="relative py-6 px-4 flex flex-col items-center justify-center gap-3 text-center backdrop-blur-sm">
                  <div className="flex items-center gap-6">
                    <TrophyIcon className="w-8 h-8 text-zinc-950 drop-shadow-lg" />
                    <span className="text-zinc-950 text-2xl md:text-3xl font-black uppercase tracking-tighter drop-shadow-sm">
                      {champion}
                    </span>
                    <TrophyIcon className="w-8 h-8 text-zinc-950 drop-shadow-lg" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <h3 className="text-zinc-950 text-[11px] md:text-xs font-black uppercase tracking-[0.3em] drop-shadow-sm whitespace-nowrap">
                      CAMPEÓN DEL TORNEO THE SHOW-PRO SERIES
                    </h3>
                    <div className="h-0.5 w-full max-w-[200px] bg-zinc-950/20" />
                  </div>
                </div>
              </div>
            );

            const isTeam1Winner = parseInt(finalGame.score1) > parseInt(finalGame.score2);
            const opponentId = isTeam1Winner ? finalGame.team2Id : finalGame.team1Id;
            const opponent = teams.find(t => String(t.id) === String(opponentId));
            const score = isTeam1Winner ? `${finalGame.score1}-${finalGame.score2}` : `${finalGame.score2}-${finalGame.score1}`;

            return (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className="relative overflow-hidden group border-t border-white/20 cursor-help">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 opacity-95 group-hover:opacity-100 transition-opacity" />
                    <div className="relative py-6 px-4 flex flex-col items-center justify-center gap-3 text-center backdrop-blur-sm">
                      <div className="flex items-center gap-6">
                        <TrophyIcon className="w-10 h-10 text-zinc-950 drop-shadow-lg animate-bounce" />
                        <span className="text-zinc-950 text-2xl md:text-3xl font-black uppercase tracking-tighter drop-shadow-sm">
                          {champion}
                        </span>
                        <TrophyIcon className="w-10 h-10 text-zinc-950 drop-shadow-lg animate-bounce" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <h3 className="text-zinc-950 text-[11px] md:text-xs font-black uppercase tracking-[0.3em] drop-shadow-sm whitespace-nowrap">
                          CAMPEÓN DEL TORNEO THE SHOW-PRO SERIES
                        </h3>
                        <div className="h-0.5 w-full max-w-[200px] bg-zinc-950/20" />
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-4 bg-background/95 backdrop-blur-md border-amber-500/50 shadow-2xl w-[280px] sm:w-[320px]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
                      <span className="text-amber-500">👑</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Resultado Gran Final</span>
                    </div>
                    <div className="flex justify-between items-center text-xs gap-3 py-1">
                      <span className="font-bold text-foreground/80 leading-tight">vs. {opponent?.name || "Unknown"}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase shadow-sm border bg-amber-500/10 text-amber-600 border-amber-500/20 whitespace-nowrap flex-shrink-0">
                        GANÓ {score}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })()}
        </TooltipProvider>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-6 border-t border-primary/5 bg-primary/[0.01]">
        <TieBreakRulesDialog />
        {onNavigate && (
          <div className="flex justify-end w-full">
            <Button
              variant="secondary"
              onClick={onNavigate}
              className="font-bold uppercase tracking-widest text-[11px] hover:translate-y-[-2px] transition-transform"
            >
              Regresar al Menú
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

