/**
 * Implementação do serviço de categorias para diaristas
 * Implementa a interface CategoryService do core com funcionalidades específicas
 */

import { CategoryService, Category, CreateCategoryDTO, UpdateCategoryDTO } from '../lib/core/services';
import { databaseAdapter } from '../lib/database/DatabaseAdapter';
import { CategoriaDiarista, CreateCategoriaDiaristaDTO, UpdateCategoriaDiaristaDTO, TipoServicoDiarista } from '../models/DiaristaModels';

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
      description: categoria.description,
      color: categoria.color,
      icon: categoria.icon,
      type: categoria.type,
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
      
      const categories = result.data?.map(this.mapToCategory) || [];
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
      
      const result = await databaseAdapter.create<CategoriaDiarista>(this.tableName, categoryData);
      
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

  async update(id: string, categoryData: Partial<Category>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      // Validações para atualização
      if (categoryData.name !== undefined) {
        if (!categoryData.name || categoryData.name.trim().length === 0) {
          return { data: null, error: new Error('Nome da categoria é obrigatório') };
        }
        
        if (categoryData.name.length > 50) {
          return { data: null, error: new Error('Nome da categoria deve ter no máximo 50 caracteres') };
        }
        
        // Verifica se já existe outra categoria com o mesmo nome
        const existingResult = await databaseAdapter.findWhere<CategoriaDiarista>(this.tableName, {
          name: categoryData.name
        });
        
        if (existingResult.data && existingResult.data.some(cat => cat.id !== id)) {
          return { data: null, error: new Error('Já existe uma categoria com este nome') };
        }
      }
      
      const result = await databaseAdapter.update<CategoriaDiarista>(this.tableName, id, categoryData);
      
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
   * Busca categorias por tipo (receita/despesa)
   */
  async getByType(type: 'receita' | 'despesa'): Promise<{ data: CategoriaDiarista[] | null; error: Error | null }> {
    try {
      const result = await databaseAdapter.findWhere<CategoriaDiarista>(this.tableName, {
        type: type
      });
      
      return { data: result.data, error: result.error };
    } catch (error) {
      console.error(`Erro ao buscar categorias do tipo ${type}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Busca categorias de serviços específicos para diaristas
   */
  async getCategoriasPorTipoServico(tipoServico: TipoServicoDiarista): Promise<{ data: CategoriaDiarista[] | null; error: Error | null }> {
    try {
      const result = await databaseAdapter.findWhere<CategoriaDiarista>(this.tableName, {
        tipo_servico: tipoServico,
        type: 'receita'
      });
      
      return { data: result.data, error: result.error };
    } catch (error) {
      console.error(`Erro ao buscar categorias para ${tipoServico}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Cria categorias padrão para diaristas
   */
  async createDefaultCategories(userId: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      const defaultCategories: Omit<CategoriaDiarista, 'id' | 'created_at' | 'updated_at'>[] = [
        // Categorias de receita
        {
          user_id: userId,
          name: 'Limpeza Residencial',
          description: 'Serviços de limpeza em residências',
          color: '#4CAF50',
          icon: 'home',
          type: 'receita',
          tipo_servico: 'limpeza_residencial'
        },
        {
          user_id: userId,
          name: 'Limpeza Comercial',
          description: 'Serviços de limpeza em estabelecimentos comerciais',
          color: '#2196F3',
          icon: 'business',
          type: 'receita',
          tipo_servico: 'limpeza_comercial'
        },
        {
          user_id: userId,
          name: 'Limpeza Pós-Obra',
          description: 'Limpeza especializada após construção/reforma',
          color: '#FF9800',
          icon: 'construction',
          type: 'receita',
          tipo_servico: 'limpeza_pos_obra'
        },
        {
          user_id: userId,
          name: 'Organização',
          description: 'Serviços de organização de ambientes',
          color: '#9C27B0',
          icon: 'organize',
          type: 'receita',
          tipo_servico: 'organizacao'
        },
        {
          user_id: userId,
          name: 'Cuidados Especiais',
          description: 'Serviços especializados (idosos, crianças, etc.)',
          color: '#E91E63',
          icon: 'favorite',
          type: 'receita',
          tipo_servico: 'cuidados_especiais'
        },
        // Categorias de despesa
        {
          user_id: userId,
          name: 'Produtos de Limpeza',
          description: 'Compra de materiais e produtos de limpeza',
          color: '#607D8B',
          icon: 'cleaning_services',
          type: 'despesa'
        },
        {
          user_id: userId,
          name: 'Equipamentos',
          description: 'Compra e manutenção de equipamentos',
          color: '#795548',
          icon: 'build',
          type: 'despesa'
        },
        {
          user_id: userId,
          name: 'Transporte',
          description: 'Gastos com transporte para atendimentos',
          color: '#FF5722',
          icon: 'directions_car',
          type: 'despesa'
        },
        {
          user_id: userId,
          name: 'Uniformes',
          description: 'Compra de uniformes e EPIs',
          color: '#3F51B5',
          icon: 'person',
          type: 'despesa'
        },
        {
          user_id: userId,
          name: 'Marketing',
          description: 'Gastos com divulgação e marketing',
          color: '#009688',
          icon: 'campaign',
          type: 'despesa'
        }
      ];

      for (const categoryData of defaultCategories) {
        await this.create(categoryData);
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
      return { data: false, error: error as Error };
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