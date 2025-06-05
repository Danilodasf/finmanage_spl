import { DIContainer, CATEGORY_SERVICE, CategoryService, Category, toast } from '../lib/core-exports';
import { SupabaseMeiCategoryService } from '../lib/services/SupabaseMeiCategoryService';

/**
 * Controlador de categorias que usa injeção de dependências
 */
export class DICategoryController {
  /**
   * Obtém o serviço de categorias do container de DI
   * @returns Instância do serviço de categorias
   */
  private static getCategoryService(): CategoryService {
    return DIContainer.get<CategoryService>(CATEGORY_SERVICE);
  }

  /**
   * Garante que as categorias padrão existam para o usuário atual
   */
  static async ensureDefaultCategories(): Promise<void> {
    try {
      console.log('DICategoryController - Garantindo categorias padrão...');
      const categoryService = this.getCategoryService() as SupabaseMeiCategoryService;
      
      if (!categoryService) {
        console.error('DICategoryController - Serviço de categorias não encontrado');
        return;
      }
      
      if (!categoryService.ensureDefaultCategories) {
        console.error('DICategoryController - Método ensureDefaultCategories não encontrado');
        return;
      }
      
      await categoryService.ensureDefaultCategories();
      console.log('DICategoryController - Categorias padrão garantidas com sucesso');
    } catch (error) {
      console.error('DICategoryController - Erro ao garantir categorias padrão:', error);
    }
  }

  /**
   * Busca todas as categorias
   * @returns Lista de categorias
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const categoryService = this.getCategoryService();
      const { data, error } = await categoryService.getAll();
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao buscar categorias.",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar categorias.",
        variant: "destructive",
      });
      return [];
    }
  }

  /**
   * Busca categorias por tipo
   * @param type Tipo da categoria
   * @returns Lista de categorias do tipo especificado
   */
  static async getCategoriesByType(type: 'receita' | 'despesa' | 'ambos' | 'investimento'): Promise<Category[]> {
    try {
      const categoryService = this.getCategoryService();
      const { data, error } = await categoryService.getByType(type);
      
      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao buscar categorias do tipo ${type}.`,
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar categorias do tipo ${type}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao buscar categorias do tipo ${type}.`,
        variant: "destructive",
      });
      return [];
    }
  }

  /**
   * Cria uma nova categoria
   * @param data Dados da categoria
   * @returns true se a categoria foi criada com sucesso
   */
  static async createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    console.log('==== DICategoryController.createCategory CHAMADO ====');
    console.log('[DICategoryController] createCategory - Recebido:', data);
    try {
      console.log('[DICategoryController] Obtendo serviço de categorias...');
      const categoryService = this.getCategoryService();
      console.log('[DICategoryController] Serviço obtido, tipo:', categoryService.constructor.name);
      
      console.log('[DICategoryController] Chamando categoryService.create...');
      const { data: newCategory, error } = await categoryService.create(data);
      
      if (error) {
        console.error('[DICategoryController] createCategory - Erro do serviço:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao criar categoria.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('[DICategoryController] createCategory - Sucesso. Nova categoria:', newCategory);
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });
      
      return true;
    } catch (e) {
      const error = e as Error;
      console.error('[DICategoryController] createCategory - Erro inesperado:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar categoria.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Atualiza uma categoria existente
   * @param id ID da categoria
   * @param data Dados para atualização
   * @returns true se a categoria foi atualizada com sucesso
   */
  static async updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    console.log('[DICategoryController] updateCategory - ID:', id, 'Dados:', data);
    try {
      const categoryService = this.getCategoryService();
      const { data: updatedCategory, error } = await categoryService.update(id, data);
      
      if (error) {
        console.error('[DICategoryController] updateCategory - Erro do serviço:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao atualizar categoria.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('[DICategoryController] updateCategory - Sucesso. Categoria atualizada:', updatedCategory);
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });
      
      return true;
    } catch (e) {
      const error = e as Error;
      console.error('[DICategoryController] updateCategory - Erro inesperado:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar categoria.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Exclui uma categoria
   * @param id ID da categoria
   * @returns true se a categoria foi excluída com sucesso
   */
  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const categoryService = this.getCategoryService();
      const { success, error } = await categoryService.delete(id);
      
      if (error || !success) {
        toast({
          title: "Erro",
          description: "Erro ao excluir categoria.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria.",
        variant: "destructive",
      });
      return false;
    }
  }
} 