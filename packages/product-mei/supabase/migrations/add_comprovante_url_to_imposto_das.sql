-- Migração para adicionar coluna comprovante_url na tabela imposto_das
-- Data: 2024-01-15
-- Descrição: Adiciona suporte para armazenar URLs de comprovantes de pagamento DAS

-- Adicionar coluna comprovante_url se não existir
ALTER TABLE imposto_das 
ADD COLUMN IF NOT EXISTS comprovante_url TEXT;

-- Adicionar comentário na coluna
COMMENT ON COLUMN imposto_das.comprovante_url IS 'URL do comprovante de pagamento armazenado no Supabase Storage';

-- Criar índice para melhorar performance de consultas por comprovante
CREATE INDEX IF NOT EXISTS idx_imposto_das_comprovante ON imposto_das(comprovante_url);

-- Verificar se a coluna foi adicionada com sucesso
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'imposto_das' 
        AND column_name = 'comprovante_url'
    ) THEN
        RAISE NOTICE 'Coluna comprovante_url adicionada com sucesso à tabela imposto_das';
    ELSE
        RAISE EXCEPTION 'Falha ao adicionar coluna comprovante_url à tabela imposto_das';
    END IF;
END $$;