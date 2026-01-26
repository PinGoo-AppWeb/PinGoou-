import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Profile = {
    id: string;
    full_name: string | null;
    store_name: string | null;
    haptics_enabled: boolean;
    mascot_sleep_seconds: number;
    monthly_revenue_goal_brl: number | null;
    delivery_fee_brl: number;
    delivery_daily_cost_brl: number;
    card_rate_credit: number;
    card_rate_debit: number;
    avatar_url: string | null;
};

export function useProfile() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (!error && data) {
            setProfile(data);
        }
        setLoading(false);
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id);

        if (!error) {
            setProfile(prev => prev ? { ...prev, ...updates } : null);
            return true;
        }
        return false;
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return { profile, loading, updateProfile, refresh: fetchProfile };
}
