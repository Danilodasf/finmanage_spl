/**
 * Implementação do serviço de categorias para diaristas
 * Implementa a interface CategoryService do core com funcionalidades específicas
 */

import { CategoryService, Category, CreateCategoryDTO, UpdateCategoryDTO } from '../lib/core/services';
import { databaseAdapter } from '../lib/database/DatabaseAdapter';
import { CategoriaDiarista, CategoryType } from '../models/DiaristaModels';

export class DiaristaCategoryService implements CategoryService {
  private readonly tableName = 'categories';

  /**
   * Mapeia CategoriaDiarista para Category (interface do core)
   */
  private mapToCategory(categoria: CategoriaDiarista): Category {
    return {
      id: categoria.id,
      user_id: categoria.user_id,
      name: categoria.name,
      type: this.mapCategoryTypeFromDatabase(categoria.type),
      created_at: categoria.created_at,
      updated_at: categoria.updated_at
    };
  }

  /**
   * Mapeia Category para CategoriaDiarista
   */
  private mapToCategoriaDiarista(category: Category): CategoriaDiarista {
    return category as CategoriaDiarista;
  }

  async getAll(): Promise<{ data: Category[] | null; error: Error | null }> {
    try {
      const result = await databaseAdapter.getAll<CategoriaDiarista>(this.tableName);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const categories = result.data?.map(categoria => this.mapToCategory(categoria)) || [];
      return { data: categories, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return { data: null, error: error as Error };
    }
  }

  async getById(id: string): Promise<{ data: Category | null; error: Error | null }> {
    try {
      const result = await databaseAdapter.getById<CategoriaDiarista>(this.tableName, id);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const category = result.data ? this.mapToCategory(result.data) : null;
      return { data: category, error: null };
    } catch (error) {
      console.error(`Erro ao buscar categoria ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Mapeia tipos de categoria do enum inglês para português (banco de dados)
   */
  private mapCategoryTypeToDatabase(type: CategoryType): string {
    const typeMapping: Record<string, string> = {
      'income': 'receita',
      'expense': 'despesa',
      'both': 'ambos',
      'investment': 'investimento'
    };
    return typeMapping[type] || type;
  }

  /**
   * Mapeia tipos de categoria do português (banco de dados) para enum inglês
   */
  private mapCategoryTypeFromDatabase(type: string): CategoryType {
    const typeMapping: Record<string, CategoryType> = {
      'receita': 'income' as CategoryType,
      'despesa': 'expense' as CategoryType,
      'ambos': 'both' as CategoryType,
      'investimento': 'investment' as CategoryType
    };
    return typeMapping[type] || type as CategoryType;
  }

  async create(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      // Validações específicas para diaristas
      if (!categoryData.name || categoryData.name.trim().length === 0) {
        return { data: null, error: new Error('Nome da categoria é obrigatório') };
      }
      
      if (categoryData.name.length > 50) {
        return { data: null, error: new Error('Nome da categoria deve ter no máximo 50 caracteres') };
      }
      
      // Verifica se já existe uma categoria com o mesmo nome
      const existingResult = await databaseAdapter.findWhere<CategoriaDiarista>(this.tableName, {
        name: categoryData.name,
        user_id: categoryData.user_id
      });
      
      if (existingResult.data && existingResult.data.length > 0) {
        return { data: null, error: new Error('Já existe uma categoria com este nome') };
      }
      
      // Mapear o tipo para o formato do banco de dados
      const mappedCategoryData = {
        ...categoryData,
        type: this.mapCategoryTypeToDatabase(categoryData.type)
      };
      
      const result = await databaseAdapter.create<CategoriaDiarista>(this.tableName, mappedCategoryData);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const category = result.data ? this.mapToCategory(result.data) : null;
      return { data: category, error: null };
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return { data: null, error: error as Error };
    }
  }

  async update(id: string, categoryData: Partial<Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      // Validações específicas para diaristas
      if (categoryData.name !== undefined) {
        if (!categoryData.name || categoryData.name.trim().length === 0) {
          return { data: null, error: new Error('Nome da categoria é obrigatório') };
        }
        
        if (categoryData.name.length > 50) {
          return { data: null, error: new Error('Nome da categoria deve ter no máximo 50 caracteres') };
        }
      }
      
      // Mapear o tipo para o formato do banco de dados se fornecido
      const mappedCategoryData = {
        ...categoryData,
        ...(categoryData.type && { type: this.mapCategoryTypeToDatabase(categoryData.type) })
      };
      
      const result = await databaseAdapter.update<CategoriaDiarista>(this.tableName, id, mappedCategoryData);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const category = result.data ? this.mapToCategory(result.data) : null;
      return { data: category, error: null };
    } catch (error) {
      console.error(`Erro ao atualizar categoria ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }

  async delete(id: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      // Verifica se existem transações usando esta categoria
      const transactionsResult = await databaseAdapter.findWhere("transactions", {
        category_id: id
      });
      
      if (transactionsResult.data && transactionsResult.data.length > 0) {
        return { 
          data: false, 
          error: new Error('Não é possível excluir categoria que possui transações associadas') 
        };
      }
      
      const result = await databaseAdapter.delete(this.tableName, id);
      return { data: result.data || false, error: result.error };
    } catch (error) {
      console.error(`Erro ao deletar categoria ${id}:`, error);
      return { data: false, error: error as Error };
    }
  }

  // Métodos específicos para diaristas
  
  /**
   * Busca categorias por tipo (receita/despesa/ambos/investimento)
   */
  async getCategoriesByType(type: CategoryType): Promise<{ data: Category[] | null; error: Error | null }> {
    try {
      // Mapear o tipo para o formato do banco de dados
      const dbType = this.mapCategoryTypeToDatabase(type);
      
      const result = await databaseAdapter.findWhere<CategoriaDiarista>(this.tableName, {
        type: dbType
      });
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const categories = result.data?.map(cat => this.mapToCategory(cat)) || [];
      return { data: categories, error: null };
    } catch (error) {
      console.error(`Erro ao buscar categorias do tipo ${type}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Busca categorias de receita (mantido para compatibilidade)
   */
  async getCategoriasPorTipoServico(): Promise<{ data: CategoriaDiarista[] | null; error: Error | null }> {
    try {
      const result = await databaseAdapter.findWhere<CategoriaDiarista>(this.tableName, {
        type: 'receita'
      });
      
      return { data: result.data, error: result.error };
    } catch (error) {
      console.error('Erro ao buscar categorias de receita:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Busca categorias de receita (serviços)
   */
  async getIncomeCategories(): Promise<{ data: Category[] | null; error: Error | null }> {
    return this.getCategoriesByType('income' as CategoryType);
  }

  /**
   * Busca categorias de despesa
   */
  async getExpenseCategories(): Promise<{ data: Category[] | null; error: Error | null }> {
    return this.getCategoriesByType('expense' as CategoryType);
  }

  /**
   * Cria categorias padrão do MEI usando função do banco de dados
   */
  async createDefaultCategories(userId: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      // Verifica se já existem categorias para este usuário
      const existingResult = await databaseAdapter.findWhere<CategoriaDiarista>(this.tableName, {
        user_id: userId
      });
      
      if (existingResult.data && existingResult.data.length > 0) {
        return { data: true, error: null }; // Já existem categorias
      }

      // Usar função do banco de dados para criar categorias padrão
      // Isso contorna as políticas RLS durante o registro
      const result = await this.createDefaultCategoriesViaFunction(userId);
      
      if (result.error) {
        console.error('Erro ao criar categorias via função:', result.error);
        return { data: false, error: result.error };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
      return { data: false, error: error as Error };
    }
  }

  /**
   * Chama a função do banco de dados para criar categorias padrão
   */
  private async createDefaultCategoriesViaFunction(userId: string): Promise<{ data: any; error: Error | null }> {
    try {
      // Importar o cliente Supabase diretamente
      const { getSupabaseClient } = await import('../lib/supabase');
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.rpc('create_default_categories_for_user', {
        target_user_id: userId
      });

      if (error) {
        console.error('Erro ao chamar função create_default_categories_for_user:', error);
        return { data: null, error: new Error(error.message) };
      }

      console.log('Categorias padrão criadas via função do banco:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao executar função do banco:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Busca categorias mais utilizadas
   */
  async getMostUsedCategories(limit: number = 5): Promise<{ data: CategoriaDiarista[] | null; error: Error | null }> {
    try {
      // Busca todas as transações para contar uso das categorias
      const transactionsResult = await databaseAdapter.getAll("transactions");
      
      if (transactionsResult.error) {
        return { data: null, error: transactionsResult.error };
      }
      
      const transactions = transactionsResult.data || [];
      
      // Conta o uso de cada categoria
      const categoryUsage = new Map<string, number>();
      transactions.forEach(transaction => {
        if (transaction.category_id) {
          const count = categoryUsage.get(transaction.category_id) || 0;
          categoryUsage.set(transaction.category_id, count + 1);
        }
      });
      
      // Ordena por uso e pega as mais utilizadas
      const sortedCategories = Array.from(categoryUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([categoryId]) => categoryId);
      
      // Busca os dados completos das categorias
      const categories: CategoriaDiarista[] = [];
      for (const categoryId of sortedCategories) {
        const result = await this.getById(categoryId);
        if (result.data) {
          categories.push(this.mapToCategoriaDiarista(result.data));
        }
      }
      
      return { data: categories, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias mais utilizadas:', error);
      return { data: null, error: error as Error };
    }
  }
}