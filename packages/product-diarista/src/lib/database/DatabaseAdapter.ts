/**
 * Abstração para adaptador de banco de dados
 * Permite trocar facilmente entre diferentes implementações (mock, Supabase, etc.)
 */

export interface DatabaseResult<T> {
  data: T | null;
  error: Error | null;
}

export interface DatabaseListResult<T> {
  data: T[] | null;
  error: Error | null;
}

/**
 * Interface genérica para operações de banco de dados
 */
export interface DatabaseAdapter {
  // Operações básicas CRUD
  create<T>(table: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<T>>;
  getById<T>(table: string, id: string): Promise<DatabaseResult<T>>;
  getAll<T>(table: string, filters?: Record<string, any>): Promise<DatabaseListResult<T>>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<DatabaseResult<T>>;
  delete(table: string, id: string): Promise<DatabaseResult<boolean>>;
  
  // Operações específicas com filtros
  findWhere<T>(table: string, filters: Record<string, any>): Promise<DatabaseListResult<T>>;
  findOne<T>(table: string, filters: Record<string, any>): Promise<DatabaseResult<T>>;
  findMany<T>(table: string, filters?: Record<string, any>): Promise<DatabaseListResult<T>>;
  
  // Operações de usuário
  getCurrentUserId(): Promise<string | null>;
}



// Configuração do Supabase
import { getSupabaseClient } from '../supabase';

// Implementação real do Supabase
class SupabaseDatabaseAdapter implements DatabaseAdapter {
  private supabase: any;
  private currentUserId: string | null = null;

  constructor() {
    this.supabase = getSupabaseClient();
    console.log('[SupabaseDatabaseAdapter] Usando instância centralizada do Supabase');
  }

  async getCurrentUserId(): Promise<string | null> {
    if (this.currentUserId) {
      return this.currentUserId;
    }
    
    const { data: { user } } = await this.supabase.auth.getUser();
    this.currentUserId = user?.id || null;
    return this.currentUserId;
  }

  async create<T>(table: string, data: any): Promise<DatabaseResult<T>> {
    try {
      console.log(`[SupabaseDatabaseAdapter] Criando registro na tabela ${table}:`, data);
      
      // Adicionar user_id automaticamente para certas tabelas
      if (['transactions', 'categories', 'agendamentos', 'clientes'].includes(table)) {
        const userId = await this.getCurrentUserId();
        if (userId) {
          data.user_id = userId;
        }
      }

      // Mapear 'value' para 'amount' na tabela transactions
      if (table === 'transactions' && data.value !== undefined) {
        data.amount = data.value;
      }

      // Para a tabela profiles, usar uma abordagem especial para contornar RLS durante registro
      let query = this.supabase.from(table);
      
      if (table === 'profiles') {
        // Gerar um UUID para o novo usuário se não fornecido
        if (!data.id) {
          data.id = crypto.randomUUID();
        }
      }
      
      // Para a tabela categories durante registro inicial, usar service_role se disponível
      if (table === 'categories' && data.user_id) {
        // Verificar se o usuário atual não está autenticado (contexto de registro)
        const currentUserId = await this.getCurrentUserId();
        if (!currentUserId) {
          console.log('[SupabaseDatabaseAdapter] Criando categoria durante registro inicial');
          // Durante o registro, usar uma abordagem especial
          // Nota: Em produção, isso deveria ser feito via função do banco ou trigger
        }
      }

      const { data: result, error } = await query
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error(`[SupabaseDatabaseAdapter] Erro ao criar em ${table}:`, error);
        return { data: null, error: new Error(error.message) };
      }

      console.log(`[SupabaseDatabaseAdapter] Registro criado com sucesso em ${table}:`, result);
      return { data: result as T, error: null };
    } catch (error) {
      console.error(`[SupabaseDatabaseAdapter] Erro ao criar registro:`, error);
      return { data: null, error: error as Error };
    }
  }

  async getById<T>(table: string, id: string): Promise<DatabaseResult<T>> {
    try {
      let query = this.supabase.from(table).select('*').eq('id', id);
      
      // Adicionar filtro por user_id para tabelas com RLS
      if (['transactions', 'categories', 'agendamentos', 'clientes'].includes(table)) {
        const userId = await this.getCurrentUserId();
        if (userId) {
          query = query.eq('user_id', userId);
        }
      }
      
      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        return { data: null, error: new Error(error.message) };
      }

      // Mapear 'amount' de volta para 'value' na tabela transactions
      if (table === 'transactions' && data && data.amount !== undefined) {
        data.value = data.amount;
      }

      return { data: data as T || null, error: null };
    } catch (error) {
      console.error(`[SupabaseDatabaseAdapter] Erro ao buscar por ID:`, error);
      return { data: null, error: error as Error };
    }
  }

  async getAll<T>(table: string, filters?: Record<string, any>): Promise<DatabaseListResult<T>> {
    try {
      let query = this.supabase.from(table).select('*');

      // Adicionar filtro por user_id para tabelas com RLS
      if (['transactions', 'categories', 'agendamentos', 'clientes'].includes(table)) {
        const userId = await this.getCurrentUserId();
        if (userId) {
          query = query.eq('user_id', userId);
        }
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      // Mapear 'amount' de volta para 'value' na tabela transactions
      if (table === 'transactions' && data) {
        data.forEach((item: any) => {
          if (item.amount !== undefined) {
            item.value = item.amount;
          }
        });
      }

      return { data: data as T[] || [], error: null };
    } catch (error) {
      console.error(`[SupabaseDatabaseAdapter] Erro ao buscar todos:`, error);
      return { data: null, error: error as Error };
    }
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<DatabaseResult<T>> {
    try {
      // Mapear 'value' para 'amount' na tabela transactions antes de atualizar
      if (table === 'transactions' && (data as any).value !== undefined) {
        (data as any).amount = (data as any).value;
      }

      const { data: result, error } = await this.supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`[SupabaseDatabaseAdapter] Erro ao atualizar:`, error);
        return { data: null, error: new Error(error.message) };
      }

      // Mapear 'amount' de volta para 'value' na tabela transactions
      if (table === 'transactions' && result && (result as any).amount !== undefined) {
        (result as any).value = (result as any).amount;
      }

      return { data: result as T, error: null };
    } catch (error) {
      console.error(`[SupabaseDatabaseAdapter] Erro ao atualizar:`, error);
      return { data: null, error: error as Error };
    }
  }

  async delete(table: string, id: string): Promise<DatabaseResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        return { data: false, error: new Error(error.message) };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error(`[SupabaseDatabaseAdapter] Erro ao deletar:`, error);
      return { data: false, error: error as Error };
    }
  }

  async findWhere<T>(table: string, filters: Record<string, any>): Promise<DatabaseListResult<T>> {
    try {
      let query = this.supabase.from(table).select('*');
      
      // Adicionar filtro por user_id para tabelas com RLS
      if (['transactions', 'categories', 'agendamentos', 'clientes'].includes(table)) {
        const userId = await this.getCurrentUserId();
        if (userId) {
          query = query.eq('user_id', userId);
        }
      }
      
      // Aplicar condições
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data: result, error } = await query;

      if (error) {
        console.error(`[SupabaseDatabaseAdapter] Erro ao buscar registros:`, error);
        return { data: null, error: new Error(error.message) };
      }

      // Mapear 'amount' de volta para 'value' na tabela transactions
      if (table === 'transactions' && result) {
        result.forEach((item: any) => {
          if (item.amount !== undefined) {
            item.value = item.amount;
          }
        });
      }

      return { data: result as T[], error: null };
    } catch (error) {
      console.error(`[SupabaseDatabaseAdapter] Erro ao buscar registros:`, error);
      return { data: null, error: error as Error };
    }
  }

  async findOne<T>(table: string, filters: Record<string, any>): Promise<DatabaseResult<T>> {
    try {
      let query = this.supabase.from(table).select('*');

      // Adicionar filtro por user_id para tabelas com RLS
      if (['transactions', 'categories', 'agendamentos', 'clientes'].includes(table)) {
        const userId = await this.getCurrentUserId();
        if (userId) {
          query = query.eq('user_id', userId);
        }
      }

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as T || null, error: null };
    } catch (error) {
      console.error(`[SupabaseDatabaseAdapter] Erro ao buscar um:`, error);
      return { data: null, error: error as Error };
    }
  }

  async findMany<T>(table: string, filters?: Record<string, any>): Promise<DatabaseListResult<T>> {
    try {
      let query = this.supabase.from(table).select('*');
      
      // Adicionar filtro por user_id para tabelas com RLS
      if (['transactions', 'categories', 'agendamentos', 'clientes'].includes(table)) {
        const userId = await this.getCurrentUserId();
        if (userId) {
          query = query.eq('user_id', userId);
        }
      }
      
      // Aplicar filtros se fornecidos
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data: result, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error(`[SupabaseDatabaseAdapter] Erro ao buscar registros:`, error);
        return { data: null, error: new Error(error.message) };
      }

      // Mapear 'amount' de volta para 'value' na tabela transactions
      if (table === 'transactions' && result) {
        result.forEach((item: any) => {
          if (item.amount !== undefined) {
            item.value = item.amount;
          }
        });
      }

      return { data: result as T[] || [], error: null };
    } catch (error) {
      console.error(`[SupabaseDatabaseAdapter] Erro ao buscar registros:`, error);
      return { data: null, error: error as Error };
    }
  }
}

// Instância global do adaptador de banco de dados
// Usando apenas SupabaseDatabaseAdapter
export const databaseAdapter: DatabaseAdapter = new SupabaseDatabaseAdapter();

console.log('[DatabaseAdapter] Usando SupabaseDatabaseAdapter');