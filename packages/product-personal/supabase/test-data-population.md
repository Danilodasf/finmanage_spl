# 📊 População de Dados de Teste - FinManage Personal

Este documento contém comandos SQL para popular o banco de dados com dados genéricos para testes do sistema FinManage Personal.

⚠️ **ATENÇÃO**: Estes comandos são apenas para ambiente de teste/desenvolvimento. Nunca execute em produção.

## Pré-requisitos

Antes de executar os comandos de população, certifique-se de que:
1. O esquema do banco está criado (execute primeiro o `database-schema.md`)
2. Você tem pelo menos um usuário registrado no sistema
3. Você está em um ambiente de teste/desenvolvimento

## 1. Obter ID do Usuário de Teste

```sql
-- Verificar usuários existentes
SELECT id, email FROM auth.users;

-- Definir uma variável com o ID do usuário para os testes
-- Substitua 'seu-email@teste.com' pelo email do usuário de teste
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Buscar o ID do usuário de teste
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email = 'seu-email@teste.com' -- ALTERE ESTE EMAIL
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário de teste não encontrado. Registre um usuário primeiro.';
    END IF;
    
    RAISE NOTICE 'Usuário de teste encontrado: %', test_user_id;
END $$;
```

## 2. Popular Categorias Adicionais

```sql
-- Inserir categorias adicionais específicas para finanças pessoais
-- (As categorias padrão já são criadas automaticamente)
INSERT INTO categories (user_id, name, type, color, icon) VALUES
-- Categorias de Receita Adicionais
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Bonificação', 'receita', '#10B981', 'Award'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Vendas Online', 'receita', '#3B82F6', 'Globe'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Aluguel Recebido', 'receita', '#8B5CF6', 'Home'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Dividendos', 'receita', '#F59E0B', 'TrendingUp'),

-- Categorias de Despesa Adicionais
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Supermercado', 'despesa', '#EF4444', 'ShoppingCart'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Restaurantes', 'despesa', '#F97316', 'Utensils'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Combustível', 'despesa', '#06B6D4', 'Fuel'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Academia', 'despesa', '#EC4899', 'Dumbbell'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Streaming', 'despesa', '#8B5CF6', 'Play'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Telefone', 'despesa', '#10B981', 'Phone'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Internet', 'despesa', '#F59E0B', 'Wifi'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Seguro', 'despesa', '#3B82F6', 'Shield'),

-- Categorias de Investimento Adicionais
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Tesouro Direto', 'investimento', '#10B981', 'Landmark'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'CDB', 'investimento', '#3B82F6', 'Building'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'LCI/LCA', 'investimento', '#8B5CF6', 'Home'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Previdência', 'investimento', '#F59E0B', 'Umbrella');
```

## 3. Popular Transações de Teste

```sql
-- Inserir transações de teste (últimos 6 meses)
DO $$
DECLARE
    test_user_id UUID;
    salario_cat_id UUID;
    alimentacao_cat_id UUID;
    transporte_cat_id UUID;
    moradia_cat_id UUID;
    freelance_cat_id UUID;
    supermercado_cat_id UUID;
    combustivel_cat_id UUID;
BEGIN
    -- Buscar IDs necessários
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    SELECT id INTO salario_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Salário' LIMIT 1;
    SELECT id INTO alimentacao_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Alimentação' LIMIT 1;
    SELECT id INTO transporte_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Transporte' LIMIT 1;
    SELECT id INTO moradia_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Moradia' LIMIT 1;
    SELECT id INTO freelance_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Freelance' LIMIT 1;
    SELECT id INTO supermercado_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Supermercado' LIMIT 1;
    SELECT id INTO combustivel_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Combustível' LIMIT 1;
    
    -- Transações de Receita
    INSERT INTO transactions (user_id, type, date, value, description, category_id, payment_method) VALUES
    -- Salários mensais
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '1 month', 5500.00, 'Salário Janeiro 2024', salario_cat_id, 'bank_transfer'),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '2 months', 5500.00, 'Salário Dezembro 2023', salario_cat_id, 'bank_transfer'),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '3 months', 5500.00, 'Salário Novembro 2023', salario_cat_id, 'bank_transfer'),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '4 months', 5500.00, 'Salário Outubro 2023', salario_cat_id, 'bank_transfer'),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '5 months', 5500.00, 'Salário Setembro 2023', salario_cat_id, 'bank_transfer'),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '6 months', 5500.00, 'Salário Agosto 2023', salario_cat_id, 'bank_transfer'),
    
    -- Freelances
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '5 days', 1200.00, 'Projeto de desenvolvimento web', freelance_cat_id, 'pix'),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '2 weeks', 800.00, 'Consultoria em TI', freelance_cat_id, 'bank_transfer'),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '1 month' + INTERVAL '10 days', 1500.00, 'Desenvolvimento de app mobile', freelance_cat_id, 'pix'),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '2 months' + INTERVAL '5 days', 950.00, 'Design de interface', freelance_cat_id, 'bank_transfer'),
    
    -- Bonificações e outros
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '3 months' + INTERVAL '15 days', 2200.00, 'Bonificação anual', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Bonificação' LIMIT 1), 'bank_transfer'),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '1 month' + INTERVAL '20 days', 350.00, 'Dividendos de ações', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Dividendos' LIMIT 1), 'bank_transfer'),
    
    -- Transações de Despesa
    -- Moradia
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 day', 1200.00, 'Aluguel Janeiro', moradia_cat_id, 'bank_transfer'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 month' + INTERVAL '1 day', 1200.00, 'Aluguel Dezembro', moradia_cat_id, 'bank_transfer'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 months' + INTERVAL '1 day', 1200.00, 'Aluguel Novembro', moradia_cat_id, 'bank_transfer'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '3 months' + INTERVAL '1 day', 1200.00, 'Aluguel Outubro', moradia_cat_id, 'bank_transfer'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '4 months' + INTERVAL '1 day', 1200.00, 'Aluguel Setembro', moradia_cat_id, 'bank_transfer'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '5 months' + INTERVAL '1 day', 1200.00, 'Aluguel Agosto', moradia_cat_id, 'bank_transfer'),
    
    -- Contas de casa
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '3 days', 180.00, 'Conta de luz', moradia_cat_id, 'bank_transfer'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '5 days', 95.00, 'Conta de água', moradia_cat_id, 'bank_transfer'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 week', 120.00, 'Conta de gás', moradia_cat_id, 'bank_transfer'),
    
    -- Alimentação
    (test_user_id, 'despesa', CURRENT_DATE, 45.80, 'Almoço no restaurante', alimentacao_cat_id, 'debit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 day', 28.50, 'Café da manhã', alimentacao_cat_id, 'cash'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 days', 185.90, 'Compras no supermercado', supermercado_cat_id, 'debit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '3 days', 67.30, 'Jantar delivery', alimentacao_cat_id, 'credit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '4 days', 220.45, 'Compras no supermercado', supermercado_cat_id, 'debit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 week', 89.90, 'Restaurante fim de semana', alimentacao_cat_id, 'credit_card'),
    
    -- Transporte
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 days', 85.00, 'Combustível', combustivel_cat_id, 'debit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 week', 90.00, 'Combustível', combustivel_cat_id, 'credit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 weeks', 25.50, 'Uber para reunião', transporte_cat_id, 'credit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '3 weeks', 88.00, 'Combustível', combustivel_cat_id, 'debit_card'),
    
    -- Saúde
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 week', 150.00, 'Consulta médica', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Saúde' LIMIT 1), 'debit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 weeks', 85.50, 'Medicamentos', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Saúde' LIMIT 1), 'cash'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 month', 120.00, 'Exames laboratoriais', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Saúde' LIMIT 1), 'debit_card'),
    
    -- Lazer e Entretenimento
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '3 days', 45.90, 'Netflix', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Streaming' LIMIT 1), 'credit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 week', 80.00, 'Cinema', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Lazer' LIMIT 1), 'debit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 weeks', 120.00, 'Academia', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Academia' LIMIT 1), 'debit_card'),
    
    -- Educação
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 month', 299.00, 'Curso online', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Educação' LIMIT 1), 'credit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 months', 89.90, 'Livros técnicos', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Educação' LIMIT 1), 'debit_card'),
    
    -- Compras diversas
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '5 days', 250.00, 'Roupas', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Compras' LIMIT 1), 'credit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 weeks', 180.00, 'Produtos de limpeza', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Compras' LIMIT 1), 'debit_card'),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '3 weeks', 95.50, 'Produtos de higiene', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Compras' LIMIT 1), 'cash');
    
END $$;
```

## 4. Popular Orçamentos

```sql
-- Inserir orçamentos de teste
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    
    INSERT INTO budgets (user_id, name, amount, category_id, period, description) VALUES
    (test_user_id, 'Orçamento Alimentação', 800.00, (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Alimentação' LIMIT 1), 'mensal', 'Orçamento mensal para alimentação'),
    (test_user_id, 'Orçamento Transporte', 400.00, (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Transporte' LIMIT 1), 'mensal', 'Orçamento mensal para transporte'),
    (test_user_id, 'Orçamento Lazer', 300.00, (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Lazer' LIMIT 1), 'mensal', 'Orçamento mensal para entretenimento'),
    (test_user_id, 'Orçamento Saúde', 500.00, (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Saúde' LIMIT 1), 'mensal', 'Orçamento mensal para saúde'),
    (test_user_id, 'Orçamento Educação', 400.00, (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Educação' LIMIT 1), 'mensal', 'Orçamento mensal para cursos e livros'),
    (test_user_id, 'Orçamento Compras', 600.00, (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Compras' LIMIT 1), 'mensal', 'Orçamento mensal para compras diversas'),
    (test_user_id, 'Reserva de Emergência', 12000.00, NULL, 'anual', 'Meta anual para reserva de emergência');
END $$;
```

## 5. Popular Metas Financeiras

```sql
-- Inserir metas financeiras de teste
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    
    INSERT INTO goals (user_id, name, target_amount, current_amount, target_date, description, status) VALUES
    (test_user_id, 'Reserva de Emergência', 30000.00, 15000.00, CURRENT_DATE + INTERVAL '1 year', 'Meta de reserva para 6 meses de gastos', 'ativo'),
    (test_user_id, 'Viagem para Europa', 8000.00, 2500.00, CURRENT_DATE + INTERVAL '8 months', 'Viagem de férias para Europa', 'ativo'),
    (test_user_id, 'Novo Notebook', 4500.00, 1200.00, CURRENT_DATE + INTERVAL '4 months', 'Notebook para trabalho', 'ativo'),
    (test_user_id, 'Curso de Especialização', 2500.00, 800.00, CURRENT_DATE + INTERVAL '6 months', 'MBA em Gestão de Projetos', 'ativo'),
    (test_user_id, 'Entrada do Apartamento', 50000.00, 12000.00, CURRENT_DATE + INTERVAL '2 years', 'Entrada para financiamento imobiliário', 'ativo'),
    (test_user_id, 'Carro Novo', 25000.00, 25000.00, CURRENT_DATE - INTERVAL '1 month', 'Troca do carro atual', 'concluido');
END $$;
```

## 6. Popular Investimentos

```sql
-- Inserir investimentos de teste
DO $$
DECLARE
    test_user_id UUID;
    acoes_cat_id UUID;
    fundos_cat_id UUID;
    renda_fixa_cat_id UUID;
    tesouro_cat_id UUID;
    investment_1_id UUID;
    investment_2_id UUID;
    investment_3_id UUID;
    investment_4_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    SELECT id INTO acoes_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Ações' LIMIT 1;
    SELECT id INTO fundos_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Fundos' LIMIT 1;
    SELECT id INTO renda_fixa_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Renda Fixa' LIMIT 1;
    SELECT id INTO tesouro_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Tesouro Direto' LIMIT 1;
    
    -- Inserir investimentos
    INSERT INTO investments (user_id, name, amount, category_id, description) VALUES
    (test_user_id, 'Ações PETR4', 5000.00, acoes_cat_id, 'Investimento em ações da Petrobras'),
    (test_user_id, 'Fundo Multimercado XP', 8000.00, fundos_cat_id, 'Fundo de investimento multimercado'),
    (test_user_id, 'CDB Banco Inter', 12000.00, renda_fixa_cat_id, 'CDB com liquidez diária'),
    (test_user_id, 'Tesouro Selic 2029', 15000.00, tesouro_cat_id, 'Tesouro Direto indexado à Selic'),
    (test_user_id, 'Ações VALE3', 3500.00, acoes_cat_id, 'Investimento em ações da Vale'),
    (test_user_id, 'LCI Banco do Brasil', 10000.00, (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'LCI/LCA' LIMIT 1), 'Letra de Crédito Imobiliário')
    RETURNING id INTO investment_1_id;
    
    -- Buscar IDs dos investimentos para inserir rendimentos
    SELECT id INTO investment_1_id FROM investments WHERE user_id = test_user_id AND name = 'Ações PETR4' LIMIT 1;
    SELECT id INTO investment_2_id FROM investments WHERE user_id = test_user_id AND name = 'Fundo Multimercado XP' LIMIT 1;
    SELECT id INTO investment_3_id FROM investments WHERE user_id = test_user_id AND name = 'CDB Banco Inter' LIMIT 1;
    SELECT id INTO investment_4_id FROM investments WHERE user_id = test_user_id AND name = 'Tesouro Selic 2029' LIMIT 1;
    
    -- Inserir rendimentos dos investimentos
    INSERT INTO investment_returns (investment_id, amount, date) VALUES
    -- Rendimentos das ações PETR4
    (investment_1_id, 150.00, CURRENT_DATE - INTERVAL '1 month'),
    (investment_1_id, 180.00, CURRENT_DATE - INTERVAL '2 months'),
    (investment_1_id, 120.00, CURRENT_DATE - INTERVAL '3 months'),
    
    -- Rendimentos do fundo multimercado
    (investment_2_id, 320.00, CURRENT_DATE - INTERVAL '1 month'),
    (investment_2_id, 280.00, CURRENT_DATE - INTERVAL '2 months'),
    (investment_2_id, 350.00, CURRENT_DATE - INTERVAL '3 months'),
    (investment_2_id, 290.00, CURRENT_DATE - INTERVAL '4 months'),
    
    -- Rendimentos do CDB
    (investment_3_id, 95.00, CURRENT_DATE - INTERVAL '1 month'),
    (investment_3_id, 98.00, CURRENT_DATE - INTERVAL '2 months'),
    (investment_3_id, 92.00, CURRENT_DATE - INTERVAL '3 months'),
    (investment_3_id, 96.00, CURRENT_DATE - INTERVAL '4 months'),
    (investment_3_id, 94.00, CURRENT_DATE - INTERVAL '5 months'),
    
    -- Rendimentos do Tesouro Selic
    (investment_4_id, 125.00, CURRENT_DATE - INTERVAL '1 month'),
    (investment_4_id, 130.00, CURRENT_DATE - INTERVAL '2 months'),
    (investment_4_id, 128.00, CURRENT_DATE - INTERVAL '3 months'),
    (investment_4_id, 132.00, CURRENT_DATE - INTERVAL '4 months'),
    (investment_4_id, 127.00, CURRENT_DATE - INTERVAL '5 months'),
    (investment_4_id, 129.00, CURRENT_DATE - INTERVAL '6 months');
END $$;
```

## 7. Atualizar Valores Calculados

```sql
-- Atualizar valores gastos nos orçamentos baseado nas transações
DO $$
DECLARE
    test_user_id UUID;
    budget_record RECORD;
BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    
    -- Atualizar spent_amount para cada orçamento
    FOR budget_record IN 
        SELECT id, category_id, period FROM budgets WHERE user_id = test_user_id
    LOOP
        IF budget_record.category_id IS NOT NULL THEN
            UPDATE budgets 
            SET spent_amount = (
                SELECT COALESCE(SUM(value), 0)
                FROM transactions 
                WHERE user_id = test_user_id 
                AND category_id = budget_record.category_id
                AND type = 'despesa'
                AND (
                    (budget_record.period = 'mensal' AND date >= DATE_TRUNC('month', CURRENT_DATE))
                    OR 
                    (budget_record.period = 'anual' AND date >= DATE_TRUNC('year', CURRENT_DATE))
                )
            )
            WHERE id = budget_record.id;
        END IF;
    END LOOP;
END $$;
```

## 8. Verificar Dados Inseridos

```sql
-- Verificar se os dados foram inseridos corretamente
DO $$
DECLARE
    test_user_id UUID;
    total_categories INTEGER;
    total_transactions INTEGER;
    total_budgets INTEGER;
    total_goals INTEGER;
    total_investments INTEGER;
    total_returns INTEGER;
BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    
    SELECT COUNT(*) INTO total_categories FROM categories WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO total_transactions FROM transactions WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO total_budgets FROM budgets WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO total_goals FROM goals WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO total_investments FROM investments WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO total_returns FROM investment_returns ir 
        JOIN investments i ON ir.investment_id = i.id 
        WHERE i.user_id = test_user_id;
    
    RAISE NOTICE '=== RESUMO DOS DADOS INSERIDOS ===';
    RAISE NOTICE 'Usuário: %', test_user_id;
    RAISE NOTICE 'Categorias: %', total_categories;
    RAISE NOTICE 'Transações: %', total_transactions;
    RAISE NOTICE 'Orçamentos: %', total_budgets;
    RAISE NOTICE 'Metas: %', total_goals;
    RAISE NOTICE 'Investimentos: %', total_investments;
    RAISE NOTICE 'Rendimentos: %', total_returns;
    RAISE NOTICE '=================================';
END $$;
```

## 9. Consultas de Verificação

```sql
-- Verificar resumo financeiro
SELECT 
    'Receitas' as tipo,
    COUNT(*) as quantidade,
    SUM(value) as total
FROM transactions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1)
AND type = 'receita'
UNION ALL
SELECT 
    'Despesas' as tipo,
    COUNT(*) as quantidade,
    SUM(value) as total
FROM transactions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1)
AND type = 'despesa';

-- Verificar orçamentos vs gastos
SELECT 
    b.name,
    b.amount as orcamento,
    b.spent_amount as gasto,
    ROUND((b.spent_amount / b.amount) * 100, 2) as percentual_usado
FROM budgets b
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1)
ORDER BY percentual_usado DESC;

-- Verificar progresso das metas
SELECT 
    name,
    target_amount as meta,
    current_amount as atual,
    ROUND((current_amount / target_amount) * 100, 2) as progresso_pct,
    status
FROM goals
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1)
ORDER BY progresso_pct DESC;

-- Verificar performance dos investimentos
SELECT 
    i.name,
    i.amount as investido,
    i.total_returns as rendimentos,
    ROUND((i.total_returns / i.amount) * 100, 2) as rentabilidade_pct
FROM investments i
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1)
ORDER BY rentabilidade_pct DESC;
```

## 🎯 Resumo dos Dados de Teste

### Categorias
- **Receita**: Salário, Freelance, Bonificação, Dividendos, etc.
- **Despesa**: Alimentação, Transporte, Moradia, Saúde, Educação, etc.
- **Investimento**: Ações, Fundos, Renda Fixa, Tesouro Direto, etc.

### Transações
- **6 meses** de histórico financeiro
- **Receitas**: Salários mensais + freelances + bonificações
- **Despesas**: Gastos variados em diferentes categorias
- **Métodos de pagamento**: PIX, cartão, transferência, dinheiro

### Orçamentos
- **7 orçamentos** para diferentes categorias
- **Períodos**: Mensal e anual
- **Valores calculados** baseados nas transações reais

### Metas Financeiras
- **6 metas** com diferentes objetivos
- **Status variados**: Ativo, concluído
- **Prazos realistas** e valores progressivos

### Investimentos
- **6 investimentos** em diferentes categorias
- **Rendimentos históricos** dos últimos meses
- **Cálculo automático** de rentabilidade

⚠️ **Lembre-se**: Altere o email 'seu-email@teste.com' para o email do seu usuário de teste antes de executar os comandos!