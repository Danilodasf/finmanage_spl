# 📊 Configuração do Banco de Dados Supabase - Product Diarista

Este guia explica como configurar e usar o banco de dados Supabase para o produto Diarista.

## 🚀 Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização
5. Defina:
   - **Nome do projeto**: `finmanage-diarista`
   - **Senha do banco**: (anote esta senha!)
   - **Região**: escolha a mais próxima do Brasil

### 2. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. No painel do Supabase, vá em **Settings > API**
3. Copie as seguintes informações para seu `.env`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **categories** - Categorias de Transações
```sql
- id: UUID (PK)
- user_id: UUID (FK para auth.users)
- name: TEXT (nome da categoria)
- type: TEXT ('receita' | 'despesa' | 'ambos')
- color: TEXT (cor da categoria)
- icon: TEXT (ícone da categoria)
- created_at, updated_at: TIMESTAMP
```

#### 2. **transactions** - Transações Financeiras
```sql
- id: UUID (PK)
- user_id: UUID (FK para auth.users)
- category_id: UUID (FK para categories)
- type: TEXT ('receita' | 'despesa')
- description: TEXT
- value: DECIMAL(10,2)
- date: DATE
- payment_method: TEXT
- created_at, updated_at: TIMESTAMP
```

#### 3. **gastos** - Gastos Adicionais
```sql
- id: UUID (PK)
- user_id: UUID (FK para auth.users)
- description: TEXT
- value: DECIMAL(10,2)
- date: DATE
- created_at, updated_at: TIMESTAMP
```

#### 4. **profiles** - Perfis de Usuário
```sql
- id: UUID (PK, FK para auth.users)
- first_name: TEXT
- last_name: TEXT
- avatar_url: TEXT
- phone: TEXT
- created_at, updated_at: TIMESTAMP
```

## ⚙️ Configuração de Triggers

O sistema possui triggers automáticos para sincronizar gastos com transações.

### Executar Setup de Triggers

```bash
# Instalar triggers no banco
npm run setup-triggers

# Remover triggers (se necessário)
npm run remove-triggers
```

### O que os Triggers Fazem

1. **Criação de Gasto**: Automaticamente cria uma transação de despesa
2. **Atualização de Gasto**: Atualiza a transação correspondente
3. **Exclusão de Gasto**: Remove a transação correspondente
4. **Categoria Automática**: Cria categoria "Gastos Adicionais" se não existir

## 🔐 Políticas de Segurança (RLS)

Todas as tabelas possuem Row Level Security (RLS) habilitado:

- **Usuários só podem ver seus próprios dados**
- **Usuários só podem modificar seus próprios dados**
- **Inserções automáticas incluem user_id do usuário autenticado**

## 🛠️ Scripts Úteis

### Desenvolvimento
```bash
# Executar testes
npm test

# Executar testes de integração
npm run test:integration

# Executar aplicação em desenvolvimento
npm run dev
```

### Banco de Dados
```bash
# Configurar triggers
npm run setup-triggers

# Remover triggers
npm run remove-triggers
```

## 📝 Exemplos de Uso

### 1. Criar Categoria
```typescript
import { supabase } from './lib/supabase';

const { data, error } = await supabase
  .from('categories')
  .insert({
    name: 'Alimentação',
    type: 'despesa',
    color: '#FF6B6B',
    icon: 'utensils'
  });
```

### 2. Criar Transação
```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    category_id: 'uuid-da-categoria',
    type: 'despesa',
    description: 'Almoço',
    value: 25.50,
    date: '2024-01-15',
    payment_method: 'cartao'
  });
```

### 3. Buscar Transações do Mês
```typescript
const { data, error } = await supabase
  .from('transactions')
  .select(`
    *,
    categories (name, color, icon)
  `)
  .gte('date', '2024-01-01')
  .lt('date', '2024-02-01')
  .order('date', { ascending: false });
```