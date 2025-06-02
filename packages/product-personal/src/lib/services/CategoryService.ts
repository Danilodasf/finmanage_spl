import { supabase } from '../supabase';

export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa' | 'ambos' | 'investimento';
  user_id: string;
  created_at?: Date;
}

export class CategoryService {
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return { data: null, error };
    }
  }

  static async getById(id: string) {
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
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao buscar categoria com ID ${id}:`, error);
      return { data: null, error };
    }
  }

  static async getByType(type: string) {
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
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao buscar categorias do tipo ${type}:`, error);
      return { data: null, error };
    }
  }

  static async create(category: Omit<Category, 'id' | 'created_at'>) {
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
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return { data: null, error };
    }
  }

  static async update(id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'user_id'>>) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
      return { data: null, error };
    }
  }

  static async delete(id: string) {
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
      console.error(`Erro ao excluir categoria com ID ${id}:`, error);
      return { success: false, error };
    }
  }
} 