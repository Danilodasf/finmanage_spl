-- Migração: Triggers para exclusão automática de registros relacionados
-- Criado para automatizar a exclusão de registros em imposto_das e vendas
-- quando uma transação é deletada

-- =====================================================
-- TRIGGER PARA EXCLUSÃO DE REGISTROS DE IMPOSTO_DAS
-- =====================================================

-- Função que será executada quando uma transação for deletada
CREATE OR REPLACE FUNCTION delete_related_imposto_das()
RETURNS TRIGGER AS $$
BEGIN
    -- Log da operação
    RAISE NOTICE 'Trigger: Deletando registros relacionados para transação ID: %', OLD.id;
    
    -- Verificar se é uma transação de DAS (tipo despesa com descrição contendo 'DAS')
    IF OLD.type = 'despesa' AND OLD.description ILIKE '%DAS%' THEN
        -- Deletar registros relacionados na tabela imposto_das
        DELETE FROM imposto_das 
        WHERE transaction_id = OLD.id;
        
        -- Log do resultado
        RAISE NOTICE 'Trigger: Deletados % registros de imposto_das relacionados à transação %', 
                     ROW_COUNT, OLD.id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger para executar ANTES da exclusão da transação
DROP TRIGGER IF EXISTS trigger_delete_related_imposto_das ON transactions;
CREATE TRIGGER trigger_delete_related_imposto_das
    BEFORE DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION delete_related_imposto_das();

-- =====================================================
-- TRIGGER PARA EXCLUSÃO DE REGISTROS DE VENDAS
-- =====================================================

-- Função que será executada quando uma transação for deletada
CREATE OR REPLACE FUNCTION delete_related_vendas()
RETURNS TRIGGER AS $$
BEGIN
    -- Log da operação
    RAISE NOTICE 'Trigger: Verificando vendas relacionadas para transação ID: %', OLD.id;
    
    -- Verificar se é uma transação de receita (vendas)
    IF OLD.type = 'receita' THEN
        -- Deletar registros relacionados na tabela vendas
        DELETE FROM vendas 
        WHERE transaction_id = OLD.id;
        
        -- Log do resultado
        RAISE NOTICE 'Trigger: Deletados % registros de vendas relacionados à transação %', 
                     ROW_COUNT, OLD.id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger para executar ANTES da exclusão da transação
DROP TRIGGER IF EXISTS trigger_delete_related_vendas ON transactions;
CREATE TRIGGER trigger_delete_related_vendas
    BEFORE DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION delete_related_vendas();

-- =====================================================
-- TRIGGER COMBINADO (ALTERNATIVA MAIS EFICIENTE)
-- =====================================================

-- Função combinada que trata ambos os casos
CREATE OR REPLACE FUNCTION delete_related_records()
RETURNS TRIGGER AS $$
BEGIN
    -- Log da operação
    RAISE NOTICE 'Trigger: Processando exclusão de registros relacionados para transação ID: % (tipo: %, descrição: %)', 
                 OLD.id, OLD.type, OLD.description;
    
    -- Verificar se é uma transação de DAS
    IF OLD.type = 'despesa' AND OLD.description ILIKE '%DAS%' THEN
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

-- Remover triggers individuais se existirem
DROP TRIGGER IF EXISTS trigger_delete_related_imposto_das ON transactions;
DROP TRIGGER IF EXISTS trigger_delete_related_vendas ON transactions;

-- Criar o trigger combinado
DROP TRIGGER IF EXISTS trigger_delete_related_records ON transactions;
CREATE TRIGGER trigger_delete_related_records
    BEFORE DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION delete_related_records();

-- =====================================================
-- VERIFICAÇÃO E TESTES
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
    -- Usar um usuário existente ou criar um de teste
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
            (SELECT id FROM categories WHERE name = 'Impostos' AND user_id = test_user_id LIMIT 1))
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
    
    -- TESTE 2: Transação de Venda
    result_text := result_text || E'\n=== TESTE 2: Transação de Venda ===\n';
    
    -- Inserir transação de receita
    INSERT INTO transactions (user_id, type, date, value, description, category_id)
    VALUES (test_user_id, 'receita', CURRENT_DATE, 200.00, 'Venda - Teste', 
            (SELECT id FROM categories WHERE name = 'Vendas' AND user_id = test_user_id LIMIT 1))
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
    
    result_text := result_text || E'\n=== TESTE CONCLUÍDO ===\n';
    
    RETURN result_text;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERRO durante o teste: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

-- Para executar o teste, use:
-- SELECT test_deletion_triggers();

-- Para verificar se os triggers estão ativos:
-- SELECT trigger_name, event_manipulation, action_timing 
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'transactions';

-- Para ver os logs dos triggers em tempo real:
-- LISTEN para mensagens NOTICE no cliente PostgreSQL

-- Para remover os triggers se necessário:
-- DROP TRIGGER IF EXISTS trigger_delete_related_records ON transactions;
-- DROP FUNCTION IF EXISTS delete_related_records();
-- DROP FUNCTION IF EXISTS test_deletion_triggers();