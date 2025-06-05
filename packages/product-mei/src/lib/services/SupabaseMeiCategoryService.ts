import { CategoryService, Category } from '../core-exports';
import { supabase } from '../supabase';
import { getCurrentUserId } from '../supabase';

/**
 * Implementação do serviço de categorias usando Supabase para o produto MEI
 */
export class SupabaseMeiCategoryService implements CategoryService {
  /**
   * Busca todas as categorias
   */
  async getAll(): Promise<{ data: Category[] | null; error: Error | null }> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');
        
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        color: item.color,
        icon: item.icon,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca uma categoria pelo ID
   * @param id ID da categoria
   */
  async getById(id: string): Promise<{ data: Category | null; error: Error | null }> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar categoria:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = {
        id: data.id,
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Cria uma nova categoria
   * @param entity Dados da categoria
   */
  async create(entity: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Category | null; error: Error | null }> {
    console.log('[SupabaseMeiCategoryService] Iniciando create...');
    try {
      const userId = await getCurrentUserId();
      console.log('[SupabaseMeiCategoryService] create - userId:', userId);
      
      if (!userId) {
        console.error('[SupabaseMeiCategoryService] create - Erro: Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const categoryToInsert = {
        ...entity,
        user_id: userId,
      };
      console.log('[SupabaseMeiCategoryService] create - categoryToInsert:', categoryToInsert);
      
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryToInsert)
        .select()
        .single();
        
      if (error) {
        console.error('[SupabaseMeiCategoryService] create - Erro Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return { data: null, error: new Error(error.message) };
      }
      
      console.log('[SupabaseMeiCategoryService] create - Sucesso. Dados retornados:', data);
      // Mapear os dados para o formato esperado
      const formattedData = {
        id: data.id,
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return { data: formattedData, error: null };
    } catch (e) {
      const error = e as Error;
      console.error('[SupabaseMeiCategoryService] create - Erro inesperado:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Atualiza uma categoria existente
   * @param id ID da categoria
   * @param entity Dados para atualização
   */
  async update(id: string, entity: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Category | null; error: Error | null }> {
    console.log('[SupabaseMeiCategoryService] Iniciando update para id:', id);
    try {
      const userId = await getCurrentUserId();
      console.log('[SupabaseMeiCategoryService] update - userId:', userId);
      
      if (!userId) {
        console.error('[SupabaseMeiCategoryService] update - Erro: Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      console.log('[SupabaseMeiCategoryService] update - entity:', entity);
      const { data, error } = await supabase
        .from('categories')
        .update(entity)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('[SupabaseMeiCategoryService] update - Erro Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return { data: null, error: new Error(error.message) };
      }
      
      console.log('[SupabaseMeiCategoryService] update - Sucesso. Dados retornados:', data);
      // Mapear os dados para o formato esperado
      const formattedData = {
        id: data.id,
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return { data: formattedData, error: null };
    } catch (e) {
      const error = e as Error;
      console.error('[SupabaseMeiCategoryService] update - Erro inesperado:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Remove uma categoria
   * @param id ID da categoria
   */
  async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        return { success: false, error: new Error('Usuário não autenticado') };
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao excluir categoria:', error);
        return { success: false, error: new Error(error.message) };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      return { success: false, error: error as Error };
    }
  }
  
  /**
   * Busca categorias por tipo
   * @param type Tipo da categoria
   */
  async getByType(type: 'receita' | 'despesa' | 'ambos' | 'investimento'): Promise<{ data: Category[] | null; error: Error | null }> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('name');
        
      if (error) {
        console.error('Erro ao buscar categorias por tipo:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        color: item.color,
        icon: item.icon,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias por tipo:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Garante que as categorias padrão existam para o usuário atual
   */
  async ensureDefaultCategories(): Promise<void> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se já existem categorias para o usuário
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao verificar categorias existentes:', error);
        return;
      }
      
      // Se já existirem categorias, não precisa criar as padrão
      if (data && data.length > 0) {
        return;
      }
      
      // Categorias padrão para MEI
      const defaultCategories = [
        { name: 'Vendas', type: 'receita', color: '#4CAF50' },
        { name: 'Serviços', type: 'receita', color: '#2196F3' },
        { name: 'Materiais', type: 'despesa', color: '#FF9800' },
        { name: 'Aluguel', type: 'despesa', color: '#F44336' },
        { name: 'Impostos', type: 'despesa', color: '#9C27B0' },
        { name: 'Água/Luz/Internet', type: 'despesa', color: '#795548' },
        { name: 'Transporte', type: 'despesa', color: '#607D8B' },
        { name: 'Alimentação', type: 'despesa', color: '#FFC107' },
        { name: 'Pró-labore', type: 'ambos', color: '#9E9E9E' },
      ];
      
      // Criar as categorias padrão
      const categoriesToInsert = defaultCategories.map(cat => ({
        ...cat,
        user_id: userId,
      }));
      
      const { error: insertError } = await supabase
        .from('categories')
        .insert(categoriesToInsert);
        
      if (insertError) {
        console.error('Erro ao criar categorias padrão:', insertError);
      }
    } catch (error) {
      console.error('Erro ao garantir categorias padrão:', error);
    }
  }
} 