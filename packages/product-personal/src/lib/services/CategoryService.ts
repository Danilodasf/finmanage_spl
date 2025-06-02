import { supabase } from '../supabase';
import { Tables } from '../supabase';
import { User } from '@supabase/supabase-js';

export type Category = Tables['categories'];

export class CategoryService {
  static async getAll(): Promise<{ data: Category[] | null; error: Error | null }> {
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
      console.error('Erro inesperado ao buscar categorias:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async getCurrentUser(): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Erro ao obter usuário atual:', error);
        return { data: null, error };
      }
      
      return { data: data.user, error: null };
    } catch (error) {
      console.error('Erro inesperado ao obter usuário atual:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async getById(id: string): Promise<{ data: Category | null; error: Error | null }> {
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
      console.error(`Erro inesperado ao buscar categoria com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  static async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Category | null; error: Error | null }> {
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
      console.error('Erro inesperado ao criar categoria:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async update(id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Category | null; error: Error | null }> {
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
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar categoria com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  static async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
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
  
  static async getByType(type: 'receita' | 'despesa' | 'ambos' | 'investimento'): Promise<{ data: Category[] | null; error: Error | null }> {
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
      console.error(`Erro inesperado ao buscar categorias do tipo ${type}:`, error);
      return { data: null, error: error as Error };
    }
  }
} 