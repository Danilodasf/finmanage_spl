/**
 * Controlador de categorias usando injeção de dependências
 * Gerencia operações de categorias específicas para diaristas
 */

import { DIContainer } from '../lib/core/di';
import { CategoryService, Category } from '../lib/core/services';
import { CATEGORY_SERVICE, AUTH_SERVICE } from '../lib/di/bootstrap';
import { DiaristaCategoryService } from '../services/DiaristaCategoryService';
import { DiaristaAuthService } from '../services/DiaristaAuthService';
import { CategoriaDiarista, CreateCategoriaDiaristaDTO, UpdateCategoriaDiaristaDTO, TipoServicoDiarista } from '../models/DiaristaModels';

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

    this.initializeUser();
  }

  /**
   * Inicializa o usuário atual
   */
  private async initializeUser(): Promise<void> {
    try {
      const result = await this.authService.getCurrentUser();
      if (result.user) {
        this.currentUser = result.user;
      }
    } catch (error) {
      console.error('Erro ao inicializar usuário:', error);
    }
  }

  /**
   * Busca todas as categorias do usuário atual
   */
  async getAllCategories(): Promise<{ data: Category[] | null; error: string | null }> {
    try {
      if (!this.currentUser) {
        return { data: null, error: 'Usuário não autenticado' };
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
   * Busca uma categoria específica por ID
   */
  async getCategoryById(id: string): Promise<{ data: Category | null; error: string | null }> {
    try {
      if (!this.currentUser) {
        return { data: null, error: 'Usuário não autenticado' };
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
   * Cria uma nova categoria
   */
  async createCategory(categoryData: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Category | null; error: string | null }> {
    try {
      if (!this.currentUser) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Adiciona o user_id à categoria
      const completeCategoryData = {
        ...categoryData,
        user_id: this.currentUser.id
      };

      const result = await this.categoryService.create(completeCategoryData);
      
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
   * Atualiza uma categoria existente
   */
  async updateCategory(id: string, categoryData: Partial<Category>): Promise<{ data: Category | null; error: string | null }> {
    try {
      if (!this.currentUser) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Verifica se a categoria pertence ao usuário
      const existingResult = await this.getCategoryById(id);
      if (existingResult.error || !existingResult.data) {
        return { data: null, error: existingResult.error || 'Categoria não encontrada' };
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
   * Exclui uma categoria
   */
  async deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verifica se a categoria pertence ao usuário
      const existingResult = await this.getCategoryById(id);
      if (existingResult.error || !existingResult.data) {
        return { success: false, error: existingResult.error || 'Categoria não encontrada' };
      }

      const result = await this.categoryService.delete(id);
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: result.data, error: null };
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Métodos específicos para diaristas

  /**
   * Busca categorias por tipo (receita/despesa)
   */
  async getCategoriesByType(type: 'receita' | 'despesa'): Promise<{ data: CategoriaDiarista[] | null; error: string | null }> {
    try {
      if (!this.currentUser) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      const result = await this.categoryService.getByType(type);
      
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
   * Busca categorias de receita (serviços)
   */
  async getServiceCategories(): Promise<{ data: CategoriaDiarista[] | null; error: string | null }> {
    return this.getCategoriesByType('receita');
  }

  /**
   * Busca categorias de despesa
   */
  async getExpenseCategories(): Promise<{ data: CategoriaDiarista[] | null; error: string | null }> {
    return this.getCategoriesByType('despesa');
  }

  /**
   * Busca categorias por tipo de serviço específico
   */
  async getCategoriesByServiceType(tipoServico: TipoServicoDiarista): Promise<{ data: CategoriaDiarista[] | null; error: string | null }> {
    try {
      if (!this.currentUser) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      const result = await this.categoryService.getCategoriasPorTipoServico(tipoServico);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      // Filtra categorias do usuário atual
      const userCategories = result.data?.filter(
        category => category.user_id === this.currentUser.id
      ) || [];

      return { data: userCategories, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias por tipo de serviço:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Cria categorias padrão para o usuário atual
   */
  async createDefaultCategories(): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const result = await this.categoryService.createDefaultCategories(this.currentUser.id);
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: result.data, error: null };
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
      if (!this.currentUser) {
        return { data: null, error: 'Usuário não autenticado' };
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
      if (!this.currentUser) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      const [allResult, receitaResult, despesaResult, mostUsedResult] = await Promise.all([
        this.getAllCategories(),
        this.getCategoriesByType('receita'),
        this.getCategoriesByType('despesa'),
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

      return {
        data: {
          totalCategorias: allResult.data?.length || 0,
          categoriasReceita: receitaResult.data?.length || 0,
          categoriasDespesa: despesaResult.data?.length || 0,
          categoriasMaisUsadas: mostUsedResult.data || []
        },
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas das categorias:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Verifica se o usuário tem categorias configuradas
   */
  async hasCategories(): Promise<{ hasCategories: boolean; error: string | null }> {
    try {
      const result = await this.getAllCategories();
      
      if (result.error) {
        return { hasCategories: false, error: result.error };
      }

      return { hasCategories: (result.data?.length || 0) > 0, error: null };
    } catch (error) {
      console.error('Erro ao verificar categorias:', error);
      return { hasCategories: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Busca categorias para seleção em formulários
   */
  async getCategoriesForSelect(type?: 'receita' | 'despesa'): Promise<{
    data: Array<{ value: string; label: string; color?: string; icon?: string }> | null;
    error: string | null;
  }> {
    try {
      const result = type 
        ? await this.getCategoriesByType(type)
        : await this.getAllCategories();
      
      if (result.error) {
        return { data: null, error: result.error };
      }

      const selectOptions = result.data?.map(category => ({
        value: category.id,
        label: category.name,
        color: category.color,
        icon: category.icon
      })) || [];

      return { data: selectOptions, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias para seleção:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }
}