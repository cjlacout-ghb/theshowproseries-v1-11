
"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Team } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { importPlayers, updatePlayer } from "@/actions/admin";
import { Upload, Pencil, Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Helper to check if a role is considered "Staff"
const isStaff = (role: string) => {
  const r = role.toUpperCase();
  return r.includes("MANAGER") || r.includes("COACH") || r.includes("DELEGADO") || r.includes("PRINCIPAL") || r.includes("TRAINER") || r.includes("MEDICO") || r.includes("ESTADÍSTICA") || r.includes("BATBOY") || r.includes("JEFE");
};

// Helper for sorting staff hierarchy
const getStaffRank = (role: string) => {
  const r = role.toUpperCase();
  if (r.includes("HEAD COACH") || r.includes("MANAGER") || r.includes("PRINCIPAL")) return 1;
  if (r.includes("COACH")) return 2; // Checked after HEAD COACH
  if (r.includes("ESTADÍSTICA") || r.includes("ESTADISTICA")) return 3;
  return 4; // Other staff like trainer, medico, delegado, batboy, etc.
};

type TeamSetupProps = {
  teams: Team[];
  openAccordion: string | undefined;
  setOpenAccordion: (value: string | undefined) => void;
  onNavigate?: () => void;
  isAdmin?: boolean;
};

export default function TeamSetup({ teams, openAccordion, setOpenAccordion, onNavigate, isAdmin }: TeamSetupProps) {
  const router = useRouter();
  const [importingTeam, setImportingTeam] = useState<Team | null>(null);
  const [csvData, setCsvData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);

  // Edit State
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ number: "", name: "", role: "", placeOfBirth: "" });

  const { toast } = useToast();

  const handleOpenImport = (team: Team) => {
    setImportingTeam(team);
    setCsvData("");
    // Don't reset replaceMode here because we might have just set it
  };

  const handleImport = async () => {
    if (!importingTeam) return;
    // Allow empty input ONLY if replacing, so it functions as a "Clear Roster" action
    if (!replaceMode && !csvData.trim()) return;

    setIsImporting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const result = await importPlayers(importingTeam.id, csvData, token, replaceMode);

      if (result.success) {
        if ((result.count ?? 0) > 0) {
          toast({
            title: "Importación Exitosa",
            description: `Se han importado ${result.count} jugadores a ${importingTeam.name}.`,
          });
          setImportingTeam(null);
          router.refresh();
        } else if (replaceMode && !csvData.trim()) {
          toast({
            title: "Roster Eliminado",
            description: `Se han borrado los jugadores de ${importingTeam.name}.`,
          });
          setImportingTeam(null);
          router.refresh();
        } else {
          toast({
            title: "Atención",
            description: "El proceso terminó pero no se detectaron jugadores. Verifique el formato.",
          });
        }
      }
    } catch (error) {
      console.error("Client import error:", error);
      toast({
        variant: "destructive",
        title: "Error de Importación",
        description: "Hubo un problema al procesar los datos. Revise la consola.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleEditClick = (player: any) => {
    setEditingPlayerId(player.id);
    setEditForm({
      number: player.number.toString(),
      name: player.name,
      role: player.role,
      placeOfBirth: player.placeOfBirth
    });
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPlayerId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      await updatePlayer(editingPlayerId, {
        number: parseInt(editForm.number) || 0,
        name: editForm.name,
        role: editForm.role,
        placeOfBirth: editForm.placeOfBirth
      }, token);
      toast({ title: "Jugador actualizado" });
      setEditingPlayerId(null);
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error al actualizar", description: "Intente nuevamente" });
    }
  };

  return (
    <Card className="border-primary/10 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.5)] bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-primary/5 bg-primary/5">
        <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
          <span className="text-primary">👥</span> Equipos Participantes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
          {teams.map((team) => (
            <AccordionItem value={`item-${team.id}`} key={team.id} className="border-b border-primary/5 last:border-0">
              <AccordionTrigger className="px-6 hover:no-underline hover:bg-primary/5 transition-colors group">
                <span className="text-lg font-bold group-data-[state=open]:text-primary transition-colors uppercase tracking-tight">
                  {team.name}
                </span>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="px-6 py-6 space-y-6 bg-primary/[0.02]">
                  {team.players.length > 0 ? (
                    <div className="rounded-xl border border-primary/10 bg-background/50 overflow-hidden shadow-inner">
                      <ul className="divide-y divide-primary/5">
                        {[...team.players]
                          .sort((a, b) => {
                            const aStaff = isStaff(a.role);
                            const bStaff = isStaff(b.role);
                            
                            // 1. Separate players and staff
                            if (aStaff && !bStaff) return 1;
                            if (!aStaff && bStaff) return -1;
                            
                            // 2. If both are staff, sort by hierarchy rank
                            if (aStaff && bStaff) {
                              const aRank = getStaffRank(a.role);
                              const bRank = getStaffRank(b.role);
                              if (aRank !== bRank) return aRank - bRank;
                            }
                            
                            // 3. Finally, sort by uniform number
                            return a.number - b.number;
                          })
                          .map((player, index, arr) => {
                          const isFirstStaff = index > 0 && isStaff(player.role) && !isStaff(arr[index - 1].role);

                          return (
                            <Fragment key={player.id}>
                              {isFirstStaff && (
                                <li className="bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                                  Staff Técnico
                                </li>
                              )}
                              <li className="px-4 py-3 flex items-center gap-3 group/item hover:bg-primary/5 transition-colors">
                                {editingPlayerId === player.id ? (
                                  <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-left-2 duration-300">
                                    <Input
                                      className="w-16 h-8 text-xs bg-background/50 font-bold border-primary/20 focus:border-primary"
                                      value={editForm.number}
                                      onChange={e => setEditForm({ ...editForm, number: e.target.value })}
                                      placeholder="#"
                                    />
                                    <Input
                                      className="flex-1 h-8 text-xs bg-background/50 font-bold border-primary/20 focus:border-primary"
                                      value={editForm.name}
                                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                      placeholder="Nombre"
                                    />
                                    <Input
                                      className="w-24 h-8 text-xs bg-background/50 border-primary/20 focus:border-primary"
                                      value={editForm.role}
                                      onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                      placeholder="Pos"
                                    />
                                    <Input
                                      className="w-24 h-8 text-xs bg-background/50 border-primary/20 focus:border-primary"
                                      value={editForm.placeOfBirth}
                                      onChange={e => setEditForm({ ...editForm, placeOfBirth: e.target.value })}
                                      placeholder="País"
                                    />
                                    <div className="flex gap-1">
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10" onClick={handleSaveEdit}>
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={handleCancelEdit}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <span className="w-8 text-sm font-black text-primary/60 font-mono">
                                      {player.number === 0 ? "-" : `#${player.number}`}
                                    </span>
                                    <div className="flex-1">
                                      <p className="text-sm font-bold tracking-tight">{player.name}</p>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{player.role} • {player.placeOfBirth}</p>
                                    </div>
                                    {isAdmin && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-all hover:bg-primary/10 hover:text-primary"
                                        onClick={() => handleEditClick(player)}
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </li>
                            </Fragment>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <div className="py-12 text-center rounded-xl border-2 border-dashed border-primary/10">
                      <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                        El roster de jugadores se cargará pronto
                      </p>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex justify-start gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenImport(team)}
                        className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-[11px] font-bold uppercase tracking-wider"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Agregar Jugadores
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2 text-[11px] font-bold uppercase tracking-wider bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Reemplazar Roster
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-primary/20 shadow-2xl bg-card/95 backdrop-blur-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-black uppercase tracking-tighter">¿ESTÁS SEGURO?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium">
                              Esto borrará todos los jugadores actuales de este equipo y los reemplazará con la nueva lista.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-bold uppercase tracking-widest text-[10px]">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="font-bold uppercase tracking-widest text-[10px] bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => {
                                setReplaceMode(true);
                                handleOpenImport(team);
                              }}
                            >
                              Continuar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      {onNavigate && (
        <CardFooter className="flex justify-end p-6 border-t border-primary/5 bg-primary/[0.01]">
          <Button
            variant="secondary"
            onClick={onNavigate}
            className="font-bold uppercase tracking-widest text-[11px] hover:translate-y-[-2px] transition-transform"
          >
            Regresar al Menú
          </Button>
        </CardFooter>
      )}

      <Dialog open={!!importingTeam} onOpenChange={(open) => {
        if (!open) {
          setImportingTeam(null);
          setReplaceMode(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px] border-primary/20 shadow-2xl bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              Importar Jugadores - <span className="text-primary">{importingTeam?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-wide font-medium">
              El sistema detectará automáticamente los datos desde CSV o formato de lista.
              <br />
              <span className="text-primary/60 font-mono mt-1 block">Ej: 21, SOSA LOYOLA, MARTIN JORGE...</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder={`TEAM FINCA JUJURE (VEN)\nUNIFORME N°, APELLIDOS, NOMBRES...\n21, SOSA LOYOLA, MARTIN JORGE, INFIELDER, VENEZUELA`}
              className="h-[250px] font-mono text-sm bg-background/50 border-primary/10 focus:border-primary ring-offset-transparent"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setImportingTeam(null)} className="font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
            <Button onClick={handleImport} disabled={isImporting || (!replaceMode && !csvData.trim())} className="font-bold uppercase tracking-widest text-[10px]">
              {isImporting ? "Procesando..." : replaceMode && !csvData.trim() ? "Borrar Roster Actual" : "Confirmar Importación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
