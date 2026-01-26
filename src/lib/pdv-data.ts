export type PaymentMethod = "PIX" | "Crédito" | "Débito" | "Dinheiro";

export type PdvProduct = {
  id: string;
  name: string;
  price: number;
  cost?: number;
};

export const sampleProducts: PdvProduct[] = [
  { id: "cafe", name: "Café", price: 5.0 },
  { id: "pao", name: "Pão de queijo", price: 7.5 },
  { id: "suco", name: "Suco", price: 9.9 },
  { id: "marmita", name: "Marmita", price: 22.0 },
];

export const paymentMethods: PaymentMethod[] = ["PIX", "Crédito", "Débito", "Dinheiro"];

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
