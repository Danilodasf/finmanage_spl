/**
 * Script para configurar triggers no banco de dados Supabase
 * Cria triggers para sincronizar gastos adicionais com transações automaticamente
 */

import { getSupabaseClient } from '../supabase';

const supabase = getSupabaseClient();

/**
 * SQL para criar a função que será executada pela trigger
 */
const createTriggerFunction = `
CREATE OR REPLACE FUNCTION sync_gasto_to_transaction()
RETURNS TRIGGER AS $$
DECLARE
    categoria_despesa_id UUID;
BEGIN
    -- Buscar categoria "Gastos Adicionais" ou criar se não existir
    SELECT id INTO categoria_despesa_id 
    FROM categories 
    WHERE name = 'Gastos Adicionais' 
    AND type = 'despesa' 
    AND user_id = NEW.user_id;
    
    -- Se não encontrar a categoria, criar uma padrão
    IF categoria_despesa_id IS NULL THEN
        INSERT INTO categories (id, user_id, name, type, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            NEW.user_id,
            'Gastos Adicionais',
            'despesa',
            NOW(),
            NOW()
        )
        RETURNING id INTO categoria_despesa_id;
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        -- Criar transação quando gasto é inserido
        INSERT INTO transactions (
            id,
            user_id,
            type,
            category_id,
            description,
            value,
            date,
            payment_method,
            created_at,
            updated_at,
            gasto_servico_id,
            is_auto_generated
        ) VALUES (
            gen_random_uuid(),
            NEW.user_id,
            'despesa',
            categoria_despesa_id,
            CONCAT('Gasto adicional: ', NEW.descricao),
            NEW.valor,
            NEW.data::date,
            'dinheiro', -- valor padrão
            NOW(),
            NOW(),
            NEW.id,
            true
        );
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        -- Atualizar transação correspondente quando gasto é atualizado
        UPDATE transactions 
        SET 
            description = CONCAT('Gasto adicional: ', NEW.descricao),
            value = NEW.valor,
            date = NEW.data::date,
            updated_at = NOW()
        WHERE gasto_servico_id = NEW.id;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        -- Deletar transação correspondente quando gasto é deletado
        DELETE FROM transactions 
        WHERE gasto_servico_id = OLD.id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
`;

/**
 * SQL para criar as triggers
 */
const createTriggers = `
-- Trigger para INSERT
DROP TRIGGER IF EXISTS trigger_gasto_insert ON gastos_servicos;
CREATE TRIGGER trigger_gasto_insert
    AFTER INSERT ON gastos_servicos
    FOR EACH ROW
    EXECUTE FUNCTION sync_gasto_to_transaction();

-- Trigger para UPDATE
DROP TRIGGER IF EXISTS trigger_gasto_update ON gastos_servicos;
CREATE TRIGGER trigger_gasto_update
    AFTER UPDATE ON gastos_servicos
    FOR EACH ROW
    EXECUTE FUNCTION sync_gasto_to_transaction();

-- Trigger para DELETE
DROP TRIGGER IF EXISTS trigger_gasto_delete ON gastos_servicos;
CREATE TRIGGER trigger_gasto_delete
    AFTER DELETE ON gastos_servicos
    FOR EACH ROW
    EXECUTE FUNCTION sync_gasto_to_transaction();
`;

/**
 * SQL para adicionar colunas necessárias na tabela transactions
 */
const addTransactionColumns = `
-- Adicionar coluna para referenciar gasto_servico (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'gasto_servico_id') THEN
        ALTER TABLE transactions ADD COLUMN gasto_servico_id UUID REFERENCES gastos_servicos(id);
    END IF;
END $$;

-- Adicionar coluna para identificar transações geradas automaticamente (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'is_auto_generated') THEN
        ALTER TABLE transactions ADD COLUMN is_auto_generated BOOLEAN DEFAULT false;
    END IF;
END $$;
`;

/**
 * SQL para remover as triggers e função
 */
const removeTriggers = `
-- Remover triggers
DROP TRIGGER IF EXISTS trigger_gasto_insert ON gastos_servicos;
DROP TRIGGER IF EXISTS trigger_gasto_update ON gastos_servicos;
DROP TRIGGER IF EXISTS trigger_gasto_delete ON gastos_servicos;

-- Remover função
DROP FUNCTION IF EXISTS sync_gasto_to_transaction();

-- Remover colunas adicionadas (opcional - comentado para preservar dados)
-- ALTER TABLE transactions DROP COLUMN IF EXISTS gasto_servico_id;
-- ALTER TABLE transactions DROP COLUMN IF EXISTS is_auto_generated;
`;

/**
 * Função para executar SQL no Supabase
 */
async function executeSql(sql: string, description: string): Promise<void> {
  try {
    console.log(`Executando: ${description}...`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`Erro ao ${description.toLowerCase()}:`, error);
      throw error;
    }
    
    console.log(`✅ ${description} executado com sucesso`);
  } catch (error) {
    console.error(`❌ Falha ao ${description.toLowerCase()}:`, error);
    throw error;
  }
}

/**
 * Função principal para configurar as triggers
 */
export async function setupTriggers(): Promise<void> {
  try {
    console.log('🚀 Iniciando configuração das triggers para gastos adicionais...');
    
    // 1. Adicionar colunas necessárias
    await executeSql(addTransactionColumns, 'Adicionando colunas necessárias');
    
    // 2. Criar função da trigger
    await executeSql(createTriggerFunction, 'Criando função da trigger');
    
    // 3. Criar triggers
    await executeSql(createTriggers, 'Criando triggers');
    
    console.log('✅ Triggers configuradas com sucesso!');
    console.log('📝 As seguintes triggers foram criadas:');
    console.log('   - trigger_gasto_insert: Cria transação quando gasto é inserido');
    console.log('   - trigger_gasto_update: Atualiza transação quando gasto é modificado');
    console.log('   - trigger_gasto_delete: Remove transação quando gasto é deletado');
    
  } catch (error) {
    console.error('❌ Erro ao configurar triggers:', error);
    throw error;
  }
}

/**
 * Função para remover as triggers
 */
export async function removeTriggers(): Promise<void> {
  try {
    console.log('🗑️ Removendo triggers para gastos adicionais...');
    
    await executeSql(removeTriggers, 'Removendo triggers e função');
    
    console.log('✅ Triggers removidas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao remover triggers:', error);
    throw error;
  }
}

/**
 * Execução do script via linha de comando
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const shouldRemove = args.includes('--remove');
  
  if (shouldRemove) {
    removeTriggers()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    setupTriggers()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}