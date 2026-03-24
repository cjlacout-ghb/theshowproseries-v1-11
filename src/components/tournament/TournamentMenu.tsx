"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Calendar, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";


type ViewType = 'menu' | 'teams' | 'games' | 'standings' | 'leaders';

interface MenuItem {
    id: ViewType;
    label: string;
    icon: string;
}

const menuItems: MenuItem[] = [
    { id: 'teams', label: 'Equipos y Jugadores', icon: '👥' },
    { id: 'games', label: 'Partidos y Resultados', icon: '⚾' },
    { id: 'standings', label: 'Tabla de Posiciones', icon: '📊' },
    { id: 'leaders', label: 'Panel de Líderes', icon: '🏆' }
];

interface TournamentMenuProps {
    onNavigate: (view: ViewType) => void;
}

export default function TournamentMenu({ onNavigate }: TournamentMenuProps) {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLDivElement>(null);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => {
        setZoom(prev => {
            const next = Math.max(prev - 0.25, 1);
            if (next === 1) setPosition({ x: 0, y: 0 });
            return next;
        });
    };
    const handleReset = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || zoom <= 1) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 relative z-10">
            {menuItems.map((item) => (
                <Button
                    key={item.id}
                    size="lg"
                    className="group relative h-28 flex flex-col items-center justify-center gap-2 text-[15px] font-black bg-card hover:bg-primary transition-all duration-500 border-2 border-primary/20 hover:border-primary shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_-10px_hsl(var(--primary)/0.3)] hover:-translate-y-2 overflow-hidden"
                    onClick={() => onNavigate(item.id)}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-500">{item.icon}</span>
                    <span className="relative z-10 text-muted-foreground group-hover:text-primary-foreground transition-colors duration-500 uppercase tracking-tight">
                        {item.label}
                    </span>
                </Button>
            ))}

            <Dialog onOpenChange={(open) => { if (!open) handleReset(); }}>
                <DialogTrigger asChild>
                    <Button
                        size="lg"
                        className="group relative h-28 flex flex-col items-center justify-center gap-2 text-[15px] font-black bg-card hover:bg-primary transition-all duration-500 border-2 border-primary/20 hover:border-primary shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_-10px_hsl(var(--primary)/0.3)] hover:-translate-y-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="text-2xl group-hover:scale-110 transition-transform duration-500">📅</span>
                        <span className="relative z-10 text-muted-foreground group-hover:text-primary-foreground transition-colors duration-500 uppercase tracking-tight">
                            Programación
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl w-[95vw] h-[85vh] bg-zinc-950 border-primary/20 p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="p-6 pb-4 border-b border-primary/10 flex flex-row items-center justify-between space-y-0">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-primary">
                            <Calendar className="w-6 h-6" />
                            Detalle de Partidos
                        </DialogTitle>
                        <div className="flex items-center gap-2 pr-8">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleZoomOut}
                                disabled={zoom <= 1}
                                className="h-8 w-8 bg-zinc-900 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <div className="text-[10px] font-bold text-muted-foreground w-12 text-center uppercase tracking-widest">
                                {Math.round(zoom * 100)}%
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleZoomIn}
                                disabled={zoom >= 3}
                                className="h-8 w-8 bg-zinc-900 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleReset}
                                className="h-8 w-8 bg-zinc-900 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div
                        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-black/40"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <div
                            ref={imageRef}
                            className="w-full h-full relative transition-transform duration-200 ease-out flex items-center justify-center p-4"
                            style={{
                                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                                transformOrigin: 'center center'
                            }}
                        >
                            <Image
                                src="/schedule.jpg"
                                alt="Tournament Schedule"
                                fill
                                className="object-contain pointer-events-none select-none"
                                priority
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

    );
}

export type { ViewType };
