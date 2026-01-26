import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { parseISO, format } from "date-fns";

export function useDeliveryTracking() {
    const [workedDays, setWorkedDays] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkedDays = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("delivery_work_days")
            .select("work_date")
            .eq("user_id", user.id);

        if (!error && data) {
            setWorkedDays(data.map((d: any) => parseISO(d.work_date)));
        }
        setLoading(false);
    };

    const toggleDay = async (date: Date) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const dateStr = format(date, "yyyy-MM-dd");
        const exists = workedDays.some(d => format(d, "yyyy-MM-dd") === dateStr);

        if (exists) {
            await supabase
                .from("delivery_work_days")
                .delete()
                .eq("user_id", user.id)
                .eq("work_date", dateStr);

            setWorkedDays(prev => prev.filter(d => format(d, "yyyy-MM-dd") !== dateStr));
        } else {
            await supabase
                .from("delivery_work_days")
                .insert({ user_id: user.id, work_date: dateStr });

            setWorkedDays(prev => [...prev, date]);
        }
    };

    useEffect(() => {
        fetchWorkedDays();
    }, []);

    return { workedDays, loading, toggleDay, refresh: fetchWorkedDays };
}
