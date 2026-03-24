"use client";

import Image from "next/image";
import { useEffect } from "react";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";

interface TournamentFooterProps {
    onReset: () => void;
    isAdmin?: boolean;
}

export default function TournamentFooter({ onReset, isAdmin = false }: TournamentFooterProps) {
    // Fail-safe keyboard shortcut
    useEffect(() => {
        if (!isAdmin) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
                console.log("[FOOTER] Keyboard shortcut Ctrl+Alt+R detected");
                onReset();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAdmin, onReset]);

    return (
        <footer className="mt-auto py-10 flex flex-col items-center justify-center gap-6 text-center bg-gradient-to-t from-primary/5 to-transparent border-t border-primary/10">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <Image
                        src="/images/sponsor-logo.png"
                        alt="Developer Branding"
                        width={280}
                        height={70}
                        className="relative transition-all duration-500 hover:scale-105"
                        priority
                    />
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-px bg-primary/20" />
                        <p className="text-primary/60 uppercase tracking-[0.2em] text-[11px] font-black italic">
                            desarrollado por Cristian Lacout
                        </p>
                        <div className="w-12 h-px bg-primary/20" />
                    </div>

                    <FeedbackDialog />

                    {isAdmin && (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("[FOOTER] Reiniciar button clicked");
                                    onReset();
                                }}
                                className="group flex items-center gap-3 text-[11px] text-white/40 hover:text-white bg-white/5 hover:bg-destructive transition-all duration-300 font-bold uppercase tracking-[0.2em] px-8 py-3 rounded-xl border border-white/10 hover:border-white/20 cursor-pointer relative z-[9999] shadow-2xl active:scale-95"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive group-hover:bg-white animate-pulse" />
                                Reiniciar Sistema
                            </button>
                            <p className="text-[8px] text-muted-foreground/30 uppercase tracking-widest">
                                Shortcut: Ctrl + Alt + R
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
}
