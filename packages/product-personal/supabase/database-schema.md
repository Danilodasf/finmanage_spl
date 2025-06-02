# Documentação do Banco de Dados - FinManage Personal

Este documento descreve a estrutura do banco de dados utilizado pelo FinManage Personal no Supabase, incluindo tabelas, relacionamentos e políticas de segurança.

## Visão Geral

O FinManage Personal utiliza o PostgreSQL através do Supabase como banco de dados. A estrutura foi projetada para:

- Garantir a segurança dos dados através de Row Level Security (RLS)
- Manter a integridade referencial com chaves estrangeiras
- Otimizar consultas com índices estratégicos
- Facilitar a manutenção com gatilhos automáticos

## Tabelas

### profiles

Armazena informações do perfil do usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária, referencia auth.users |
| name | TEXT | Nome do usuário |
| avatar_url | TEXT | URL da imagem de perfil (opcional) |
| monthly_income | NUMERIC(15,2) | Renda mensal (opcional) |
| monthly_expense_goal | NUMERIC(15,2) | Meta de despesas mensais (opcional) |
| monthly_savings_goal | NUMERIC(15,2) | Meta de economia mensal (opcional) |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### categories

Categorias para transações e investimentos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| name | TEXT | Nome da categoria |
| type | TEXT | Tipo: 'receita', 'despesa', 'ambos' ou 'investimento' |
| user_id | UUID | Referência ao usuário proprietário |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### transactions

Registros de transações financeiras (receitas e despesas).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| type | TEXT | Tipo: 'receita' ou 'despesa' |
| date | DATE | Data da transação |
| value | NUMERIC(15,2) | Valor da transação |
| description | TEXT | Descrição (opcional) |
| category_id | UUID | Referência à categoria (opcional) |
| payment_method | TEXT | Método de pagamento (opcional) |
| user_id | UUID | Referência ao usuário proprietário |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### budgets

Orçamentos definidos pelo usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| name | TEXT | Nome do orçamento |
| amount | NUMERIC(15,2) | Valor total do orçamento |
| category_id | UUID | Referência à categoria (opcional) |
| spent_amount | NUMERIC(15,2) | Valor já gasto (padrão: 0) |
| period | TEXT | Período: 'mensal' ou 'anual' |
| description | TEXT | Descrição (opcional) |
| user_id | UUID | Referência ao usuário proprietário |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### goals

Metas financeiras do usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| name | TEXT | Nome da meta |
| target_amount | NUMERIC(15,2) | Valor alvo da meta |
| current_amount | NUMERIC(15,2) | Valor atual acumulado (padrão: 0) |
| start_date | DATE | Data de início |
| target_date | DATE | Data alvo para atingir a meta |
| description | TEXT | Descrição (opcional) |
| user_id | UUID | Referência ao usuário proprietário |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### investments

Investimentos realizados pelo usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| name | TEXT | Nome do investimento |
| amount | NUMERIC(15,2) | Valor investido |
| category_id | UUID | Referência à categoria (opcional) |
| description | TEXT | Descrição (opcional) |
| total_returns | NUMERIC(15,2) | Total de rendimentos (padrão: 0) |
| user_id | UUID | Referência ao usuário proprietário |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### investment_returns

Rendimentos dos investimentos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| investment_id | UUID | Referência ao investimento |
| amount | NUMERIC(15,2) | Valor do rendimento |
| date | DATE | Data do rendimento |
| user_id | UUID | Referência ao usuário proprietário |
| created_at | TIMESTAMP | Data de criação do registro |

## Relacionamentos

```
profiles (1) --- (N) transactions
profiles (1) --- (N) categories
profiles (1) --- (N) budgets
profiles (1) --- (N) goals
profiles (1) --- (N) investments
categories (1) --- (N) transactions
categories (1) --- (N) budgets
categories (1) --- (N) investments
investments (1) --- (N) investment_returns
```

## Índices

Para otimizar a performance das consultas, foram criados os seguintes índices:

- `idx_transactions_user_id`: Índice na coluna user_id da tabela transactions
- `idx_transactions_category_id`: Índice na coluna category_id da tabela transactions
- `idx_transactions_date`: Índice na coluna date da tabela transactions
- `idx_categories_user_id`: Índice na coluna user_id da tabela categories
- `idx_budgets_user_id`: Índice na coluna user_id da tabela budgets
- `idx_goals_user_id`: Índice na coluna user_id da tabela goals
- `idx_investments_user_id`: Índice na coluna user_id da tabela investments
- `idx_investment_returns_investment_id`: Índice na coluna investment_id da tabela investment_returns

## Segurança (RLS)

Todas as tabelas possuem Row Level Security (RLS) habilitada, garantindo que cada usuário só possa acessar seus próprios dados. As políticas implementadas são:

- **SELECT**: Permite que o usuário visualize apenas seus próprios registros
- **INSERT**: Permite que o usuário insira apenas registros associados ao seu ID
- **UPDATE**: Permite que o usuário atualize apenas seus próprios registros
- **DELETE**: Permite que o usuário exclua apenas seus próprios registros

## Gatilhos

Foram implementados gatilhos para:

1. Atualizar automaticamente o campo `updated_at` quando um registro é modificado
2. Criar automaticamente um perfil quando um novo usuário se registra

## Implementação

O script completo de criação do banco de dados está disponível no arquivo `database-schema.sql` na raiz do projeto. Para implementar esta estrutura em um novo projeto Supabase:

1. Crie um novo projeto no Supabase
2. Acesse o Editor SQL
3. Execute o script completo do arquivo `database-schema.sql`
4. Verifique se todas as tabelas, índices, gatilhos e políticas foram criados corretamente 