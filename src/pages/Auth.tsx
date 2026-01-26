import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MascotAnimated } from "@/components/pdv/MascotAnimated";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [storeName, setStoreName] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Bem-vindo de volta!");
                navigate("/");
            }
        } catch (error: any) {
            toast.error("Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        store_name: storeName,
                    },
                },
            });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Conta criada! Já pode fazer login.");
            }
        } catch (error: any) {
            toast.error("Ocorreu um erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 animate-fade-in">
            <div className="mb-8 flex flex-col items-center">
                <div className="h-40 w-40">
                    <MascotAnimated mode="active" />
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary">PinGoou 2026</h1>
                <p className="text-muted-foreground text-center">Gestão simplificada, design extraordinário.</p>
            </div>

            <Card className="w-full max-w-md rounded-[32px] p-6 shadow-card border-none bg-background/80 backdrop-blur-sm border border-white/10">
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/30 p-1 h-12">
                        <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">Login</TabsTrigger>
                        <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">Cadastro</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="mt-8 space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Seu e-mail"
                                    className="h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary/30"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Sua senha"
                                    className="h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary/30"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full mt-4 h-12" disabled={loading} variant="hero">
                                {loading ? "Processando..." : "Entrar agora"}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="signup" className="mt-8 space-y-4">
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Nome completo"
                                    className="h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary/30"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Nome da sua loja"
                                    className="h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary/30"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="E-mail"
                                    className="h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary/30"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Senha forte (min. 6 caracteres)"
                                    className="h-12 rounded-2xl bg-muted/20 border-none focus-visible:ring-primary/30"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <Button type="submit" className="w-full mt-4 h-12" disabled={loading} variant="hero">
                                {loading ? "Criando sua conta..." : "Finalizar cadastro"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </Card>

            <p className="mt-12 text-[10px] font-medium tracking-widest text-muted-foreground opacity-50 uppercase">
                © 2026 PinGoou Labs • Powered by Supabase
            </p>
        </main>
    );
}
