# 🔍 Diagnóstico de Problemas de Exclusão

## Problema Reportado
Produtos, vendas e despesas não estão sendo excluídos.

## ✅ Correções Implementadas

### 1. **Logs de Debug Adicionados**
Todos os hooks agora têm logs detalhados:
- `use-products.ts` → `deleteProduct()`
- `use-sales.ts` → `deleteSale()`
- `use-expenses.ts` → `deleteExpense()`

### 2. **Tratamento de Erros Melhorado**
- Try-catch robusto
- Mensagens de erro específicas
- Logs com emojis para fácil identificação

### 3. **UI Melhorada**
- Dialog de confirmação para produtos (antes era `confirm()` nativo)
- Mensagens de toast mais informativas

## 🧪 Como Testar

### Teste 1: Exclusão de Produtos
1. Abra http://localhost:5173/produtos
2. Clique no ícone de lixeira (🗑️) em um produto
3. Confirme a exclusão no dialog
4. Abra o Console do Navegador (F12)
5. Procure por:
   - 🗑️ "Tentando excluir produto"
   - ✅ "Produto excluído com sucesso"
   - ❌ Erros (se houver)

### Teste 2: Exclusão de Vendas
1. Abra http://localhost:5173 (Dashboard)
2. No histórico de vendas, clique no ícone de lixeira
3. Confirme a exclusão
4. Verifique o console para logs

### Teste 3: Exclusão de Despesas
1. Abra http://localhost:5173/despesas
2. Clique no ícone de lixeira (🗑️) em uma despesa
3. Confirme a exclusão
4. Abra o Console do Navegador (F12)
5. Procure por:
   - 🗑️ "Tentando excluir despesa"
   - ✅ "Despesa excluída com sucesso"
   - ❌ Erros (se houver)

## 🔒 Possíveis Causas de Falha

### 1. **RLS (Row Level Security) do Supabase**
Se os logs mostrarem erros como:
```
"new row violates row-level security policy"
```

**Solução**: Verificar políticas RLS no Supabase:
- Tabela `products`: Precisa ter política DELETE para o user_id
- Tabela `sales`: Precisa ter política DELETE para o user_id
- Tabela `sale_items`: Precisa ter política DELETE (ou CASCADE)
- Tabela `expenses`: Precisa ter política DELETE para o user_id

### 2. **Foreign Key Constraints**
Se o erro for:
```
"violates foreign key constraint"
```

**Solução**: A ordem de exclusão está correta:
- Para vendas: Primeiro `sale_items`, depois `sales`
- Para produtos: Verificar se há `sale_items` referenciando o produto

### 3. **Permissões de Autenticação**
Se o erro for:
```
"permission denied"
```

**Solução**: Verificar se o usuário está autenticado:
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log("Usuário autenticado:", user?.id);
```

## 📊 Logs Esperados (Sucesso)

### Exclusão de Produto:
```
🔄 Iniciando exclusão de produto: abc-123-def
🗑️ Tentando excluir produto: abc-123-def
✅ Produto excluído com sucesso
✅ Produto excluído com sucesso no componente
```

### Exclusão de Venda:
```
🗑️ Tentando excluir venda: xyz-789-abc
🔄 Iniciando exclusão da venda: xyz-789-abc
🗑️ Deletando itens da venda...
✅ Itens deletados
🗑️ Deletando venda...
✅ Venda deletada com sucesso
✅ Venda excluída com sucesso
```

### Exclusão de Despesa:
```
🔄 Iniciando exclusão de despesa: def-456-ghi
🗑️ Tentando excluir despesa: def-456-ghi
✅ Despesa excluída com sucesso
✅ Despesa excluída com sucesso no componente
```

## 🛠️ Próximos Passos se Ainda Falhar

1. **Copie os logs do console** e compartilhe
2. **Verifique as políticas RLS** no Supabase Dashboard
3. **Teste com um produto/venda/despesa recém-criado** (para descartar problemas de dados antigos)

## 📝 Arquivos Modificados
- `src/hooks/use-products.ts` - Logs e tratamento de erro
- `src/hooks/use-sales.ts` - Logs e tratamento de erro
- `src/hooks/use-expenses.ts` - Logs e tratamento de erro
- `src/pages/Products.tsx` - Dialog de confirmação
- `src/pages/Dashboard.tsx` - Logs melhorados
- `src/pages/Expenses.tsx` - Logs melhorados
- `src/components/pdv/EditSaleModal.tsx` - Logs e tratamento de erro
