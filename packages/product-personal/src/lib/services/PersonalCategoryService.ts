import { CategoryService as ICategoryService, Category } from '@finmanage/core/services';
import { supabase } from '../supabase';
import { Tables } from '../supabase';

/**
 * Implementação do serviço de categorias para o produto Personal
 */
export class PersonalCategoryService implements ICategoryService {
  // Mapeamento de tipo para compatibilidade com a interface do core
  private mapCategory(category: Tables['categories']): Category {
    return category as unknown as Category;
  }

  async getAll(): Promise<{ data: Category[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return { data: null, error };
      }
      
      return { 
        data: data ? data.map(this.mapCategory) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao buscar categorias:', error);
      return { data: null, error: error as Error };
    }
  }
  
  async getById(id: string): Promise<{ data: Category | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar categoria com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapCategory(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar categoria com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar categoria:', error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapCategory(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao criar categoria:', error);
      return { data: null, error: error as Error };
    }
  }
  
  async update(id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...category, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapCategory(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar categoria com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Erro ao excluir categoria com ID ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao excluir categoria com ID ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  async getByType(type: 'receita' | 'despesa' | 'ambos' | 'investimento'): Promise<{ data: Category[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .order('name');
      
      if (error) {
        console.error(`Erro ao buscar categorias do tipo ${type}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? data.map(this.mapCategory) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar categorias do tipo ${type}:`, error);
      return { data: null, error: error as Error };
    }
  }
} 