"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Trophy, Award as AwardIcon, Star, User, Shield, Upload, ClipboardList, Trash2 } from "lucide-react";
import { getAwards, saveAward, importAwardsFromTxt, clearAwards } from "@/actions/awards";
import type { Award } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AwardsSectionProps {
    isAdmin?: boolean;
}

export default function AwardsSection({ isAdmin }: AwardsSectionProps) {
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Award>>({});
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importText, setImportText] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadAwards();
    }, []);

    async function loadAwards() {
        setLoading(true);
        try {
            const data = await getAwards();
            setAwards(data);
        } catch (error) {
            console.error("Failed to load awards", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (category: 'ronda_inicial' | 'partido_final', title: string) => {
        const award = awards.find(a => a.category === category && a.title === title);
        const form = editForm;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            await saveAward({
                id: award?.id,
                category,
                title,
                playerName: form.playerName || "",
                teamName: form.teamName || "",
                description: form.description || "",
                token: session?.access_token
            });
            toast({ title: "Premio guardado con éxito" });
            setEditingId(null);
            loadAwards();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error al guardar", description: error.message });
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            await importAwardsFromTxt(importText, session?.access_token);
            toast({ title: "Premios importados con éxito" });
            setIsImportOpen(false);
            setImportText("");
            loadAwards();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error al importar", description: error.message });
        } finally {
            setIsImporting(false);
        }
    };

    const handleDeleteAll = async () => {
        setIsDeleting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            await clearAwards(session?.access_token);
            toast({ title: "Todos los premios han sido eliminados" });
            setIsDeleteConfirmOpen(false);
            loadAwards();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error al eliminar", description: error.message });
        } finally {
            setIsDeleting(false);
        }
    };

    const renderAward = (category: 'ronda_inicial' | 'partido_final', title: string, defaultDesc: string) => {
        const award = awards.find(a => a.category === category && a.title === title);

        // Loading state
        if (loading) {
            return (
                <div key={`${category}-${title}-loading`} className="p-6 rounded-2xl bg-zinc-900/30 border border-primary/5 animate-pulse min-h-[140px] flex items-center gap-6 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-primary/20" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="h-6 bg-primary/10 rounded-md w-[40%]" />
                        <div className="space-y-2">
                            <div className="h-4 bg-primary/5 rounded-md w-[60%]" />
                            <div className="h-3 bg-primary/5 rounded-md w-[30%]" />
                        </div>
                    </div>
                </div>
            )
        }

        // Admin fallback only if not loading
        if (!award && isAdmin) {
            return (
                <div key={`${category}-${title}-error`} className="p-4 border border-red-500/50 rounded-xl bg-red-500/10 mb-4 animate-in fade-in duration-500">
                    <p className="text-red-400 font-bold text-xs uppercase">Datos no encontrados</p>
                    <p className="text-red-300 text-[10px]">Buscando: {title} ({category})</p>
                </div>
            )
        }

        const isEditing = editingId === (award?.id || -1) || (editingId === 0 && !award && editForm.title === title);

        return (
            <div key={`${category}-${title}`} className="relative group p-4 sm:p-6 rounded-2xl bg-zinc-900/50 border border-primary/10 hover:border-primary/30 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="p-4 rounded-xl bg-primary/10 text-primary">
                        {title.includes('MVP') ? <Trophy className="w-8 h-8" /> :
                            title.includes('BATEADOR') ? <Star className="w-8 h-8" /> :
                                title.includes('LANZADOR') ? <AwardIcon className="w-8 h-8" /> :
                                    <Shield className="w-8 h-8" />}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h4 className="font-black text-lg uppercase tracking-tight text-white">{title}</h4>
                            {isAdmin && !isEditing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setEditingId(award?.id || 0);
                                        setEditForm(award || { category, title, playerName: '', teamName: '', description: defaultDesc });
                                    }}
                                    className="h-7 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Editar
                                </Button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60">Nombre del Jugador</Label>
                                    <Input
                                        value={editForm.playerName}
                                        onChange={e => setEditForm({ ...editForm, playerName: e.target.value })}
                                        className="bg-black/50 border-primary/20 h-9 font-bold"
                                        placeholder="Ingrese nombre..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60">Equipo</Label>
                                    <Input
                                        value={editForm.teamName}
                                        onChange={e => setEditForm({ ...editForm, teamName: e.target.value })}
                                        className="bg-black/50 border-primary/20 h-9 font-bold"
                                        placeholder="Ingrese equipo..."
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-primary/60">Descripción</Label>
                                    <Input
                                        value={editForm.description}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        className="bg-black/50 border-primary/20 h-9 font-bold"
                                        placeholder="Ingrese descripción..."
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
                                    <Button size="sm" onClick={() => handleSave(category, title)} className="font-bold uppercase tracking-widest text-[10px]">Guardar</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary/60" />
                                        <span className={`font-black text-xl uppercase tracking-tighter ${award?.playerName ? 'text-primary' : 'text-primary/20'}`}>
                                            {award?.playerName || "Nombre del Jugador"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-primary/60" />
                                        <span className={`font-bold text-sm uppercase tracking-widest ${award?.teamName ? 'text-muted-foreground' : 'text-muted-foreground/20'}`}>
                                            {award?.teamName || "Nombre del Equipo"}
                                        </span>
                                    </div>
                                </div>
                                {title === 'ALL THE SHOW TEAM' && award?.description && award.description.includes('|') ? (
                                    <div className="mt-8 w-full max-w-3xl bg-zinc-950/50 rounded-xl overflow-hidden border border-primary/10">
                                        <div className="divide-y divide-primary/5">
                                           {award.description.split('\n').filter(l => l.trim()).map((line, idx) => {
                                              const parts = line.split('|').map(p => p.trim());
                                              const equipo = parts.length > 1 ? parts[0] : '';
                                              const jugador = parts.length > 1 ? parts[1] : line;
                                              const posicion = parts.length > 2 ? parts[2] : '';
                                              
                                              return (
                                                <div key={idx} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/[0.02] transition-colors group gap-2">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="font-black text-sm sm:text-base uppercase tracking-tighter text-primary group-hover:text-primary/90 transition-colors drop-shadow-sm">
                                                            {jugador}
                                                        </span>
                                                        {equipo && (
                                                            <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-muted-foreground/60">
                                                                {equipo}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {posicion && (
                                                        <div className="opacity-70 group-hover:opacity-100 transition-opacity text-right">
                                                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                                                                {posicion}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                              );
                                           })}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-2 text-xs font-medium text-muted-foreground/80 italic border-l-2 border-primary/10 pl-3 leading-relaxed whitespace-pre-line">
                                        {award?.description || defaultDesc}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-12 py-4">
            {isAdmin && (
                <div className="flex flex-row items-center justify-end gap-3 pr-2">
                    <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="bg-black/40 border-primary/40 hover:border-primary/60 hover:bg-primary/5 text-white font-black uppercase tracking-widest text-[11px] h-11 sm:h-10 px-5 rounded-xl transition-all shadow-2xl border-2 group/btn gap-2"
                            >
                                <Upload className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
                                IMPORTAR TXT
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl border-primary/20 bg-zinc-950/95 backdrop-blur-md text-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <ClipboardList className="w-6 h-6 text-primary" />
                                    Importar Premios
                                </DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <Textarea
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    placeholder={`Pega el contenido del archivo TXT aquí...`}
                                    className="h-[300px] font-mono text-xs bg-black/50 border-primary/20 focus:border-primary/50 text-white placeholder:text-muted-foreground/50"
                                />
                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/10">
                                    <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">
                                        Formato: CATEGORIA | TITULO | JUGADOR | EQUIPO | DESC
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsImportOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white">Cancelar</Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={isImporting || !importText.trim()}
                                    className="text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {isImporting ? "Procesando..." : "Importar Premios"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400 font-black uppercase tracking-widest text-[11px] h-11 sm:h-10 px-5 rounded-xl transition-all shadow-2xl border-2 gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                BORRAR PREMIOS
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-red-500/20 bg-zinc-950/95 backdrop-blur-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase tracking-tighter text-red-500 flex items-center gap-2">
                                    <Trash2 className="w-5 h-5" />
                                    ¿Borrar todos los premios?
                                </DialogTitle>
                            </DialogHeader>
                            <div className="py-4 text-sm text-muted-foreground font-bold">
                                Esta acción eliminará permanentemente todos los premios registrados (Ronda Inicial y Final). Esta acción no se puede deshacer.
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)} className="font-bold uppercase tracking-widest text-xs">Cancelar</Button>
                                <Button
                                    onClick={handleDeleteAll}
                                    disabled={isDeleting}
                                    variant="destructive"
                                    className="font-bold uppercase tracking-widest text-xs gap-2"
                                >
                                    {isDeleting ? "Borrando..." : "Confirmar Borrado"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <section className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-primary/20" />
                    <h3 className="font-black text-2xl uppercase tracking-tighter text-white flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-primary" />
                        Ronda Inicial
                    </h3>
                    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-primary/20" />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {renderAward('ronda_inicial', 'MEJOR BATEADOR DEL TORNEO', 'Se otorga al jugador con el mejor desempeño ofensivo (Ronda Inicial).')}
                    {renderAward('ronda_inicial', 'ALL THE SHOW TEAM', 'Jugadores seleccionados para conformar el equipo ideal del torneo (Ronda Inicial).')}
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-primary/20" />
                    <h3 className="font-black text-2xl uppercase tracking-tighter text-white flex items-center gap-3">
                        <Star className="w-6 h-6 text-primary" />
                        Partido Final
                    </h3>
                    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-primary/20" />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {renderAward('partido_final', 'JUGADOR MVP', 'Se otorga al atleta más determinante del juego final.')}
                </div>
            </section>
        </div>
    );
}
