"use client";

import Image from "next/image";

interface TournamentHeaderProps {
    visible?: boolean;
}

export default function TournamentHeader({ visible = true }: TournamentHeaderProps) {
    if (!visible) return null;

    return (
        <header className="mb-10 pt-16 md:pt-32 flex flex-col md:flex-row items-stretch justify-start gap-4 md:gap-12 transition-all duration-700 animate-in fade-in slide-in-from-top-12">
            <Image
                src="/images/logo.png"
                alt="The Show Pro Series Logo"
                width={240}
                height={240}
                className="w-auto h-32 md:h-48 self-center md:self-auto"
                priority
            />
            <div className="flex flex-col justify-between text-center md:text-left py-1 px-2 md:px-0 w-full overflow-hidden">
                <h1 className="text-4xl md:text-[5rem] font-black tracking-[0.05em] text-primary leading-none drop-shadow-sm">
                    THE SHOW<br className="md:hidden" /><span className="md:inline"> </span>PRO SERIES
                </h1>
                <h2 className="text-sm sm:text-base md:text-[2.1rem] font-black uppercase tracking-[-0.02em] text-primary/90 leading-tight md:leading-none whitespace-normal md:whitespace-nowrap md:pl-4 break-words hyphens-auto">
                    TORNEO INTERNACIONAL<br className="md:hidden" /> DE SOFTBOL MASCULINO
                </h2>
                <p className="text-base md:text-xl text-muted-foreground font-semibold tracking-wide md:pl-4">
                    Paraná, ER - Argentina | 18-21 marzo 2026
                </p>
            </div>
        </header>
    );
}
