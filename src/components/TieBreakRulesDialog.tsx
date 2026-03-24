"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Info, Scale, Trophy, Hash, UserCircle, Coins } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TieBreakRulesDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
                    aria-label="Ver criterios de desempate"
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                        (*) Criterios de desempate
                    </span>
                    <Info className="w-3.5 h-3.5 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[650px] max-h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl">
                <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Scale className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-foreground">
                                Criterios de Desempate WBSC
                            </DialogTitle>
                            <DialogDescription className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/60">
                                Regulación C11 - Copa Mundial de Sóftbol
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-140px)] overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
                            <p className="bg-primary/5 p-4 rounded-xl border border-primary/10 italic">
                                "La Regla C11 de las Regulaciones del Torneo de la Copa Mundial de Sóftbol de la WBSC establece una jerarquía estricta para resolver los empates en las posiciones después de la ronda de todos contra todos (round-robin)."
                            </p>

                            <p>
                                El determinante principal es el registro de juegos ganados y perdidos de todos los partidos disputados. Si los equipos permanecen empatados, los oficiales aplican <strong>cinco criterios</strong> en un orden específico; en el momento en que un criterio rompe el empate, el proceso se detiene.
                            </p>

                            <div className="pt-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                                    <span className="h-px w-8 bg-primary/30"></span>
                                    Los cinco criterios de desempate
                                    <span className="h-px w-full bg-primary/30 flex-1"></span>
                                </h3>

                                <div className="space-y-4">
                                    <CriterionItem
                                        number="1"
                                        title="Resultados de enfrentamientos directos"
                                        description="El equipo que ganó el juego (o juegos) entre los equipos empatados obtiene la posición más alta."
                                        icon={<Trophy className="w-4 h-4" />}
                                    />

                                    <CriterionItem
                                        number="2"
                                        title="Balance de Calidad del Equipo (TQB)"
                                        description="Si los resultados directos no resuelven la igualdad, se calcula el TQB usando la fórmula:"
                                        formula="(CARRERAS ANOTADAS / ENTRADAS JUGADAS A LA OFENSIVA) – (CARRERAS PERMITIDAS / ENTRADAS JUGADAS A LA DEFENSIVA)"
                                        icon={<Scale className="w-4 h-4" />}
                                    />

                                    <CriterionItem
                                        number="3"
                                        title="Balance de Calidad del Equipo por Carreras Limpias (ER-TQB)"
                                        description="Se aplica la misma fórmula que el TQB, pero utilizando únicamente las carreras limpias."
                                        icon={<Hash className="w-4 h-4" />}
                                    />

                                    <CriterionItem
                                        number="4"
                                        title="Promedio de bateo más alto"
                                        description="Se calcula de forma colectiva considerando los juegos entre los equipos empatados."
                                        icon={<UserCircle className="w-4 h-4" />}
                                    />

                                    <CriterionItem
                                        number="5"
                                        title="Lanzamiento de moneda"
                                        description="Es el último recurso si todas las medidas estadísticas anteriores resultan iguales."
                                        icon={<Coins className="w-4 h-4" />}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 bg-muted/30 border-t border-primary/10 flex justify-end">
                    <DialogTrigger asChild>
                        <button className="px-6 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-[10px] font-black uppercase tracking-widest transition-colors">
                            Entendido
                        </button>
                    </DialogTrigger>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CriterionItem({ number, title, description, formula, icon }: {
    number: string;
    title: string;
    description: string;
    formula?: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex gap-4 p-4 rounded-2xl bg-secondary/20 border border-primary/5 hover:border-primary/20 transition-colors group/item">
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm border border-primary/20 group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all duration-300">
                    {number}
                </div>
                <div className="text-primary/40 group-hover/item:text-primary/100 transition-colors">
                    {icon}
                </div>
            </div>
            <div className="flex-1 space-y-1">
                <h4 className="font-bold text-foreground uppercase tracking-tight text-sm">
                    {title}
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                    {description}
                </p>
                {formula && (
                    <div className="mt-3 p-3 rounded-lg bg-background/50 border border-primary/10 font-mono text-[10px] text-primary font-bold shadow-inner">
                        {formula}
                    </div>
                )}
            </div>
        </div>
    );
}
