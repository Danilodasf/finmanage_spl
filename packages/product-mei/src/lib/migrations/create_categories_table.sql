-- Criação da tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'ambos', 'investimento')),
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se necessário
DO $$
BEGIN
    -- Verificar e excluir políticas existentes
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' 
        AND policyname = 'Usuários podem ver apenas suas próprias categorias'
    ) THEN
        DROP POLICY "Usuários podem ver apenas suas próprias categorias" ON categories;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' 
        AND policyname = 'Usuários podem inserir suas próprias categorias'
    ) THEN
        DROP POLICY "Usuários podem inserir suas próprias categorias" ON categories;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' 
        AND policyname = 'Usuários podem atualizar suas próprias categorias'
    ) THEN
        DROP POLICY "Usuários podem atualizar suas próprias categorias" ON categories;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' 
        AND policyname = 'Usuários podem excluir suas próprias categorias'
    ) THEN
        DROP POLICY "Usuários podem excluir suas próprias categorias" ON categories;
    END IF;
END $$;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas suas próprias categorias" 
  ON categories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias categorias" 
  ON categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias" 
  ON categories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias categorias" 
  ON categories FOR DELETE 
  USING (auth.uid() = user_id);

-- Criação de índice para melhorar performance de consultas (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_categories_user_id'
    ) THEN
        CREATE INDEX idx_categories_user_id ON categories(user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_categories_type'
    ) THEN
        CREATE INDEX idx_categories_type ON categories(type);
    END IF;
END $$; 