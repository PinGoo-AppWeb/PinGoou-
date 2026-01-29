import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useDashboardStats() {
    const [stats, setStats] = useState({
        faturamentoHoje: 0,
        vendasHoje: 0,
        totalMes: 0,
        ticketMedio: 0,
        custosMes: 0,
        lucroMes: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

        // 1. Fetch sales
        const { data: todaySales } = await supabase
            .from("sales")
            .select("total, payment_method")
            .gte("created_at", today.toISOString());

        const { data: monthSales } = await supabase
            .from("sales")
            .select("total, payment_method")
            .gte("created_at", firstDayOfMonth.toISOString());

        // 2. Fetch profile for rates and daily cost
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        // 3. Fetch worked days for the month
        const { data: workedDays } = await supabase
            .from("delivery_work_days")
            .select("work_date")
            .eq("user_id", user.id)
            .gte("work_date", firstDayOfMonth.toISOString().split("T")[0]);

        if (todaySales && monthSales && profile) {
            const fHoje = todaySales.reduce((acc, s) => acc + Number(s.total), 0);
            const fMes = monthSales.reduce((acc, s) => acc + Number(s.total), 0);
            const vHoje = todaySales.length;

            // Calculate Card Fees for the month
            const cardFees = monthSales.reduce((acc, s) => {
                if (s.payment_method === "Crédito") {
                    return acc + (Number(s.total) * (Number(profile.card_rate_credit) / 100));
                }
                if (s.payment_method === "Débito") {
                    return acc + (Number(s.total) * (Number(profile.card_rate_debit) / 100));
                }
                return acc;
            }, 0);

            // Calculate Delivery Costs
            const deliveryCosts = Array.isArray(workedDays)
                ? workedDays.length * Number(profile.delivery_daily_cost_brl)
                : 0;

            const totalCustos = cardFees + deliveryCosts;

            setStats({
                faturamentoHoje: fHoje,
                vendasHoje: vHoje,
                totalMes: fMes,
                ticketMedio: vHoje > 0 ? fHoje / vHoje : 0,
                custosMes: totalCustos,
                lucroMes: fMes - totalCustos,
            });
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { ...stats, loading, refresh: fetchStats };
}
