// Script de Verificação de Exclusão
// Execute este código no console do navegador (F12) para verificar se os dados foram realmente excluídos

import { supabase } from './src/lib/supabase';

// Verificar Produtos
async function verificarProdutos() {
    const { data, error } = await supabase
        .from('products')
        .select('*');

    console.log('📦 Produtos no banco:', data?.length || 0);
    console.log('Produtos:', data);
    if (error) console.error('Erro:', error);
}

// Verificar Vendas
async function verificarVendas() {
    const { data, error } = await supabase
        .from('sales')
        .select('*');

    console.log('💰 Vendas no banco:', data?.length || 0);
    console.log('Vendas:', data);
    if (error) console.error('Erro:', error);
}

// Verificar Despesas
async function verificarDespesas() {
    const { data, error } = await supabase
        .from('expenses')
        .select('*');

    console.log('💸 Despesas no banco:', data?.length || 0);
    console.log('Despesas:', data);
    if (error) console.error('Erro:', error);
}

// Executar todas as verificações
async function verificarTudo() {
    console.log('🔍 Iniciando verificação...\n');
    await verificarProdutos();
    console.log('\n');
    await verificarVendas();
    console.log('\n');
    await verificarDespesas();
    console.log('\n✅ Verificação concluída!');
}

// Executar
verificarTudo();
