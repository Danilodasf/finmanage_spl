# Instruções de Uso do Banco de Dados - Produto Personal

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto `product-personal` com as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_APP_ENV=development
```

### 2. Estrutura do Banco

O banco de dados do produto Personal possui as seguintes tabelas principais:

- **profiles**: Perfis dos usuários
- **categories**: Categorias de receitas e despesas
- **transactions**: Transações financeiras
- **budgets**: Orçamentos mensais
- **goals**: Metas financeiras
- **investments**: Investimentos

### 3. Aplicação do Schema

Para aplicar o schema do banco de dados, execute os comandos SQL contidos no arquivo `database-schema.md`.

### 4. População de Dados de Teste

Para popular o banco com dados de teste, execute os comandos SQL contidos no arquivo `test-data-population.md`.

## Segurança

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado, garantindo que:
- Usuários só podem acessar seus próprios dados
- Políticas específicas controlam operações de SELECT, INSERT, UPDATE e DELETE

### Políticas de Acesso

Cada tabela possui políticas que verificam se `auth.uid() = user_id`, garantindo isolamento de dados entre usuários.

## Uso no Código

### Configuração do Cliente Supabase

O cliente Supabase é configurado no arquivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = 'https://dvfkxltbwhkrdkuvejue.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Operações Básicas

#### Inserir Transação
```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    description: 'Descrição da transação',
    amount: 100.00,
    type: 'expense',
    date: '2024-01-15',
    category_id: 'uuid-da-categoria'
  })
```

#### Criar Orçamento
```typescript
const { data, error } = await supabase
  .from('budgets')
  .insert({
    category_id: 'uuid-da-categoria',
    amount: 500.00,
    month: 1,
    year: 2024
  })
```

#### Definir Meta Financeira
```typescript
const { data, error } = await supabase
  .from('goals')
  .insert({
    name: 'Viagem de férias',
    target_amount: 5000.00,
    current_amount: 0,
    target_date: '2024-12-31'
  })
```

#### Listar Transações com Categorias
```typescript
const { data, error } = await supabase
  .from('transactions')
  .select(`
    *,
    categories(name, color, icon)
  `)
  .order('date', { ascending: false })
```

#### Relatório de Gastos por Categoria
```typescript
const { data, error } = await supabase
  .from('transactions')
  .select(`
    amount,
    categories(name)
  `)
  .eq('type', 'expense')
  .gte('date', '2024-01-01')
  .lte('date', '2024-01-31')
```

## Funcionalidades Específicas

### Controle de Orçamento

O sistema permite definir orçamentos mensais por categoria e acompanhar o progresso:

```typescript
// Verificar orçamento vs gastos
const { data: budget } = await supabase
  .from('budgets')
  .select('amount')
  .eq('category_id', categoryId)
  .eq('month', currentMonth)
  .eq('year', currentYear)
  .single()

const { data: expenses } = await supabase
  .from('transactions')
  .select('amount')
  .eq('category_id', categoryId)
  .eq('type', 'expense')
  .gte('date', startOfMonth)
  .lte('date', endOfMonth)
```

### Metas Financeiras

Acompanhe o progresso das suas metas:

```typescript
// Atualizar progresso da meta
const { data, error } = await supabase
  .from('goals')
  .update({ current_amount: newAmount })
  .eq('id', goalId)
```

### Investimentos

Registre e acompanhe seus investimentos:

```typescript
const { data, error } = await supabase
  .from('investments')
  .insert({
    name: 'Tesouro Direto',
    type: 'fixed_income',
    amount: 1000.00,
    purchase_date: '2024-01-15',
    expected_return: 12.5
  })
```