import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// Usando valores fixos por simplicidade
const supabaseUrl = 'https://qvtniooiarxjczikmiui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dG5pb29pYXJ4amN6aWttaXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjEwNjgsImV4cCI6MjA2NDYzNzA2OH0.aNl9IBCYvzOEAQpHZkeWh14jY5OmLpXcIANvoDah7kg';

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  try {
    const user = await getCurrentUser();
    console.log('getCurrentUserId - usuário obtido:', user);
    
    if (!user) {
      console.error('getCurrentUserId - Usuário não autenticado');
      return null;
    }
    
    console.log('getCurrentUserId - ID do usuário:', user.id);
    
    // Verificar se o usuário existe na tabela auth.users
    const { data: userExists, error: userCheckError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (userCheckError) {
      console.log('getCurrentUserId - Erro ao verificar usuário no banco:', userCheckError);
      
      // Vamos verificar se o erro é porque a tabela não existe ou se o usuário não existe
      if (userCheckError.code === '42P01') { // Relação não existe
        console.log('getCurrentUserId - Tabela auth.users não acessível diretamente, assumindo que o usuário existe');
        return user.id;
      } else {
        console.error('getCurrentUserId - Erro ao verificar usuário:', userCheckError);
        
        // Mesmo com erro, vamos tentar retornar o ID do usuário, já que o erro pode ser de permissão
        return user.id;
      }
    }
    
    if (!userExists) {
      console.error('getCurrentUserId - ID do usuário não encontrado no banco');
      return null;
    }
    
    return user.id;
  } catch (error) {
    console.error('getCurrentUserId - Erro ao obter ID do usuário:', error);
    return null;
  }
};

// Função para testar a conexão com o Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testando conexão com o Supabase...');
    console.log('URL do Supabase:', supabaseUrl);
    
    // Tentar fazer uma consulta simples
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1).maybeSingle();
    
    if (error && error.code !== '42P01') { // Ignora erro de tabela não existente (esperado)
      console.error('Erro ao testar conexão com Supabase:', error);
      return false;
    }
    
    // Verificar a sessão atual para testar autenticação
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Erro ao testar autenticação com Supabase:', sessionError);
      return false;
    }
    
    console.log('Sessão do Supabase:', session);
    console.log('Conexão com Supabase bem-sucedida!');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão com Supabase:', error);
    return false;
  }
};

// Função para garantir que o perfil do usuário exista
export const ensureUserProfile = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.error('ensureUserProfile - Usuário não autenticado');
      return false;
    }
    
    // Verificar se o perfil já existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = Não encontrado
      console.error('ensureUserProfile - Erro ao verificar perfil:', checkError);
    }
    
    // Se o perfil já existe, não precisa criar
    if (existingProfile) {
      console.log('ensureUserProfile - Perfil já existe');
      return true;
    }
    
    // Criar perfil caso não exista
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email
      });
      
    if (insertError) {
      console.error('ensureUserProfile - Erro ao criar perfil:', insertError);
      return false;
    }
    
    console.log('ensureUserProfile - Perfil criado com sucesso');
    return true;
  } catch (error) {
    console.error('ensureUserProfile - Erro:', error);
    return false;
  }
}; 