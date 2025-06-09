/**
 * Configuração centralizada do Supabase
 * Evita múltiplas instâncias do GoTrueClient
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton para o cliente Supabase
let supabaseInstance: SupabaseClient | null = null;

/**
 * Retorna a instância única do cliente Supabase
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
    
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'supabase.auth.token',
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'finmanage-diarista'
        }
      }
    });
    console.log('[Supabase] Cliente inicializado com URL:', supabaseUrl);
  }
  
  return supabaseInstance;
}

/**
 * Exporta a instância do Supabase para uso direto
 */
export const supabase = getSupabaseClient();