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

const AdminSetup: React.FC = () => {
  const [isCreatingProfiles, setIsCreatingProfiles] = useState(false);
  const [isUpdatingCategories, setIsUpdatingCategories] = useState(false);
  const [isCreatingDASPayments, setIsCreatingDASPayments] = useState(false);
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-800">Configuração do Banco de Dados</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
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