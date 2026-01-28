import { Calendar } from "@/components/ui/calendar";
import { ColorCard } from "@/components/pdv/ColorCard";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SaleDateSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date | undefined) => void;
    onUseToday: () => void;
}

export function SaleDateSelector({ selectedDate, onDateChange, onUseToday }: SaleDateSelectorProps) {
    const isSelectedToday = isToday(selectedDate);
    const isRetroactive = isBefore(startOfDay(selectedDate), startOfDay(new Date()));

    return (
        <ColorCard tone="indigo">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-base font-semibold tracking-tight">Data da Venda</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isSelectedToday ? "Venda de hoje" : "Venda retroativa"}
                        </p>
                    </div>
                    <CalendarIcon className="h-5 w-5 text-primary" />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button
                        variant={isSelectedToday ? "default" : "outline"}
                        className={cn(
                            "h-14 rounded-2xl transition-all",
                            isSelectedToday && "ring-2 ring-primary shadow-glow-orange"
                        )}
                        onClick={onUseToday}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-semibold">Hoje</span>
                        </div>
                    </Button>

                    <Button
                        variant={!isSelectedToday ? "default" : "outline"}
                        className={cn(
                            "h-14 rounded-2xl transition-all",
                            !isSelectedToday && "ring-2 ring-primary shadow-glow-orange"
                        )}
                        onClick={() => {
                            // Seleciona ontem como exemplo de data retroativa
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            onDateChange(yesterday);
                        }}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span className="text-xs font-semibold">Outra Data</span>
                        </div>
                    </Button>
                </div>

                {/* Calendar */}
                <div className="rounded-2xl border bg-background/70 p-4">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={onDateChange}
                        disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                        locale={ptBR}
                        className="rounded-xl w-full"
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                            month: "space-y-4 w-full",
                            caption: "flex justify-center pt-1 relative items-center mb-2",
                            caption_label: "text-base font-semibold",
                            nav: "space-x-1 flex items-center",
                            nav_button: cn(
                                "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md hover:bg-accent"
                            ),
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse",
                            head_row: "flex w-full",
                            head_cell: "text-muted-foreground rounded-md flex-1 font-medium text-sm",
                            row: "flex w-full mt-1",
                            cell: "flex-1 text-center text-sm p-0 relative",
                            day: cn(
                                "h-11 w-11 mx-auto p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                            ),
                            day_range_end: "day-range-end",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold",
                            day_today: "bg-accent text-accent-foreground font-bold ring-2 ring-primary",
                            day_outside: "day-outside text-muted-foreground opacity-30",
                            day_disabled: "text-muted-foreground opacity-30 line-through",
                            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                            day_hidden: "invisible",
                        }}
                    />
                </div>

                {/* Selected Date Display */}
                <div className="mt-4 rounded-2xl border bg-background/70 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Data selecionada</p>
                            <p className="text-sm font-semibold mt-1">
                                {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                        </div>
                        {isRetroactive && !isSelectedToday && (
                            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1">
                                <CalendarIcon className="h-3 w-3 text-orange-500" />
                                <span className="text-[10px] font-semibold text-orange-500">RETROATIVA</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Message */}
                {isRetroactive && !isSelectedToday && (
                    <div className="mt-3 rounded-xl bg-orange-50 border border-orange-200 p-3">
                        <p className="text-xs text-orange-900">
                            <strong>💡 Venda retroativa:</strong> Esta venda será registrada com a data selecionada.
                            Útil para lançar vendas que foram esquecidas ou feitas offline.
                        </p>
                    </div>
                )}
            </div>
        </ColorCard>
    );
}
