# Esquema do Banco de Dados - FinManage MEI

Este documento contém todos os comandos SQL necessários para criar a estrutura completa do banco de dados do sistema FinManage MEI no Supabase.

## 1. Extensões Necessárias

```sql
-- Habilitar extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 2. Tabela de Perfis (profiles)

```sql
-- Criação da tabela de perfis para usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se necessário
DO $$
BEGIN
    -- Verificar e excluir políticas existentes
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Usuários podem ver apenas seu próprio perfil'
    ) THEN
        DROP POLICY "Usuários podem ver apenas seu próprio perfil" ON profiles;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Usuários podem inserir seu próprio perfil'
    ) THEN
        DROP POLICY "Usuários podem inserir seu próprio perfil" ON profiles;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Usuários podem atualizar seu próprio perfil'
    ) THEN
        DROP POLICY "Usuários podem atualizar seu próprio perfil" ON profiles;
    END IF;
END $$;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Função para inserir um novo perfil após registro de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função após inserção de usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 3. Tabela de Categorias (categories)

```sql
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
```

## 4. Tabela de Transações (transactions)

```sql
-- Criação da tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  date DATE NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas suas próprias transações" 
  ON transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias transações" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações" 
  ON transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias transações" 
  ON transactions FOR DELETE 
  USING (auth.uid() = user_id);
```

## 5. Tabela de Clientes (clientes)

```sql
-- Criação da tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf_cnpj TEXT,
  endereco TEXT,
  observacoes TEXT,
  data_cadastro DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas seus próprios clientes" 
  ON clientes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios clientes" 
  ON clientes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios clientes" 
  ON clientes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios clientes" 
  ON clientes FOR DELETE 
  USING (auth.uid() = user_id);
```

## 6. Tabela de Vendas (vendas)

```sql
-- Criação da tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento TEXT NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS (Row Level Security)
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas suas próprias vendas" 
  ON vendas FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias vendas" 
  ON vendas FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias vendas" 
  ON vendas FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias vendas" 
  ON vendas FOR DELETE 
  USING (auth.uid() = user_id);
```

## 7. Tabela de Pagamentos DAS (das_payments / imposto_das)

```sql
-- Criação da tabela de pagamentos DAS
CREATE TABLE IF NOT EXISTS imposto_das (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competencia TEXT NOT NULL,
  vencimento DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  numero_das TEXT,
  data_pagamento DATE,
  status TEXT NOT NULL CHECK (status IN ('Pago', 'Pendente')),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS (Row Level Security)
ALTER TABLE imposto_das ENABLE ROW LEVEL SECURITY;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas seus próprios pagamentos DAS" 
  ON imposto_das FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios pagamentos DAS" 
  ON imposto_das FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios pagamentos DAS" 
  ON imposto_das FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios pagamentos DAS" 
  ON imposto_das FOR DELETE 
  USING (auth.uid() = user_id);
```

## 8. Triggers para Exclusão Automática

```sql
-- Função para executar SQL dinâmico (necessária para AdminSetup)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
```

## 9. Função de Teste dos Triggers

```sql
-- Função para testar os triggers
CREATE OR REPLACE FUNCTION test_deletion_triggers()
RETURNS TEXT AS $$
DECLARE
    test_user_id UUID;
    test_transaction_id UUID;
    test_das_id UUID;
    result_text TEXT := '';
BEGIN
    -- Usar um usuário existente
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RETURN 'ERRO: Nenhum usuário encontrado para teste';
    END IF;
    
    result_text := result_text || 'Iniciando teste com usuário: ' || test_user_id || E'\n';
    
    -- TESTE: Transação DAS
    result_text := result_text || E'\n=== TESTE: Transação DAS ===\n';
    
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
    
    result_text := result_text || E'\n=== TESTE CONCLUÍDO ===\n';
    
    RETURN result_text;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERRO durante o teste: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;
```

## 10. Índices para Performance

```sql
-- Índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_imposto_das_user_id ON imposto_das(user_id);
CREATE INDEX IF NOT EXISTS idx_imposto_das_competencia ON imposto_das(competencia);
```

## Observações Importantes

1. **Row Level Security (RLS)**: Todas as tabelas têm RLS habilitado para garantir que os usuários só acessem seus próprios dados.

2. **Triggers**: Os triggers automáticos garantem a integridade referencial entre transações e registros relacionados (vendas e impostos DAS).

3. **UUIDs**: Todas as chaves primárias usam UUID para melhor segurança e distribuição.

4. **Políticas de Segurança**: Cada tabela tem políticas específicas para SELECT, INSERT, UPDATE e DELETE.

5. **Referências**: As foreign keys são configuradas com CASCADE ou SET NULL conforme apropriado para manter a integridade dos dados.