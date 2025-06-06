# 📊 Esquema do Banco de Dados - FinManage Personal

Este documento contém todos os comandos SQL necessários para criar a estrutura completa do banco de dados do sistema FinManage Personal no Supabase.

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

-- Criar políticas RLS para categorias
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se necessário
DO $$
BEGIN
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
        AND policyname = 'Usuários podem deletar suas próprias categorias'
    ) THEN
        DROP POLICY "Usuários podem deletar suas próprias categorias" ON categories;
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

CREATE POLICY "Usuários podem deletar suas próprias categorias" 
  ON categories FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
```

## 4. Tabela de Transações (transactions)

```sql
-- Criação da tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  date DATE NOT NULL,
  value DECIMAL(10,2) NOT NULL CHECK (value > 0),
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS para transações
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transactions' 
        AND policyname = 'Usuários podem ver apenas suas próprias transações'
    ) THEN
        DROP POLICY "Usuários podem ver apenas suas próprias transações" ON transactions;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transactions' 
        AND policyname = 'Usuários podem inserir suas próprias transações'
    ) THEN
        DROP POLICY "Usuários podem inserir suas próprias transações" ON transactions;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transactions' 
        AND policyname = 'Usuários podem atualizar suas próprias transações'
    ) THEN
        DROP POLICY "Usuários podem atualizar suas próprias transações" ON transactions;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transactions' 
        AND policyname = 'Usuários podem deletar suas próprias transações'
    ) THEN
        DROP POLICY "Usuários podem deletar suas próprias transações" ON transactions;
    END IF;
END $$;

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

CREATE POLICY "Usuários podem deletar suas próprias transações" 
  ON transactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
```

## 5. Tabela de Orçamentos (budgets)

```sql
-- Criação da tabela de orçamentos
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  spent_amount DECIMAL(10,2) DEFAULT 0 CHECK (spent_amount >= 0),
  period TEXT NOT NULL CHECK (period IN ('mensal', 'anual')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS para orçamentos
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'budgets' 
        AND policyname = 'Usuários podem ver apenas seus próprios orçamentos'
    ) THEN
        DROP POLICY "Usuários podem ver apenas seus próprios orçamentos" ON budgets;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'budgets' 
        AND policyname = 'Usuários podem inserir seus próprios orçamentos'
    ) THEN
        DROP POLICY "Usuários podem inserir seus próprios orçamentos" ON budgets;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'budgets' 
        AND policyname = 'Usuários podem atualizar seus próprios orçamentos'
    ) THEN
        DROP POLICY "Usuários podem atualizar seus próprios orçamentos" ON budgets;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'budgets' 
        AND policyname = 'Usuários podem deletar seus próprios orçamentos'
    ) THEN
        DROP POLICY "Usuários podem deletar seus próprios orçamentos" ON budgets;
    END IF;
END $$;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas seus próprios orçamentos" 
  ON budgets FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios orçamentos" 
  ON budgets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios orçamentos" 
  ON budgets FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios orçamentos" 
  ON budgets FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);
```

## 6. Tabela de Metas (goals)

```sql
-- Criação da tabela de metas financeiras
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(10,2) DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE,
  description TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'pausado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS para metas
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'goals' 
        AND policyname = 'Usuários podem ver apenas suas próprias metas'
    ) THEN
        DROP POLICY "Usuários podem ver apenas suas próprias metas" ON goals;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'goals' 
        AND policyname = 'Usuários podem inserir suas próprias metas'
    ) THEN
        DROP POLICY "Usuários podem inserir suas próprias metas" ON goals;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'goals' 
        AND policyname = 'Usuários podem atualizar suas próprias metas'
    ) THEN
        DROP POLICY "Usuários podem atualizar suas próprias metas" ON goals;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'goals' 
        AND policyname = 'Usuários podem deletar suas próprias metas'
    ) THEN
        DROP POLICY "Usuários podem deletar suas próprias metas" ON goals;
    END IF;
END $$;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas suas próprias metas" 
  ON goals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias metas" 
  ON goals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias metas" 
  ON goals FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias metas" 
  ON goals FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
```

## 7. Tabela de Investimentos (investments)

```sql
-- Criação da tabela de investimentos
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  total_returns DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS para investimentos
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Usuários podem ver apenas seus próprios investimentos'
    ) THEN
        DROP POLICY "Usuários podem ver apenas seus próprios investimentos" ON investments;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Usuários podem inserir seus próprios investimentos'
    ) THEN
        DROP POLICY "Usuários podem inserir seus próprios investimentos" ON investments;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Usuários podem atualizar seus próprios investimentos'
    ) THEN
        DROP POLICY "Usuários podem atualizar seus próprios investimentos" ON investments;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Usuários podem deletar seus próprios investimentos'
    ) THEN
        DROP POLICY "Usuários podem deletar seus próprios investimentos" ON investments;
    END IF;
END $$;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas seus próprios investimentos" 
  ON investments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios investimentos" 
  ON investments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios investimentos" 
  ON investments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios investimentos" 
  ON investments FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_category_id ON investments(category_id);
```

## 8. Tabela de Rendimentos de Investimentos (investment_returns)

```sql
-- Criação da tabela de rendimentos de investimentos
CREATE TABLE IF NOT EXISTS investment_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas RLS para rendimentos de investimentos
ALTER TABLE investment_returns ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investment_returns' 
        AND policyname = 'Usuários podem ver apenas rendimentos de seus investimentos'
    ) THEN
        DROP POLICY "Usuários podem ver apenas rendimentos de seus investimentos" ON investment_returns;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investment_returns' 
        AND policyname = 'Usuários podem inserir rendimentos em seus investimentos'
    ) THEN
        DROP POLICY "Usuários podem inserir rendimentos em seus investimentos" ON investment_returns;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investment_returns' 
        AND policyname = 'Usuários podem atualizar rendimentos de seus investimentos'
    ) THEN
        DROP POLICY "Usuários podem atualizar rendimentos de seus investimentos" ON investment_returns;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investment_returns' 
        AND policyname = 'Usuários podem deletar rendimentos de seus investimentos'
    ) THEN
        DROP POLICY "Usuários podem deletar rendimentos de seus investimentos" ON investment_returns;
    END IF;
END $$;

-- Criar as políticas
CREATE POLICY "Usuários podem ver apenas rendimentos de seus investimentos" 
  ON investment_returns FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM investments 
    WHERE investments.id = investment_returns.investment_id 
    AND investments.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem inserir rendimentos em seus investimentos" 
  ON investment_returns FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM investments 
    WHERE investments.id = investment_returns.investment_id 
    AND investments.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar rendimentos de seus investimentos" 
  ON investment_returns FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM investments 
    WHERE investments.id = investment_returns.investment_id 
    AND investments.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem deletar rendimentos de seus investimentos" 
  ON investment_returns FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM investments 
    WHERE investments.id = investment_returns.investment_id 
    AND investments.user_id = auth.uid()
  ));

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_investment_returns_investment_id ON investment_returns(investment_id);
CREATE INDEX IF NOT EXISTS idx_investment_returns_date ON investment_returns(date);
```

## 9. Funções e Triggers Auxiliares

```sql
-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar total_returns dos investimentos
CREATE OR REPLACE FUNCTION update_investment_total_returns()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE investments 
        SET total_returns = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM investment_returns 
            WHERE investment_id = NEW.investment_id
        )
        WHERE id = NEW.investment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE investments 
        SET total_returns = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM investment_returns 
            WHERE investment_id = OLD.investment_id
        )
        WHERE id = OLD.investment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar total_returns automaticamente
DROP TRIGGER IF EXISTS update_investment_returns_trigger ON investment_returns;
CREATE TRIGGER update_investment_returns_trigger
    AFTER INSERT OR UPDATE OR DELETE ON investment_returns
    FOR EACH ROW
    EXECUTE FUNCTION update_investment_total_returns();
```

## 10. Views Úteis

```sql
-- View para resumo financeiro mensal
CREATE OR REPLACE VIEW monthly_financial_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    SUM(CASE WHEN type = 'receita' THEN value ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'despesa' THEN value ELSE 0 END) as total_expenses,
    SUM(CASE WHEN type = 'receita' THEN value ELSE -value END) as net_balance
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date)
ORDER BY user_id, month DESC;

-- View para progresso de metas
CREATE OR REPLACE VIEW goals_progress AS
SELECT 
    g.*,
    ROUND((g.current_amount / g.target_amount) * 100, 2) as progress_percentage,
    CASE 
        WHEN g.current_amount >= g.target_amount THEN 'Concluída'
        WHEN g.target_date < CURRENT_DATE THEN 'Vencida'
        ELSE 'Em andamento'
    END as progress_status
FROM goals g;

-- View para performance de investimentos
CREATE OR REPLACE VIEW investments_performance AS
SELECT 
    i.*,
    ROUND((i.total_returns / i.amount) * 100, 2) as return_percentage,
    c.name as category_name
FROM investments i
LEFT JOIN categories c ON i.category_id = c.id;
```

## 11. Dados Iniciais (Categorias Padrão)

```sql
-- Inserir categorias padrão para novos usuários
-- Esta função será chamada após a criação de um novo usuário
CREATE OR REPLACE FUNCTION create_default_categories_for_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Categorias de Receita
    INSERT INTO categories (user_id, name, type, color, icon) VALUES
    (user_uuid, 'Salário', 'receita', '#10B981', 'DollarSign'),
    (user_uuid, 'Freelance', 'receita', '#3B82F6', 'Briefcase'),
    (user_uuid, 'Investimentos', 'receita', '#8B5CF6', 'TrendingUp'),
    (user_uuid, 'Outros', 'receita', '#F59E0B', 'Plus'),
    
    -- Categorias de Despesa
    (user_uuid, 'Alimentação', 'despesa', '#EF4444', 'Coffee'),
    (user_uuid, 'Transporte', 'despesa', '#F97316', 'Car'),
    (user_uuid, 'Moradia', 'despesa', '#06B6D4', 'Home'),
    (user_uuid, 'Saúde', 'despesa', '#EC4899', 'Heart'),
    (user_uuid, 'Educação', 'despesa', '#8B5CF6', 'BookOpen'),
    (user_uuid, 'Lazer', 'despesa', '#10B981', 'Gamepad2'),
    (user_uuid, 'Compras', 'despesa', '#F59E0B', 'ShoppingBag'),
    
    -- Categorias de Investimento
    (user_uuid, 'Ações', 'investimento', '#3B82F6', 'TrendingUp'),
    (user_uuid, 'Fundos', 'investimento', '#8B5CF6', 'PieChart'),
    (user_uuid, 'Renda Fixa', 'investimento', '#10B981', 'Shield'),
    (user_uuid, 'Criptomoedas', 'investimento', '#F59E0B', 'Zap');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar a função handle_new_user para incluir categorias padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir perfil
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  
  -- Criar categorias padrão
  PERFORM create_default_categories_for_user(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔒 Resumo de Segurança

### Row Level Security (RLS)
Todas as tabelas possuem RLS habilitado com políticas que garantem:
- Usuários só podem acessar seus próprios dados
- Operações CRUD são restritas ao proprietário dos dados
- Relacionamentos entre tabelas respeitam a propriedade dos dados

### Índices de Performance
- Índices em `user_id` para todas as tabelas principais
- Índices em campos de data para consultas temporais
- Índices em campos de categoria para filtragem

### Triggers Automáticos
- Atualização automática de `updated_at`
- Criação automática de perfil e categorias padrão para novos usuários
- Atualização automática de totais de rendimentos de investimentos

### Views Úteis
- Resumo financeiro mensal
- Progresso de metas
- Performance de investimentos

Este esquema fornece uma base sólida e segura para o sistema de gestão financeira pessoal, com todas as funcionalidades necessárias para controle de receitas, despesas, orçamentos, metas e investimentos.