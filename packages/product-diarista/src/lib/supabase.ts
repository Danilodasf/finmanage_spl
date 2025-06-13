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
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyekrwayznhdcpaluono.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZWtyd2F5em5oZGNwYWx1b25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MDY1NTIsImV4cCI6MjA2NDk4MjU1Mn0.UPW7525WhuTTyvYne1mOJTiomVkHw74XrW6kY2MvM6g';
    
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