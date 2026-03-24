
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Lock, LogOut, User as UserIcon, ShieldCheck } from "lucide-react";

interface AdminAuthPanelProps {
    user: any;
    isAdmin: boolean;
    showAdminPanel: boolean;
    onLogout: () => void;
}

export default function AdminAuthPanel({ user, isAdmin, showAdminPanel, onLogout }: AdminAuthPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user?.email !== "cjlacout.antigravity@gmail.com") {
                await supabase.auth.signOut();
                throw new Error("Esta cuenta no tiene permisos de administrador.");
            }

            toast({
                title: "Acceso Concedido",
                description: "Has iniciado sesión como administrador.",
            });
            setIsOpen(false);
        } catch (error: any) {
            console.error("Login error:", error);
            toast({
                variant: "destructive",
                title: "Error de Acceso",
                description: error.message || "Credenciales incorrectas o acceso denegado.",
            });
        } finally {
            setLoading(false);
        }
    };

    // If fully public (no ?admin=true and not logged in), show nothing
    if (!showAdminPanel && !isAdmin) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
            {isAdmin ? (
                <div className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-2xl border border-primary-foreground/20 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Panel Admin Activo</span>
                    </div>
                    <div className="h-4 w-[1px] bg-primary-foreground/20" />
                    <button
                        onClick={onLogout}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            ) : showAdminPanel ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="default"
                    size="sm"
                    className="rounded-full shadow-xl gap-2 font-bold uppercase tracking-widest text-[10px] px-6 py-5"
                >
                    <Lock className="w-3 h-3" />
                    Acceso Administrador
                </Button>
            ) : null}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[400px] bg-card border-primary/10 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Iniciar Sesión
                        </DialogTitle>
                        <DialogDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground/60 leading-relaxed">
                            Solo personal autorizado<br />The Show Pro Series
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleLogin} className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-primary/5 border-primary/10 focus:border-primary/30 transition-all rounded-xl py-6"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-primary/5 border-primary/10 focus:border-primary/30 transition-all rounded-xl py-6"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full font-black uppercase tracking-[0.2em] text-xs py-6 rounded-xl shadow-lg shadow-primary/20"
                            >
                                {loading ? "Verificando..." : "Entrar al Sistema"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
