import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
    const { data: stats, isLoading: loading, refetch: refresh } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

            // Fetch stats parallel
            const [
                { data: todaySales },
                { data: monthSales },
                { data: profile },
                { data: workedDays }
            ] = await Promise.all([
                supabase.from("sales").select("total, payment_method").gte("created_at", today.toISOString()),
                supabase.from("sales").select("total, payment_method").gte("created_at", firstDayOfMonth.toISOString()),
                supabase.from("profiles").select("*").eq("id", user.id).single(),
                supabase.from("delivery_work_days").select("work_date").eq("user_id", user.id).gte("work_date", firstDayOfMonth.toISOString().split("T")[0])
            ]);

            if (!todaySales || !monthSales || !profile) {
                return {
                    faturamentoHoje: 0,
                    vendasHoje: 0,
                    totalMes: 0,
                    ticketMedio: 0,
                    custosMes: 0,
                    lucroMes: 0,
                };
            }

            const fHoje = todaySales.reduce((acc, s) => acc + Number(s.total), 0);
            const fMes = monthSales.reduce((acc, s) => acc + Number(s.total), 0);
            const vHoje = todaySales.length;

            // Card Fees
            const cardFees = monthSales.reduce((acc, s) => {
                if (s.payment_method === "Crédito") return acc + (Number(s.total) * (Number(profile.card_rate_credit) / 100));
                if (s.payment_method === "Débito") return acc + (Number(s.total) * (Number(profile.card_rate_debit) / 100));
                return acc;
            }, 0);

            // Delivery Costs
            const deliveryCosts = Array.isArray(workedDays) ? workedDays.length * Number(profile.delivery_daily_cost_brl) : 0;
            const totalCustos = cardFees + deliveryCosts;

            return {
                faturamentoHoje: fHoje,
                vendasHoje: vHoje,
                totalMes: fMes,
                ticketMedio: vHoje > 0 ? fHoje / vHoje : 0,
                custosMes: totalCustos,
                lucroMes: fMes - totalCustos,
            };
        },
        staleTime: 1000 * 30, // 30 seconds cache for dashboard
    });

    const defaultStats = {
        faturamentoHoje: 0,
        vendasHoje: 0,
        totalMes: 0,
        ticketMedio: 0,
        custosMes: 0,
        lucroMes: 0,
    };

    return { ...(stats || defaultStats), loading, refresh };
}
