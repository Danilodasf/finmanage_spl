import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qvtniooiarxjczikmiui.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dG5pb29pYXJ4amN6aWttaXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjEwNjgsImV4cCI6MjA2NDYzNzA2OH0.aNl9IBCYvzOEAQpHZkeWh14jY5OmLpXcIANvoDah7kg';

// Criar cliente do Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// TODO: Remover quando o Supabase estiver configurado
// Versões mock para desenvolvimento sem banco de dados
const mockUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  user_metadata: { name: 'Usuário Teste' },
  created_at: new Date().toISOString()
};

// Função auxiliar para verificar se o usuário está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  // Mock: sempre retorna true para desenvolvimento
  return true;
  
  // Versão original (descomentada quando o Supabase estiver configurado):
  // const { data, error } = await supabase.auth.getSession();
  // return !error && data?.session !== null;
};

// Função para obter o usuário atual
export const getCurrentUser = async () => {
  // Mock: retorna usuário fictício para desenvolvimento
  return mockUser;
  
  // Versão original (descomentada quando o Supabase estiver configurado):
  // const { data } = await supabase.auth.getUser();
  // return data?.user || null;
};

// Função para obter o ID do usuário atual
export const getCurrentUserId = async (): Promise<string | null> => {
  // Mock: retorna ID fictício para desenvolvimento
  return 'mock-user-id';
  
  // Versão original (descomentada quando o Supabase estiver configurado):
  // const user = await getCurrentUser();
  // return user?.id || null;
};