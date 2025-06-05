import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qvtniooiarxjczikmiui.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dG5pb29pYXJ4amN6aWttaXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjEwNjgsImV4cCI6MjA2NDYzNzA2OH0.aNl9IBCYvzOEAQpHZkeWh14jY5OmLpXcIANvoDah7kg';

// Criar cliente do Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Função auxiliar para verificar se o usuário está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  const { data, error } = await supabase.auth.getSession();
  return !error && data?.session !== null;
};

// Função para obter o usuário atual
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

// Função para obter o ID do usuário atual
export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  return user?.id || null;
}; 