import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    data_reset_count: number;
};

export function useProfile() {
    const queryClient = useQueryClient();

    const { data: profile, isLoading: loading, refetch: refresh } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) throw error;
            return data as Profile;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    const mutation = useMutation({
        mutationFn: async (updates: Partial<Profile>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", user.id);

            if (error) throw error;
            return updates;
        },
        onSuccess: (updates) => {
            // Optimistic update
            queryClient.setQueryData(["profile"], (old: Profile | undefined) =>
                old ? { ...old, ...updates } : old
            );
        },
    });

    return {
        profile: profile || null,
        loading,
        updateProfile: mutation.mutateAsync,
        refresh
    };
}
