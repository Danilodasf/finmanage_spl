import React, { useState } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

// SQL para criar a tabela profiles
const createProfilesSQL = `
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
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando um novo usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

// SQL para atualizar a tabela categories
const updateCategoriesSQL = `
-- Primeiro, remover a restrição de chave estrangeira existente
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;

-- Atualizar a coluna para usar a tabela profiles como referência
ALTER TABLE categories 
ADD CONSTRAINT categories_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) ON DELETE CASCADE;
`;

// SQL para criar a tabela das_payments
const createDASPaymentsSQL = `
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
`;

// SQL para corrigir triggers de exclusão automática
const fixTriggersSQL = `
-- Migração: Corrigir problema de triggers para exclusão automática
-- Adicionar coluna transaction_id e aplicar triggers funcionais

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
    
    result_text := result_text || 'Iniciando teste com usuário: ' || test_user_id || E'\\n';
    
    -- TESTE: Transação DAS
    result_text := result_text || E'\\n=== TESTE: Transação DAS ===\\n';
    
    -- Inserir transação de DAS
    INSERT INTO transactions (user_id, type, date, value, description, category_id)
    VALUES (test_user_id, 'despesa', CURRENT_DATE, 100.00, 'Pagamento DAS - Teste', 
            (SELECT id FROM categories WHERE user_id = test_user_id LIMIT 1))
    RETURNING id INTO test_transaction_id;
    
    result_text := result_text || 'Transação DAS criada: ' || test_transaction_id || E'\\n';
    
    -- Inserir registro de imposto_das relacionado
    INSERT INTO imposto_das (user_id, competencia, vencimento, valor, status, transaction_id)
    VALUES (test_user_id, '2024-01', CURRENT_DATE, 100.00, 'Pago', test_transaction_id)
    RETURNING id INTO test_das_id;
    
    result_text := result_text || 'Registro imposto_das criado: ' || test_das_id || E'\\n';
    
    -- Deletar transação (deve deletar o DAS automaticamente)
    DELETE FROM transactions WHERE id = test_transaction_id;
    
    -- Verificar se o DAS foi deletado
    IF NOT EXISTS (SELECT 1 FROM imposto_das WHERE id = test_das_id) THEN
        result_text := result_text || 'SUCESSO: Registro imposto_das foi deletado automaticamente' || E'\\n';
    ELSE
        result_text := result_text || 'FALHA: Registro imposto_das NÃO foi deletado' || E'\\n';
    END IF;
    
    result_text := result_text || E'\\n=== TESTE CONCLUÍDO ===\\n';
    
    RETURN result_text;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERRO durante o teste: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;
`;

const AdminSetup: React.FC = () => {
  const [isCreatingProfiles, setIsCreatingProfiles] = useState(false);
  const [isUpdatingCategories, setIsUpdatingCategories] = useState(false);
  const [isCreatingDASPayments, setIsCreatingDASPayments] = useState(false);
  const [isFixingTriggers, setIsFixingTriggers] = useState(false);
  const [isTestingTriggers, setIsTestingTriggers] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, message]);
  };

  const createProfilesTable = async () => {
    setIsCreatingProfiles(true);
    try {
      addMessage('Criando tabela profiles...');
      const { error } = await supabase.rpc('exec_sql', { sql: createProfilesSQL });
      
      if (error) {
        addMessage(`Erro ao criar tabela profiles: ${error.message}`);
        console.error('Erro ao criar tabela profiles:', error);
      } else {
        addMessage('Tabela profiles criada com sucesso!');
      }
    } catch (error) {
      addMessage(`Erro ao criar tabela profiles: ${(error as Error).message}`);
      console.error('Erro ao criar tabela profiles:', error);
    } finally {
      setIsCreatingProfiles(false);
    }
  };

  const updateCategoriesTable = async () => {
    setIsUpdatingCategories(true);
    try {
      addMessage('Atualizando tabela categories...');
      const { error } = await supabase.rpc('exec_sql', { sql: updateCategoriesSQL });
      
      if (error) {
        addMessage(`Erro ao atualizar tabela categories: ${error.message}`);
        console.error('Erro ao atualizar tabela categories:', error);
      } else {
        addMessage('Tabela categories atualizada com sucesso!');
      }
    } catch (error) {
      addMessage(`Erro ao atualizar tabela categories: ${(error as Error).message}`);
      console.error('Erro ao atualizar tabela categories:', error);
    } finally {
      setIsUpdatingCategories(false);
    }
  };

  const createDASPaymentsTable = async () => {
    setIsCreatingDASPayments(true);
    try {
      addMessage('Verificando se a tabela imposto_das já existe...');
      
      // Verificar se a tabela já existe
      const { error: checkError } = await supabase
        .from('imposto_das')
        .select('count')
        .limit(1);
        
      if (!checkError) {
        addMessage('A tabela imposto_das já existe!');
        setIsCreatingDASPayments(false);
        return;
      }
      
      addMessage('Criando tabela imposto_das...');
      const { error } = await supabase.rpc('exec_sql', { sql: createDASPaymentsSQL });
      
      if (error) {
        addMessage(`Erro ao criar tabela imposto_das: ${error.message}`);
        console.error('Erro ao criar tabela imposto_das:', error);
      } else {
        addMessage('Tabela imposto_das criada com sucesso!');
        
        // Verificar se a tabela foi realmente criada
        const { error: verifyError } = await supabase
          .from('imposto_das')
          .select('count')
          .limit(1);
          
        if (verifyError) {
          addMessage(`Erro ao verificar a tabela criada: ${verifyError.message}`);
          console.error('Erro ao verificar a tabela criada:', verifyError);
        } else {
          addMessage('Verificação concluída: tabela imposto_das está pronta para uso!');
        }
      }
    } catch (error) {
      addMessage(`Erro ao criar tabela imposto_das: ${(error as Error).message}`);
      console.error('Erro ao criar tabela imposto_das:', error);
    } finally {
      setIsCreatingDASPayments(false);
    }
  };

  const fixTriggers = async () => {
    setIsFixingTriggers(true);
    try {
      addMessage('Aplicando correção dos triggers de exclusão automática...');
      const { error } = await supabase.rpc('exec_sql', { sql: fixTriggersSQL });
      
      if (error) {
        addMessage(`Erro ao aplicar correção dos triggers: ${error.message}`);
        console.error('Erro ao aplicar correção dos triggers:', error);
      } else {
        addMessage('Correção dos triggers aplicada com sucesso!');
        addMessage('Agora as transações de imposto serão excluídas automaticamente quando a transação for deletada.');
      }
    } catch (error) {
      addMessage(`Erro ao aplicar correção dos triggers: ${(error as Error).message}`);
      console.error('Erro ao aplicar correção dos triggers:', error);
    } finally {
      setIsFixingTriggers(false);
    }
  };

  const testTriggers = async () => {
    setIsTestingTriggers(true);
    try {
      addMessage('Executando teste dos triggers...');
      const { data, error } = await supabase.rpc('test_deletion_triggers');
      
      if (error) {
        addMessage(`Erro ao executar teste: ${error.message}`);
        console.error('Erro ao executar teste:', error);
      } else {
        addMessage('Resultado do teste:');
        const lines = data.split('\n');
        lines.forEach((line: string) => {
          if (line.trim()) {
            addMessage(line);
          }
        });
      }
    } catch (error) {
      addMessage(`Erro ao executar teste: ${(error as Error).message}`);
      console.error('Erro ao executar teste:', error);
    } finally {
      setIsTestingTriggers(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-800">Configuração do Banco de Dados</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tabela Profiles</h2>
            <p className="mb-4">
              Cria uma tabela de perfis para armazenar informações dos usuários.
            </p>
            <Button 
              onClick={createProfilesTable}
              className="bg-emerald-800 hover:bg-emerald-700"
              disabled={isCreatingProfiles}
            >
              {isCreatingProfiles ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Tabela Profiles'
              )}
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Atualizar Tabela Categories</h2>
            <p className="mb-4">
              Atualiza a tabela de categorias para usar a tabela profiles como referência.
            </p>
            <Button 
              onClick={updateCategoriesTable}
              className="bg-emerald-800 hover:bg-emerald-700"
              disabled={isUpdatingCategories}
            >
              {isUpdatingCategories ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Tabela Categories'
              )}
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tabela Imposto DAS</h2>
            <p className="mb-4">
              Cria uma tabela para armazenar os pagamentos do DAS.
            </p>
            <Button 
              onClick={createDASPaymentsTable}
              className="bg-emerald-800 hover:bg-emerald-700"
              disabled={isCreatingDASPayments}
            >
              {isCreatingDASPayments ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Tabela Imposto DAS'
              )}
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Corrigir Triggers</h2>
            <p className="mb-4">
              Aplica a correção dos triggers para exclusão automática de registros de imposto e vendas.
            </p>
            <Button 
              onClick={fixTriggers}
              className="bg-red-600 hover:bg-red-700"
              disabled={isFixingTriggers}
            >
              {isFixingTriggers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aplicando...
                </>
              ) : (
                'Corrigir Triggers'
              )}
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Testar Triggers</h2>
            <p className="mb-4">
              Executa um teste para verificar se os triggers estão funcionando corretamente.
            </p>
            <Button 
              onClick={testTriggers}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isTestingTriggers}
            >
              {isTestingTriggers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Triggers'
              )}
            </Button>
          </Card>
        </div>

        {messages.length > 0 && (
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Log de Mensagens</h2>
            <div className="bg-gray-100 p-4 rounded-md max-h-60 overflow-y-auto">
              {messages.map((message, index) => (
                <p key={index} className="mb-1">
                  {message}
                </p>
              ))}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminSetup;