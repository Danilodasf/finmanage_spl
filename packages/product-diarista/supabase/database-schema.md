# Database Schema - FinManage Diarista

Este documento contém todos os comandos SQL necessários para criar a estrutura completa do banco de dados do sistema FinManage Diarista no Supabase.

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
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'Tag',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- RLS para categorias
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias
CREATE POLICY "Usuários podem ver suas próprias categorias" 
  ON categories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias categorias" 
  ON categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias" 
  ON categories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias categorias" 
  ON categories FOR DELETE 
  USING (auth.uid() = user_id);
```

## 4. Tabela de Clientes (clientes)

```sql
-- Criação da tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  localizacao TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);

-- RLS para clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
CREATE POLICY "Usuários podem ver seus próprios clientes" 
  ON clientes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios clientes" 
  ON clientes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios clientes" 
  ON clientes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios clientes" 
  ON clientes FOR DELETE 
  USING (auth.uid() = user_id);
```

## 5. Tabela de Serviços (servicos)

```sql
-- Criação da tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  data DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  status TEXT NOT NULL CHECK (status IN ('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')) DEFAULT 'EM_ANDAMENTO',
  descricao TEXT,
  localizacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_servicos_user_id ON servicos(user_id);
CREATE INDEX IF NOT EXISTS idx_servicos_cliente_id ON servicos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicos_data ON servicos(data);
CREATE INDEX IF NOT EXISTS idx_servicos_status ON servicos(status);

-- RLS para serviços
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Políticas para serviços
CREATE POLICY "Usuários podem ver seus próprios serviços" 
  ON servicos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios serviços" 
  ON servicos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios serviços" 
  ON servicos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios serviços" 
  ON servicos FOR DELETE 
  USING (auth.uid() = user_id);
```

## 6. Tabela de Gastos de Serviços (gastos_servicos)

```sql
-- Criação da tabela de gastos de serviços
CREATE TABLE IF NOT EXISTS gastos_servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_gastos_servicos_servico_id ON gastos_servicos(servico_id);
CREATE INDEX IF NOT EXISTS idx_gastos_servicos_user_id ON gastos_servicos(user_id);
CREATE INDEX IF NOT EXISTS idx_gastos_servicos_data ON gastos_servicos(data);

-- RLS para gastos de serviços
ALTER TABLE gastos_servicos ENABLE ROW LEVEL SECURITY;

-- Políticas para gastos de serviços
CREATE POLICY "Usuários podem ver seus próprios gastos de serviços" 
  ON gastos_servicos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios gastos de serviços" 
  ON gastos_servicos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios gastos de serviços" 
  ON gastos_servicos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios gastos de serviços" 
  ON gastos_servicos FOR DELETE 
  USING (auth.uid() = user_id);
```

## 7. Tabela de Transações (transactions)

```sql
-- Criação da tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  date DATE NOT NULL,
  value DECIMAL(10,2) NOT NULL CHECK (value > 0),
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  cliente_telefone TEXT,
  endereco_servico TEXT,
  status_pagamento TEXT CHECK (status_pagamento IN ('pendente', 'pago', 'atrasado')) DEFAULT 'pendente',
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  gasto_servico_id UUID REFERENCES gastos_servicos(id) ON DELETE SET NULL,
  is_auto_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_servico_id ON transactions(servico_id);

-- RLS para transações
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para transações
CREATE POLICY "Usuários podem ver suas próprias transações" 
  ON transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias transações" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações" 
  ON transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias transações" 
  ON transactions FOR DELETE 
  USING (auth.uid() = user_id);
```

## 8. Tabela de Agendamentos (agendamentos)

```sql
-- Criação da tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  data_agendada DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME,
  status TEXT NOT NULL CHECK (status IN ('em_andamento', 'concluido', 'cancelado')) DEFAULT 'em_andamento',
  valor_acordado DECIMAL(10,2) NOT NULL CHECK (valor_acordado >= 0),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_user_id ON agendamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_id ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendada);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- RLS para agendamentos
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para agendamentos
CREATE POLICY "Usuários podem ver seus próprios agendamentos" 
  ON agendamentos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios agendamentos" 
  ON agendamentos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios agendamentos" 
  ON agendamentos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios agendamentos" 
  ON agendamentos FOR DELETE 
  USING (auth.uid() = user_id);
```

## 9. Funções e Triggers

```sql
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_servicos_updated_at BEFORE UPDATE ON gastos_servicos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 10. Função para Gerar Transação Automática de Serviço

```sql
-- Função para criar transação automaticamente quando um serviço é concluído
CREATE OR REPLACE FUNCTION create_transaction_from_servico()
RETURNS TRIGGER AS $$
DECLARE
    cliente_info RECORD;
BEGIN
    -- Só criar transação se o status mudou para CONCLUIDO
    IF NEW.status = 'CONCLUIDO' AND (OLD.status IS NULL OR OLD.status != 'CONCLUIDO') THEN
        -- Buscar informações do cliente
        SELECT nome, telefone, endereco INTO cliente_info
        FROM clientes 
        WHERE id = NEW.cliente_id;
        
        -- Inserir transação de receita
        INSERT INTO transactions (
            user_id,
            type,
            date,
            value,
            description,
            category_id,
            cliente_nome,
            cliente_telefone,
            endereco_servico,
            status_pagamento,
            servico_id,
            is_auto_generated
        ) VALUES (
            NEW.user_id,
            'receita',
            NEW.data,
            NEW.valor,
            COALESCE(NEW.descricao, 'Serviço realizado para ' || cliente_info.nome),
            NEW.categoria_id,
            cliente_info.nome,
            cliente_info.telefone,
            COALESCE(NEW.localizacao, cliente_info.endereco),
            'pendente',
            NEW.id,
            TRUE
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função após atualização de serviço
CREATE TRIGGER create_transaction_on_servico_completion
    AFTER INSERT OR UPDATE ON servicos
    FOR EACH ROW EXECUTE FUNCTION create_transaction_from_servico();
```

## 11. Função para Gerar Transação Automática de Gasto de Serviço

```sql
-- Função para criar transação automaticamente quando um gasto de serviço é criado
CREATE OR REPLACE FUNCTION create_transaction_from_gasto_servico()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir transação de despesa
    INSERT INTO transactions (
        user_id,
        type,
        date,
        value,
        description,
        category_id,
        gasto_servico_id,
        is_auto_generated
    ) VALUES (
        NEW.user_id,
        'despesa',
        NEW.data,
        NEW.valor,
        NEW.descricao,
        NEW.categoria_id,
        NEW.id,
        TRUE
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função após inserção de gasto de serviço
CREATE TRIGGER create_transaction_on_gasto_servico_insert
    AFTER INSERT ON gastos_servicos
    FOR EACH ROW EXECUTE FUNCTION create_transaction_from_gasto_servico();
```

## 12. Views Úteis

```sql
-- View para relatório de serviços com informações do cliente
CREATE OR REPLACE VIEW vw_servicos_completos AS
SELECT 
    s.id,
    s.user_id,
    s.data,
    s.valor,
    s.status,
    s.descricao,
    s.localizacao,
    c.nome as cliente_nome,
    c.telefone as cliente_telefone,
    c.email as cliente_email,
    cat.name as categoria_nome,
    cat.type as categoria_tipo,
    s.created_at,
    s.updated_at
FROM servicos s
LEFT JOIN clientes c ON s.cliente_id = c.id
LEFT JOIN categories cat ON s.categoria_id = cat.id;

-- View para relatório financeiro mensal
CREATE OR REPLACE VIEW vw_resumo_financeiro_mensal AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as mes,
    SUM(CASE WHEN type = 'receita' THEN value ELSE 0 END) as total_receitas,
    SUM(CASE WHEN type = 'despesa' THEN value ELSE 0 END) as total_despesas,
    SUM(CASE WHEN type = 'receita' THEN value ELSE -value END) as saldo_liquido,
    COUNT(CASE WHEN type = 'receita' THEN 1 END) as qtd_receitas,
    COUNT(CASE WHEN type = 'despesa' THEN 1 END) as qtd_despesas
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date)
ORDER BY user_id, mes DESC;
```

## Observações Importantes

1. **Row Level Security (RLS)**: Todas as tabelas têm RLS habilitado para garantir que usuários só acessem seus próprios dados.

2. **Triggers Automáticos**: 
   - Serviços concluídos geram automaticamente transações de receita
   - Gastos de serviços geram automaticamente transações de despesa
   - Campos `updated_at` são atualizados automaticamente

3. **Integridade Referencial**: Todas as foreign keys estão configuradas com as ações apropriadas (CASCADE, SET NULL, RESTRICT).

4. **Índices**: Criados para otimizar consultas frequentes por user_id, data, status, etc.

5. **Validações**: Constraints CHECK garantem que valores monetários sejam positivos e status sejam válidos.

6. **Views**: Criadas para facilitar relatórios e consultas complexas.