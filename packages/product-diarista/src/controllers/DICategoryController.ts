/**
 * Controlador de categorias usando injeção de dependências
 * Gerencia operações de categorias específicas para diaristas
 */

import { DIContainer } from '../lib/core/di';
import { CategoryService, Category } from '../lib/core/services';
import { CATEGORY_SERVICE, AUTH_SERVICE } from '../lib/di/bootstrap';
import { DiaristaCategoryService } from '../services/DiaristaCategoryService';
import { DiaristaAuthService } from '../services/DiaristaAuthService';
import { CategoriaDiarista, CategoryType } from '../models/DiaristaModels';

export class DICategoryController {
  private categoryService: DiaristaCategoryService;
  private authService: DiaristaAuthService;
  private currentUser: any = null;

  constructor() {
    const container = DIContainer.getInstance();
    
    // Obtém os serviços do container DI
    this.categoryService = container.get(CATEGORY_SERVICE) as DiaristaCategoryService;
    this.authService = container.get(AUTH_SERVICE) as DiaristaAuthService;
    
    if (!this.categoryService) {
      throw new Error('CategoryService não encontrado no container DI');
    }
    
    if (!this.authService) {
      throw new Error('AuthService não encontrado no container DI');
    }
  }

  /**
   * Verifica e obtém o usuário atual
   */
  private async ensureUserAuthenticated(): Promise<{ user: any | null; error: string | null }> {
    try {
      const result = await this.authService.getCurrentUser();
      if (result.user) {
        this.currentUser = result.user;
        return { user: result.user, error: null };
      }
      return { user: null, error: result.error || 'Usuário não autenticado' };
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return { user: null, error: 'Erro ao verificar autenticação' };
    }
  }

  /**
   * Busca todas as categorias do usuário atual
   */
  async getAllCategories(): Promise<{ data: CategoriaDiarista[] | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      const result = await this.categoryService.getAll();
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      // Filtra categorias do usuário atual
      const userCategories = result.data?.filter(
        category => category.user_id === this.currentUser.id
      ) || [];

      return { data: userCategories, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Busca categoria por ID
   */
  async getCategoryById(id: string): Promise<{ data: CategoriaDiarista | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      const result = await this.categoryService.getById(id);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      // Verifica se a categoria pertence ao usuário atual
      if (result.data && result.data.user_id !== this.currentUser.id) {
        return { data: null, error: 'Categoria não encontrada' };
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Cria nova categoria
   */
  async createCategory(categoryData: Omit<CategoriaDiarista, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: CategoriaDiarista | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      // Adiciona o ID do usuário aos dados da categoria
      const categoryWithUser = {
        ...categoryData,
        user_id: this.currentUser.id
      };

      const result = await this.categoryService.create(categoryWithUser);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Atualiza categoria existente
   */
  async updateCategory(id: string, categoryData: Partial<CategoriaDiarista>): Promise<{ data: CategoriaDiarista | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      // Primeiro verifica se a categoria existe e pertence ao usuário
      const existingCategory = await this.getCategoryById(id);
      if (existingCategory.error || !existingCategory.data) {
        return { data: null, error: existingCategory.error || 'Categoria não encontrada' };
      }

      const result = await this.categoryService.update(id, categoryData);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Remove categoria
   */
  async deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { success: false, error: authResult.error || 'Usuário não autenticado' };
      }

      // Primeiro verifica se a categoria existe e pertence ao usuário
      const existingCategory = await this.getCategoryById(id);
      if (existingCategory.error || !existingCategory.data) {
        return { success: false, error: existingCategory.error || 'Categoria não encontrada' };
      }

      const result = await this.categoryService.delete(id);
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Busca categorias de serviços
   */
  async getServiceCategories(): Promise<{ data: CategoriaDiarista[] | null; error: string | null }> {
    return this.getCategoriesByType('income');
  }

  /**
   * Busca categorias de despesas
   */
  async getExpenseCategories(): Promise<{ data: CategoriaDiarista[] | null; error: string | null }> {
    return this.getCategoriesByType('expense');
  }

  /**
   * Busca categorias por tipo
   */
  async getCategoriesByType(type: CategoryType): Promise<{ data: CategoriaDiarista[] | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      const result = await this.categoryService.getCategoriesByType(type);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      // Filtra categorias do usuário atual
      const userCategories = result.data?.filter(
        category => category.user_id === this.currentUser.id
      ) || [];

      return { data: userCategories, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias por tipo:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Cria categorias padrão para o usuário atual
   */
  async createDefaultCategories(): Promise<{ success: boolean; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { success: false, error: authResult.error || 'Usuário não autenticado' };
      }

      const result = await this.categoryService.createDefaultCategories(this.currentUser.id);
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Busca categorias mais utilizadas
   */
  async getMostUsedCategories(limit: number = 5): Promise<{ data: CategoriaDiarista[] | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      const result = await this.categoryService.getMostUsedCategories(limit);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      // Filtra categorias do usuário atual
      const userCategories = result.data?.filter(
        category => category.user_id === this.currentUser.id
      ) || [];

      return { data: userCategories, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias mais utilizadas:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Busca estatísticas das categorias
   */
  async getCategoryStats(): Promise<{
    data: {
      totalCategorias: number;
      categoriasReceita: number;
      categoriasDespesa: number;
      categoriasMaisUsadas: CategoriaDiarista[];
    } | null;
    error: string | null;
  }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      const [allResult, receitaResult, despesaResult, mostUsedResult] = await Promise.all([
        this.getAllCategories(),
        this.getCategoriesByType('income'),
        this.getCategoriesByType('expense'),
        this.getMostUsedCategories(3)
      ]);

      if (allResult.error) {
        return { data: null, error: allResult.error };
      }

      if (receitaResult.error) {
        return { data: null, error: receitaResult.error };
      }

      if (despesaResult.error) {
        return { data: null, error: despesaResult.error };
      }

      if (mostUsedResult.error) {
        return { data: null, error: mostUsedResult.error };
      }

      const stats = {
        totalCategorias: allResult.data?.length || 0,
        categoriasReceita: receitaResult.data?.length || 0,
        categoriasDespesa: despesaResult.data?.length || 0,
        categoriasMaisUsadas: mostUsedResult.data || []
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erro ao buscar estatísticas das categorias:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }
}