import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { subDays } from "date-fns";

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

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let startDate: Date;
            let endDate: Date;
            const now = new Date();

            switch (period) {
                case "yesterday":
                    const yesterday = subDays(now, 1);
                    startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
                    endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
                    break;
                case "today":
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                    break;
                case "year":
                    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
                    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                    break;
                case "custom":
                    if (customRange?.from && customRange?.to) {
                        const from = customRange.from;
                        const to = customRange.to;
                        startDate = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0);
                        endDate = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999);
                    } else {
                        // Fallback to month
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                    }
                    break;
                case "month":
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                    break;
            }

            // 1. Fetch sales in range - include items and product cost
            // We need to join with sale_items to get product cost at sale time if stored, 
            // or we might need to fetch items separately if join is complex with current types.
            // Let's fetch sales first, then items for these sales.
            const { data: sales, error: salesError } = await supabase
                .from("sales")
                .select("id, total, payment_method, created_at")
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            if (salesError) {
                console.error("Error fetching sales stats:", salesError);
                throw salesError;
            }

            // 1.1 Fetch sale items for these sales to get product costs
            // Assuming sale_items has price_at_sale (sell price). 
            // To get COST, we need to join with products table OR if we stored cost in sale_items.
            // The user wants "product costs". Assuming product table has 'cost_price'.
            const saleIds = sales?.map(s => s.id) || [];

            let productCosts = 0;
            if (saleIds.length > 0) {
                const { data: saleItems } = await supabase
                    .from("sale_items")
                    .select(`
                        qty,
                        product_id,
                        products (
                            cost_price
                        )
                    `)
                    .in("sale_id", saleIds);

                if (saleItems) {
                    productCosts = saleItems.reduce((acc, item) => {
                        // @ts-ignore - Supabase join typing can be tricky
                        const unitCost = Number(item.products?.cost_price || 0);
                        return acc + (unitCost * item.qty);
                    }, 0);
                }
            }

            // 2. Fetch profile for rates
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            // 3. Fetch worked days
            const { data: workedDays } = await supabase
                .from("delivery_work_days")
                .select("work_date")
                .eq("user_id", user.id)
                .gte("work_date", startDate.toISOString().split("T")[0])
                .lte("work_date", endDate.toISOString().split("T")[0]);

            // 4. Fetch expenses
            const { data: expenses, error: expensesError } = await supabase
                .from("expenses")
                .select("amount, date")
                .gte("date", startDate.toISOString())
                .lte("date", endDate.toISOString());

            if (expensesError) {
                console.error("Erro ao buscar despesas:", expensesError);
            }

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

                // Calculate Manual Expenses
                const manualExpenses = Array.isArray(expenses)
                    ? expenses.reduce((acc, e) => acc + Number(e.amount), 0)
                    : 0;

                const totalCosts = cardFees + deliveryCosts + manualExpenses + productCosts;

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
        } catch (error) {
            console.error("Error in useFilteredStats:", error);
        } finally {
            setLoading(false);
        }
    }, [period, customRange]);

    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchStats]);

    return { ...stats, loading, refresh: fetchStats };
}
