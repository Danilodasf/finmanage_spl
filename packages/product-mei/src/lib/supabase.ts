import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// Usando variáveis de ambiente obrigatórias
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não configuradas');
  throw new Error('Configuração do Supabase incompleta');
}

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cache para o ID do usuário para minimizar chamadas à API
let cachedUserId: string | null = null;
let userCheckTimestamp: number = 0;
const CACHE_LIFETIME_MS = 5 * 60 * 1000; // 5 minutos

// Função para limpar cache local
export const clearUserCache = () => {
  console.log('clearUserCache - Limpando cache do usuário...');
  cachedUserId = null;
  userCheckTimestamp = 0;
};

// Função auxiliar para verificar se o usuário está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    console.log('isAuthenticated - Verificando autenticação...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('isAuthenticated - Erro ao verificar sessão:', error);
      return false;
    }
    
    const isAuth = data?.session !== null;
    console.log('isAuthenticated - Usuário está autenticado:', isAuth);
    return isAuth;
  } catch (error) {
    console.error('isAuthenticated - Erro inesperado:', error);
    return false;
  }
};

// Função para obter o usuário atual
export const getCurrentUser = async () => {
  try {
    console.log('getCurrentUser - Obtendo usuário atual...');
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('getCurrentUser - Erro ao obter usuário:', error);
      return null;
    }
    
    if (!data?.user) {
      console.warn('getCurrentUser - Nenhum usuário encontrado na sessão');
      return null;
    }
    
    console.log('getCurrentUser - Usuário obtido com sucesso:', data.user.id);
    return data.user;
  } catch (error) {
    console.error('getCurrentUser - Erro inesperado:', error);
    return null;
  }
};

// Função para obter o ID do usuário atual
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    // Verificar se temos um ID em cache válido
    const now = Date.now();
    if (cachedUserId && (now - userCheckTimestamp) < CACHE_LIFETIME_MS) {
      console.log('getCurrentUserId - Usando ID em cache:', cachedUserId);
      return cachedUserId;
    }
    
    console.log('getCurrentUserId - Verificando autenticação...');
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      console.error('getCurrentUserId - Usuário não autenticado');
      cachedUserId = null;
      userCheckTimestamp = now;
      return null;
    }
    
    console.log('getCurrentUserId - Obtendo usuário...');
    const user = await getCurrentUser();
    
    if (!user) {
      console.error('getCurrentUserId - Não foi possível obter o usuário');
      cachedUserId = null;
      userCheckTimestamp = now;
      return null;
    }
    
    console.log('getCurrentUserId - ID do usuário:', user.id);
    cachedUserId = user.id;
    userCheckTimestamp = now;
    return user.id;
  } catch (error) {
    console.error('getCurrentUserId - Erro ao obter ID do usuário:', error);
    return null;
  }
};

// Função para testar a conexão com o Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('testSupabaseConnection - Testando conexão com o Supabase...');
    console.log('URL do Supabase:', supabaseUrl);
    
    // Verificar autenticação primeiro
    const authenticated = await isAuthenticated();
    console.log('testSupabaseConnection - Usuário autenticado:', authenticated);
    
    // Tentar fazer uma consulta simples
    console.log('testSupabaseConnection - Tentando consulta básica...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    if (error) {
      // Ignora erro específico de não encontrar registros (PGRST116), pois é apenas um teste de conectividade
      if (error.code === 'PGRST116') {
        console.log('testSupabaseConnection - Nenhum perfil encontrado, mas conexão OK');
        return true;
      }
      
      console.error('testSupabaseConnection - Erro na consulta:', error);
      return false;
    }
    
    console.log('testSupabaseConnection - Conexão com Supabase bem-sucedida!');
    return true;
  } catch (error) {
    console.error('testSupabaseConnection - Erro ao testar conexão:', error);
    return false;
  }
};

// Função para garantir que o perfil do usuário exista
export const ensureUserProfile = async (): Promise<boolean> => {
  try {
    console.log('ensureUserProfile - Verificando perfil do usuário...');
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.error('ensureUserProfile - Usuário não autenticado');
      return false;
    }
    
    // Verificar se o perfil já existe
    console.log('ensureUserProfile - Verificando se perfil já existe...');
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (checkError) {
      if (checkError.code !== 'PGRST116') { // PGRST116 = Não encontrado
        console.error('ensureUserProfile - Erro ao verificar perfil:', checkError);
        return false;
      }
      console.log('ensureUserProfile - Perfil não encontrado, será criado');
    } else {
      console.log('ensureUserProfile - Perfil já existe:', existingProfile);
      return true;
    }
    
    // Obter dados do usuário para o perfil
    const user = await getCurrentUser();
    if (!user) {
      console.error('ensureUserProfile - Não foi possível obter dados do usuário');
      return false;
    }
    
    // Criar perfil caso não exista
    console.log('ensureUserProfile - Criando perfil...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        updated_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error('ensureUserProfile - Erro ao criar perfil:', insertError);
      return false;
    }
    
    console.log('ensureUserProfile - Perfil criado com sucesso');
    return true;
  } catch (error) {
    console.error('ensureUserProfile - Erro inesperado:', error);
    return false;
  }
};