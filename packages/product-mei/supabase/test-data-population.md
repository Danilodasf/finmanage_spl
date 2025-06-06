# População de Dados de Teste - FinManage MEI

Este documento contém comandos SQL para popular o banco de dados com dados genéricos para testes do sistema FinManage MEI.

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

## 2. Popular Categorias

```sql
-- Inserir categorias padrão para MEI
INSERT INTO categories (user_id, name, type, color, icon) VALUES
-- Categorias de Receita
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Vendas de Produtos', 'receita', '#10B981', 'ShoppingBag'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Prestação de Serviços', 'receita', '#3B82F6', 'Briefcase'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Consultoria', 'receita', '#8B5CF6', 'Users'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Comissões', 'receita', '#F59E0B', 'TrendingUp'),

-- Categorias de Despesa
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Material de Escritório', 'despesa', '#EF4444', 'FileText'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Combustível', 'despesa', '#F97316', 'Car'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Internet/Telefone', 'despesa', '#06B6D4', 'Wifi'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Marketing/Publicidade', 'despesa', '#EC4899', 'Megaphone'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Impostos DAS', 'despesa', '#DC2626', 'Receipt'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Equipamentos', 'despesa', '#7C3AED', 'Monitor'),

-- Categorias Mistas
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Alimentação', 'ambos', '#059669', 'Coffee'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Transporte', 'ambos', '#0891B2', 'Truck');
```

## 3. Popular Clientes

```sql
-- Inserir clientes de teste
INSERT INTO clientes (user_id, nome, email, telefone, cpf_cnpj, endereco, observacoes) VALUES
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'João Silva Santos', 'joao.silva@email.com', '(11) 98765-4321', '123.456.789-00', 'Rua das Flores, 123 - São Paulo/SP', 'Cliente desde 2023, sempre pontual nos pagamentos'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Maria Oliveira Costa', 'maria.oliveira@email.com', '(11) 91234-5678', '987.654.321-00', 'Av. Paulista, 1000 - São Paulo/SP', 'Empresa de médio porte, pagamento via boleto'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Pedro Souza Lima', 'pedro.souza@email.com', '(11) 99876-5432', '456.789.123-00', 'Rua Augusta, 500 - São Paulo/SP', 'Freelancer, prefere PIX'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Ana Carolina Ferreira', 'ana.ferreira@email.com', '(11) 95555-1234', '789.123.456-00', 'Rua Oscar Freire, 200 - São Paulo/SP', 'Cliente VIP, projetos de alto valor'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Carlos Eduardo Mendes', 'carlos.mendes@email.com', '(11) 94444-9876', '321.654.987-00', 'Av. Faria Lima, 1500 - São Paulo/SP', 'Startup em crescimento'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Fernanda Rodrigues', 'fernanda.rodrigues@email.com', '(11) 93333-5555', '654.987.321-00', 'Rua Consolação, 800 - São Paulo/SP', 'Consultoria mensal'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Roberto Almeida', 'roberto.almeida@email.com', '(11) 92222-7777', '147.258.369-00', 'Av. Rebouças, 300 - São Paulo/SP', 'Projetos esporádicos'),
((SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1), 'Juliana Santos', 'juliana.santos@email.com', '(11) 91111-8888', '258.369.147-00', 'Rua Haddock Lobo, 600 - São Paulo/SP', 'E-commerce em expansão');
```

## 4. Popular Transações

```sql
-- Inserir transações de teste (últimos 6 meses)
DO $$
DECLARE
    test_user_id UUID;
    receita_cat_id UUID;
    despesa_cat_id UUID;
    imposto_cat_id UUID;
BEGIN
    -- Buscar IDs necessários
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    SELECT id INTO receita_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Vendas de Produtos' LIMIT 1;
    SELECT id INTO despesa_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Material de Escritório' LIMIT 1;
    SELECT id INTO imposto_cat_id FROM categories WHERE user_id = test_user_id AND name = 'Impostos DAS' LIMIT 1;
    
    -- Transações de Receita
    INSERT INTO transactions (user_id, type, date, value, description, category_id) VALUES
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '1 day', 1500.00, 'Venda de produtos - Cliente João Silva', receita_cat_id),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '3 days', 2800.00, 'Consultoria em marketing digital', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Consultoria' LIMIT 1)),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '1 week', 950.00, 'Prestação de serviços - Maria Oliveira', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Prestação de Serviços' LIMIT 1)),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '10 days', 3200.00, 'Projeto de desenvolvimento web', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Prestação de Serviços' LIMIT 1)),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '2 weeks', 1200.00, 'Venda de produtos online', receita_cat_id),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '3 weeks', 800.00, 'Comissão de vendas', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Comissões' LIMIT 1)),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '1 month', 2500.00, 'Consultoria estratégica - Ana Carolina', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Consultoria' LIMIT 1)),
    (test_user_id, 'receita', CURRENT_DATE - INTERVAL '6 weeks', 1800.00, 'Desenvolvimento de aplicativo', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Prestação de Serviços' LIMIT 1)),
    
    -- Transações de Despesa
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 days', 150.00, 'Compra de material de escritório', despesa_cat_id),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '5 days', 200.00, 'Combustível para visitas a clientes', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Combustível' LIMIT 1)),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 week', 120.00, 'Internet e telefone', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Internet/Telefone' LIMIT 1)),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 weeks', 300.00, 'Anúncios no Google Ads', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Marketing/Publicidade' LIMIT 1)),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '3 weeks', 89.50, 'Pagamento DAS - Janeiro 2024', imposto_cat_id),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '1 month', 1200.00, 'Notebook para trabalho', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Equipamentos' LIMIT 1)),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '6 weeks', 250.00, 'Almoços de negócios', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Alimentação' LIMIT 1)),
    (test_user_id, 'despesa', CURRENT_DATE - INTERVAL '2 months', 180.00, 'Uber para reuniões', (SELECT id FROM categories WHERE user_id = test_user_id AND name = 'Transporte' LIMIT 1));
END $$;
```

## 5. Popular Vendas

```sql
-- Inserir vendas de teste
DO $$
DECLARE
    test_user_id UUID;
    cliente1_id UUID;
    cliente2_id UUID;
    cliente3_id UUID;
    trans1_id UUID;
    trans2_id UUID;
BEGIN
    -- Buscar IDs necessários
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    SELECT id INTO cliente1_id FROM clientes WHERE user_id = test_user_id AND nome = 'João Silva Santos' LIMIT 1;
    SELECT id INTO cliente2_id FROM clientes WHERE user_id = test_user_id AND nome = 'Maria Oliveira Costa' LIMIT 1;
    SELECT id INTO cliente3_id FROM clientes WHERE user_id = test_user_id AND nome = 'Ana Carolina Ferreira' LIMIT 1;
    
    -- Buscar algumas transações de receita para vincular
    SELECT id INTO trans1_id FROM transactions WHERE user_id = test_user_id AND type = 'receita' AND description LIKE '%João Silva%' LIMIT 1;
    SELECT id INTO trans2_id FROM transactions WHERE user_id = test_user_id AND type = 'receita' AND description LIKE '%Maria Oliveira%' LIMIT 1;
    
    -- Inserir vendas
    INSERT INTO vendas (user_id, cliente_id, cliente_nome, data, descricao, valor, forma_pagamento, transaction_id) VALUES
    (test_user_id, cliente1_id, 'João Silva Santos', CURRENT_DATE - INTERVAL '1 day', 'Venda de produtos personalizados', 1500.00, 'PIX', trans1_id),
    (test_user_id, cliente2_id, 'Maria Oliveira Costa', CURRENT_DATE - INTERVAL '1 week', 'Consultoria em processos', 950.00, 'Boleto', trans2_id),
    (test_user_id, cliente3_id, 'Ana Carolina Ferreira', CURRENT_DATE - INTERVAL '2 weeks', 'Desenvolvimento de identidade visual', 2500.00, 'Transferência'),
    (test_user_id, cliente1_id, 'João Silva Santos', CURRENT_DATE - INTERVAL '3 weeks', 'Manutenção de sistema', 800.00, 'PIX'),
    (test_user_id, NULL, 'Cliente Avulso', CURRENT_DATE - INTERVAL '1 month', 'Venda direta no local', 350.00, 'Dinheiro'),
    (test_user_id, cliente2_id, 'Maria Oliveira Costa', CURRENT_DATE - INTERVAL '6 weeks', 'Treinamento de equipe', 1200.00, 'Boleto'),
    (test_user_id, cliente3_id, 'Ana Carolina Ferreira', CURRENT_DATE - INTERVAL '2 months', 'Consultoria estratégica', 3200.00, 'Transferência');
END $$;
```

## 6. Popular Pagamentos DAS

```sql
-- Inserir pagamentos DAS de teste
DO $$
DECLARE
    test_user_id UUID;
    das_transaction_id UUID;
BEGIN
    -- Buscar IDs necessários
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    SELECT id INTO das_transaction_id FROM transactions WHERE user_id = test_user_id AND description LIKE '%DAS%' LIMIT 1;
    
    -- Inserir pagamentos DAS
    INSERT INTO imposto_das (user_id, competencia, vencimento, valor, numero_das, data_pagamento, status, transaction_id) VALUES
    (test_user_id, '2024-01', '2024-02-20', 89.50, 'DAS202401001', '2024-02-15', 'Pago', das_transaction_id),
    (test_user_id, '2024-02', '2024-03-20', 89.50, 'DAS202402001', '2024-03-18', 'Pago', NULL),
    (test_user_id, '2024-03', '2024-04-22', 89.50, 'DAS202403001', '2024-04-20', 'Pago', NULL),
    (test_user_id, '2024-04', '2024-05-20', 89.50, 'DAS202404001', '2024-05-17', 'Pago', NULL),
    (test_user_id, '2024-05', '2024-06-20', 89.50, 'DAS202405001', '2024-06-19', 'Pago', NULL),
    (test_user_id, '2024-06', '2024-07-22', 89.50, 'DAS202406001', NULL, 'Pendente', NULL),
    (test_user_id, '2024-07', '2024-08-20', 89.50, 'DAS202407001', NULL, 'Pendente', NULL);
END $$;
```

## 7. Verificar Dados Inseridos

```sql
-- Verificar se os dados foram inseridos corretamente
DO $$
DECLARE
    test_user_id UUID;
    count_categories INTEGER;
    count_clientes INTEGER;
    count_transactions INTEGER;
    count_vendas INTEGER;
    count_das INTEGER;
BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    
    SELECT COUNT(*) INTO count_categories FROM categories WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO count_clientes FROM clientes WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO count_transactions FROM transactions WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO count_vendas FROM vendas WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO count_das FROM imposto_das WHERE user_id = test_user_id;
    
    RAISE NOTICE '=== RESUMO DOS DADOS INSERIDOS ===';
    RAISE NOTICE 'Usuário de teste: %', test_user_id;
    RAISE NOTICE 'Categorias: %', count_categories;
    RAISE NOTICE 'Clientes: %', count_clientes;
    RAISE NOTICE 'Transações: %', count_transactions;
    RAISE NOTICE 'Vendas: %', count_vendas;
    RAISE NOTICE 'Pagamentos DAS: %', count_das;
    RAISE NOTICE '=================================';
END $$;
```

## 8. Consultas de Verificação

```sql
-- Consultar dados inseridos para verificação

-- Categorias por tipo
SELECT type, COUNT(*) as quantidade 
FROM categories 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1)
GROUP BY type;

-- Transações por mês
SELECT 
    DATE_TRUNC('month', date) as mes,
    type,
    COUNT(*) as quantidade,
    SUM(value) as total
FROM transactions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1)
GROUP BY DATE_TRUNC('month', date), type
ORDER BY mes DESC, type;

-- Vendas por cliente
SELECT 
    cliente_nome,
    COUNT(*) as total_vendas,
    SUM(valor) as valor_total
FROM vendas 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1)
GROUP BY cliente_nome
ORDER BY valor_total DESC;

-- Status dos pagamentos DAS
SELECT 
    status,
    COUNT(*) as quantidade,
    SUM(valor) as valor_total
FROM imposto_das 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1)
GROUP BY status;
```

## 9. Limpeza dos Dados de Teste (Opcional)

```sql
-- CUIDADO: Este comando remove TODOS os dados de teste do usuário
-- Execute apenas se quiser limpar os dados de teste

/*
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'seu-email@teste.com' LIMIT 1;
    
    -- Deletar em ordem para respeitar as foreign keys
    DELETE FROM imposto_das WHERE user_id = test_user_id;
    DELETE FROM vendas WHERE user_id = test_user_id;
    DELETE FROM transactions WHERE user_id = test_user_id;
    DELETE FROM clientes WHERE user_id = test_user_id;
    DELETE FROM categories WHERE user_id = test_user_id;
    
    RAISE NOTICE 'Dados de teste removidos para o usuário: %', test_user_id;
END $$;
*/
```

## Observações Importantes

1. **Email do Usuário**: Lembre-se de alterar `'seu-email@teste.com'` para o email real do usuário de teste.

2. **Ambiente**: Estes dados são apenas para teste. Nunca execute em produção.

3. **Datas**: As datas são calculadas relativamente à data atual, criando um histórico dos últimos meses.

4. **Valores**: Os valores são fictícios mas realistas para um MEI.

5. **Relacionamentos**: Algumas vendas e pagamentos DAS estão vinculados às transações para testar a integridade referencial.

6. **Verificação**: Use as consultas de verificação para confirmar que os dados foram inseridos corretamente.

7. **Limpeza**: O script de limpeza está comentado por segurança. Descomente apenas se necessário.