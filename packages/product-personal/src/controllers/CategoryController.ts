import { supabase } from '../lib/supabase';
import { Category } from '../lib/services/CategoryService';

export class CategoryController {
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  static async getCategoryById(id: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar categoria com ID ${id}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar categoria com ID ${id}:`, error);
      throw error;
    }
  }

  static async getCategoriesByType(type: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .order('name');
      
      if (error) {
        console.error(`Erro ao buscar categorias do tipo ${type}:`, error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar categorias do tipo ${type}:`, error);
      throw error;
    }
  }

  static async createCategory(category: Omit<Category, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar categoria:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return false;
    }
  }

  static async updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'user_id'>>) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
      return false;
    }
  }

  static async deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Erro ao excluir categoria com ID ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir categoria com ID ${id}:`, error);
      return false;
    }
  }
} 