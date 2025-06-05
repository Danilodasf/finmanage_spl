-- Criação da tabela de pagamentos DAS
CREATE TABLE IF NOT EXISTS das_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competencia TEXT NOT NULL,
  vencimento DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  numero_das TEXT,
  data_pagamento DATE,
  comprovante_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('Pago', 'Pendente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS (Row Level Security)
ALTER TABLE das_payments ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se necessário
DO $$
BEGIN
    -- Verificar e excluir políticas existentes
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'das_payments' 
        AND policyname = 'Usuários podem ver apenas seus próprios pagamentos DAS'
    ) THEN
        DROP POLICY "Usuários podem ver apenas seus próprios pagamentos DAS" ON das_payments;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'das_payments' 
        AND policyname = 'Usuários podem inserir seus próprios pagamentos DAS'
    ) THEN
        DROP POLICY "Usuários podem inserir seus próprios pagamentos DAS" ON das_payments;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'das_payments' 
        AND policyname = 'Usuários podem atualizar seus próprios pagamentos DAS'
    ) THEN
        DROP POLICY "Usuários podem atualizar seus próprios pagamentos DAS" ON das_payments;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'das_payments' 
        AND policyname = 'Usuários podem excluir seus próprios pagamentos DAS'
    ) THEN
        DROP POLICY "Usuários podem excluir seus próprios pagamentos DAS" ON das_payments;
    END IF;
END $$;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas seus próprios pagamentos DAS" 
  ON das_payments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios pagamentos DAS" 
  ON das_payments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios pagamentos DAS" 
  ON das_payments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios pagamentos DAS" 
  ON das_payments FOR DELETE 
  USING (auth.uid() = user_id); 