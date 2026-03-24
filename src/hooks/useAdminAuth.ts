
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = "cjlacout.antigravity@gmail.com";

export function useAdminAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();

    // Check if ?admin=true is in the URL
    const showAdminPanel = searchParams.get("admin") === "true";

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("[AUTH] Initial session check:", session?.user?.email || "None");
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[AUTH] Auth state changed: ${event}. User: ${session?.user?.email || "None"}`);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const isAdmin = user?.email === ADMIN_EMAIL;

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return {
        user,
        isAdmin,
        showAdminPanel,
        loading,
        logout
    };
}
