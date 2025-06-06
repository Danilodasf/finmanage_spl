-- Migração: Corrigir problema de triggers para exclusão automática
-- Adicionar coluna transaction_id e aplicar triggers funcionais

-- =====================================================
-- PASSO 1: ADICIONAR COLUNA TRANSACTION_ID
-- =====================================================

-- Adicionar coluna transaction_id na tabela imposto_das se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'imposto_das' 
        AND column_name = 'transaction_id'
    ) THEN
        ALTER TABLE imposto_das 
        ADD COLUMN transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Coluna transaction_id adicionada à tabela imposto_das';
    ELSE
        RAISE NOTICE 'Coluna transaction_id já existe na tabela imposto_das';
    END IF;
END $$;

-- Adicionar coluna transaction_id na tabela vendas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendas' 
        AND column_name = 'transaction_id'
    ) THEN
        ALTER TABLE vendas 
        ADD COLUMN transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Coluna transaction_id adicionada à tabela vendas';
    ELSE
        RAISE NOTICE 'Coluna transaction_id já existe na tabela vendas';
    END IF;
END $$;

-- =====================================================
-- PASSO 2: CRIAR FUNÇÃO EXEC_SQL SE NÃO EXISTIR
-- =====================================================

-- Função para executar SQL dinâmico (necessária para AdminSetup)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PASSO 3: TRIGGERS PARA EXCLUSÃO AUTOMÁTICA
-- =====================================================

-- Função que será executada quando uma transação for deletada
CREATE OR REPLACE FUNCTION delete_related_records()
RETURNS TRIGGER AS $$
BEGIN
    -- Log da operação
    RAISE NOTICE 'Trigger: Processando exclusão de registros relacionados para transação ID: % (tipo: %, descrição: %)', 
                 OLD.id, OLD.type, OLD.description;
    
    -- Verificar se é uma transação de DAS (tipo despesa com descrição contendo 'DAS')
    IF OLD.type = 'despesa' AND (OLD.description ILIKE '%DAS%' OR OLD.description ILIKE '%imposto%') THEN
        DELETE FROM imposto_das WHERE transaction_id = OLD.id;
        RAISE NOTICE 'Trigger: Deletados % registros de imposto_das', ROW_COUNT;
    END IF;
    
    -- Verificar se é uma transação de receita (vendas)
    IF OLD.type = 'receita' THEN
        DELETE FROM vendas WHERE transaction_id = OLD.id;
        RAISE NOTICE 'Trigger: Deletados % registros de vendas', ROW_COUNT;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers existentes
DROP TRIGGER IF EXISTS trigger_delete_related_imposto_das ON transactions;
DROP TRIGGER IF EXISTS trigger_delete_related_vendas ON transactions;
DROP TRIGGER IF EXISTS trigger_delete_related_records ON transactions;

-- Criar o trigger combinado
CREATE TRIGGER trigger_delete_related_records
    BEFORE DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION delete_related_records();

-- =====================================================
-- PASSO 4: FUNÇÃO DE TESTE
-- =====================================================

-- Função para testar os triggers
CREATE OR REPLACE FUNCTION test_deletion_triggers()
RETURNS TEXT AS $$
DECLARE
    test_user_id UUID;
    test_transaction_id UUID;
    test_das_id UUID;
    test_venda_id UUID;
    result_text TEXT := '';
BEGIN
    -- Usar um usuário existente
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RETURN 'ERRO: Nenhum usuário encontrado para teste';
    END IF;
    
    result_text := result_text || 'Iniciando teste com usuário: ' || test_user_id || E'\n';
    
    -- TESTE 1: Transação DAS
    result_text := result_text || E'\n=== TESTE 1: Transação DAS ===\n';
    
    -- Inserir transação de DAS
    INSERT INTO transactions (user_id, type, date, value, description, category_id)
    VALUES (test_user_id, 'despesa', CURRENT_DATE, 100.00, 'Pagamento DAS - Teste', 
            (SELECT id FROM categories WHERE user_id = test_user_id LIMIT 1))
    RETURNING id INTO test_transaction_id;
    
    result_text := result_text || 'Transação DAS criada: ' || test_transaction_id || E'\n';
    
    -- Inserir registro de imposto_das relacionado
    INSERT INTO imposto_das (user_id, competencia, vencimento, valor, status, transaction_id)
    VALUES (test_user_id, '2024-01', CURRENT_DATE, 100.00, 'Pago', test_transaction_id)
    RETURNING id INTO test_das_id;
    
    result_text := result_text || 'Registro imposto_das criado: ' || test_das_id || E'\n';
    
    -- Deletar transação (deve deletar o DAS automaticamente)
    DELETE FROM transactions WHERE id = test_transaction_id;
    
    -- Verificar se o DAS foi deletado
    IF NOT EXISTS (SELECT 1 FROM imposto_das WHERE id = test_das_id) THEN
        result_text := result_text || 'SUCESSO: Registro imposto_das foi deletado automaticamente' || E'\n';
    ELSE
        result_text := result_text || 'FALHA: Registro imposto_das NÃO foi deletado' || E'\n';
    END IF;
    
    -- TESTE 2: Transação de Venda (se a tabela vendas existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendas') THEN
        result_text := result_text || E'\n=== TESTE 2: Transação de Venda ===\n';
        
        -- Inserir transação de receita
        INSERT INTO transactions (user_id, type, date, value, description, category_id)
        VALUES (test_user_id, 'receita', CURRENT_DATE, 200.00, 'Venda - Teste', 
                (SELECT id FROM categories WHERE user_id = test_user_id LIMIT 1))
        RETURNING id INTO test_transaction_id;
        
        result_text := result_text || 'Transação de venda criada: ' || test_transaction_id || E'\n';
        
        -- Inserir registro de venda relacionado
        INSERT INTO vendas (user_id, data, valor, descricao, transaction_id)
        VALUES (test_user_id, CURRENT_DATE, 200.00, 'Venda teste', test_transaction_id)
        RETURNING id INTO test_venda_id;
        
        result_text := result_text || 'Registro venda criado: ' || test_venda_id || E'\n';
        
        -- Deletar transação (deve deletar a venda automaticamente)
        DELETE FROM transactions WHERE id = test_transaction_id;
        
        -- Verificar se a venda foi deletada
        IF NOT EXISTS (SELECT 1 FROM vendas WHERE id = test_venda_id) THEN
            result_text := result_text || 'SUCESSO: Registro venda foi deletado automaticamente' || E'\n';
        ELSE
            result_text := result_text || 'FALHA: Registro venda NÃO foi deletado' || E'\n';
        END IF;
    ELSE
        result_text := result_text || E'\n=== TESTE 2: PULADO (tabela vendas não existe) ===\n';
    END IF;
    
    result_text := result_text || E'\n=== TESTE CONCLUÍDO ===\n';
    
    RETURN result_text;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERRO durante o teste: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASSO 5: VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se os triggers estão ativos
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE event_object_table = 'transactions'
    AND trigger_name = 'trigger_delete_related_records';
    
    IF trigger_count > 0 THEN
        RAISE NOTICE 'Trigger trigger_delete_related_records está ativo';
    ELSE
        RAISE NOTICE 'ATENÇÃO: Trigger trigger_delete_related_records NÃO está ativo';
    END IF;
END $$;

-- Comentários finais
-- Para executar o teste: SELECT test_deletion_triggers();
-- Para verificar triggers: SELECT trigger_name, event_manipulation, action_timing FROM information_schema.triggers WHERE event_object_table = 'transactions';
-- Para ver logs: Ativar log_statement = 'all' no PostgreSQL ou usar LISTEN/NOTIFY