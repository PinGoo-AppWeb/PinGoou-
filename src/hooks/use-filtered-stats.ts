import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { startOfMonth, startOfToday, subDays, startOfYear, endOfDay, startOfDay, endOfMonth, endOfYear } from "date-fns";

export type FilterPeriod = "today" | "yesterday" | "month" | "year" | "custom";
export type DateRange = { from: Date; to: Date } | undefined;

export function useFilteredStats(period: FilterPeriod = "month", customRange?: DateRange) {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalSales: 0,
        ticketAverage: 0,
        totalCosts: 0,
        netProfit: 0,
        paymentMix: { credit: 0, debit: 0, pix: 0, cash: 0 },
        deliveryCosts: 0,
        cardFees: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let startDate: Date;
        let endDate: Date;
        const now = new Date();

        switch (period) {
            case "yesterday":
                startDate = startOfDay(subDays(now, 1));
                endDate = endOfDay(subDays(now, 1));
                break;
            case "today":
                startDate = startOfDay(now);
                endDate = endOfDay(now);
                break;
            case "year":
                startDate = startOfYear(now);
                endDate = endOfYear(now);
                break;
            case "custom":
                if (customRange?.from && customRange?.to) {
                    startDate = startOfDay(customRange.from);
                    endDate = endOfDay(customRange.to);
                } else {
                    startDate = startOfMonth(now);
                    endDate = endOfDay(now);
                }
                break;
            case "month":
            default:
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
        }

        // 1. Fetch sales in range
        const { data: sales } = await supabase
            .from("sales")
            .select("total, payment_method, cost_price, created_at")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());

        // 2. Fetch profile for rates
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        // 3. Fetch worked days in range for delivery costs
        // Note: Delivery work days are stored as YYYY-MM-DD
        const { data: workedDays } = await supabase
            .from("delivery_work_days")
            .select("work_date")
            .eq("user_id", user.id)
            .gte("work_date", startDate.toISOString().split("T")[0])
            .lte("work_date", endDate.toISOString().split("T")[0]);

        if (sales && profile) {
            const totalRevenue = sales.reduce((acc, s) => acc + Number(s.total), 0);
            const totalSales = sales.length;

            // Calculate Card Fees
            const cardFees = sales.reduce((acc, s) => {
                if (s.payment_method === "Crédito") {
                    return acc + (Number(s.total) * (Number(profile.card_rate_credit) / 100));
                }
                if (s.payment_method === "Débito") {
                    return acc + (Number(s.total) * (Number(profile.card_rate_debit) / 100));
                }
                return acc;
            }, 0);

            // Mix de Pagamentos
            const mix = { credit: 0, debit: 0, pix: 0, cash: 0 };
            sales.forEach(s => {
                const method = s.payment_method?.toLowerCase() || "";
                if (method.includes("crédito")) mix.credit++;
                else if (method.includes("débito")) mix.debit++;
                else if (method.includes("pix")) mix.pix++;
                else mix.cash++;
            });

            // Calculate Delivery Costs (Diárias)
            const deliveryCosts = Array.isArray(workedDays)
                ? workedDays.length * Number(profile.delivery_daily_cost_brl)
                : 0;

            // TODO: Se tivermos custo do produto no futuro, somar aqui.
            // Atualmente, assumimos custo = taxas + delivery + (custo_produto se houver)
            // Como não buscamos product cost na venda (ainda), usamos zero ou o linkado
            // Mas sales não tem cost_price, products tem. Teria que fazer join.
            // Para simplificar agora, focamos em taxas e delivery.

            const totalCosts = cardFees + deliveryCosts;

            setStats({
                totalRevenue,
                totalSales,
                ticketAverage: totalSales > 0 ? totalRevenue / totalSales : 0,
                totalCosts,
                netProfit: totalRevenue - totalCosts,
                paymentMix: {
                    credit: totalSales > 0 ? Math.round((mix.credit / totalSales) * 100) : 0,
                    debit: totalSales > 0 ? Math.round((mix.debit / totalSales) * 100) : 0,
                    pix: totalSales > 0 ? Math.round((mix.pix / totalSales) * 100) : 0,
                    cash: totalSales > 0 ? Math.round((mix.cash / totalSales) * 100) : 0,
                },
                deliveryCosts,
                cardFees
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
    }, [period, customRange]);

    return { ...stats, loading, refresh: fetchStats };
}
