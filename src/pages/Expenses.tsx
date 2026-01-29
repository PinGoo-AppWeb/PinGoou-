import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBRL } from "@/lib/pdv-data";
import { useExpenses, Expense } from "@/hooks/use-expenses";
import { Loader2, Plus, Trash2, Calendar as CalendarIcon, DollarSign, Tag, Pencil, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { value: "insumo", label: "Insumos" },
    { value: "operacional", label: "Operacional" },
    { value: "pessoal", label: "Pessoal" },
    { value: "outros", label: "Outros" },
];

export default function Expenses() {
    const { fetchExpenses, createExpense, deleteExpense, updateExpense, loading } = useExpenses();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("insumo");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const loadData = async () => {
        const data = await fetchExpenses();
        setExpenses(data);
    };

    useEffect(() => {
        loadData();
    }, [fetchExpenses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date) {
            toast.error("Preencha todos os campos");
            return;
        }

        setSubmitting(true);
        // Fix: Create date with explicit time to avoid timezone shifts when filtering
        // We append T12:00:00 to ensure it falls safely in the middle of the "local" day
        // regardless of UTC filtering.
        const dateObj = new Date(date + "T12:00:00");

        let result;

        if (editingId) {
            const success = await updateExpense(editingId, {
                description,
                amount: parseFloat(amount.replace(",", ".")),
                category,
                date: dateObj,
            });
            result = success; // updateExpense returns boolean
        } else {
            result = await createExpense({
                description,
                amount: parseFloat(amount.replace(",", ".")), // Handle simple currency format
                category,
                date: dateObj,
            });
        }

        if (result) {
            toast.success(editingId ? "Despesa atualizada!" : "Despesa registrada!");
            setDescription("");
            setAmount("");
            setDate(format(new Date(), "yyyy-MM-dd"));
            setEditingId(null);
            loadData();
        } else {
            toast.error("Erro ao registrar despesa");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir esta despesa?")) {
            console.log("🔄 Iniciando exclusão de despesa:", id);
            const success = await deleteExpense(id);
            if (success) {
                console.log("✅ Despesa excluída com sucesso no componente");
                toast.success("Despesa removida");
                loadData();
            } else {
                console.error("❌ Falha ao excluir despesa no componente");
                toast.error("Erro ao remover despesa. Verifique o console para mais detalhes.");
            }
        }
    };
    const handleEdit = (expense: Expense) => {
        setEditingId(expense.id);
        setDescription(expense.description);
        setAmount(expense.amount.toString());
        setCategory(expense.category);
        // Extract YYYY-MM-DD from the stored ISO string to populate input correctly
        setDate(expense.date.split("T")[0]);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setDescription("");
        setAmount("");
        setDate(format(new Date(), "yyyy-MM-dd"));
    };

    return (
        <main className="px-4 pb-28 pt-6 animate-fade-in space-y-6">
            <section>
                <h1 className="text-xl font-bold tracking-tight">Despesas</h1>
                <p className="text-sm text-muted-foreground">Gerencie seus custos e compras.</p>
            </section>

            {/* Form Card */}
            <Card className="p-4 rounded-3xl shadow-card dark:shadow-card-dark border-none bg-background/50 backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                            id="description"
                            placeholder="Ex: Compra de Açaí"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="rounded-xl bg-secondary/50 border-none h-12"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor (R$)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-9 rounded-xl bg-secondary/50 border-none h-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Data</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="pl-9 rounded-xl bg-secondary/50 border-none h-12"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="rounded-xl bg-secondary/50 border-none h-12">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        {editingId && (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 rounded-xl flex-1"
                                onClick={handleCancelEdit}
                                disabled={submitting}
                            >
                                <X className="mr-2 h-5 w-5" />
                                Cancelar
                            </Button>
                        )}
                        <Button
                            type="submit"
                            className="flex-1 h-12 rounded-xl text-base font-semibold"
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="animate-spin mr-2" /> : (editingId ? <Pencil className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />)}
                            {editingId ? "Salvar Alterações" : "Registrar Despesa"}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* List */}
            <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Histórico Recente</h2>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground bg-secondary/20 rounded-3xl border border-dashed">
                        <p>Nenhuma despesa registrada.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {expenses.map((expense) => (
                            <Card key={expense.id} className="p-4 flex items-center justify-between rounded-2xl border-none shadow-sm bg-background/60">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center",
                                        expense.category === 'insumo' ? "bg-orange-100 text-orange-600" :
                                            expense.category === 'operacional' ? "bg-blue-100 text-blue-600" :
                                                "bg-gray-100 text-gray-600"
                                    )}>
                                        <Tag className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{expense.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{format(new Date(expense.date), "dd MMM", { locale: ptBR })}</span>
                                            <span>•</span>
                                            <span className="capitalize">{expense.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-red-500 font-mono-numbers">
                                        - {formatBRL(expense.amount)}
                                    </span>
                                    <button
                                        onClick={() => handleEdit(expense)}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(expense.id)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
