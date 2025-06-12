import { Category, CreateCategoryData } from '@/models/Category';
import { toast } from '@/hooks/use-toast';
import { CategoryService } from '@/lib/services/category';

/**
 * Controlador responsável por gerenciar operações relacionadas a categorias
 * 
 * Este controlador atua como uma camada intermediária entre a interface do usuário
 * e o serviço de categorias, fornecendo métodos para CRUD de categorias e
 * gerenciamento de notificações de feedback ao usuário.
 * 
 * Funcionalidades:
 * - Buscar todas as categorias com garantia de categorias padrão
 * - Criar novas categorias personalizadas
 * - Atualizar categorias existentes
 * - Excluir categorias (com validações de segurança)
 * - Exibir notificações de sucesso/erro para todas as operações
 */
export class CategoryController {
  /**
   * Busca todas as categorias disponíveis no sistema
   * 
   * Garante que sempre existam categorias padrão disponíveis para o usuário.
   * Se nenhuma categoria for encontrada, automaticamente cria as categorias
   * padrão do sistema antes de retornar a lista.
   * 
   * @returns Promise com array de categorias disponíveis
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const categories = await CategoryService.getAll();
      
      // Se não há categorias, garantir que existam as categorias padrão
      if (categories.length === 0) {
        await CategoryService.ensureDefaultCategories();
        return await CategoryService.getAll();
      }
      
      return categories;
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
   * Cria uma nova categoria no sistema
   * 
   * Valida os dados fornecidos e cria uma nova categoria personalizada.
   * Exibe notificações de feedback ao usuário sobre o resultado da operação.
   * 
   * @param data - Dados da categoria a ser criada (nome, cor, ícone, etc.)
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   */
  static async createCategory(data: CreateCategoryData): Promise<boolean> {
    try {
      const newCategory = await CategoryService.create(data);
      
      if (newCategory) {
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso!",
        });
        return true;
      }
      
      toast({
        title: "Erro",
        description: "Erro ao criar categoria.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Atualiza uma categoria existente no sistema
   * 
   * Modifica os dados de uma categoria já existente com as novas informações
   * fornecidas. Valida a existência da categoria antes da atualização.
   * 
   * @param id - ID único da categoria a ser atualizada
   * @param data - Novos dados da categoria (nome, cor, ícone, etc.)
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   */
  static async updateCategory(id: string, data: CreateCategoryData): Promise<boolean> {
    try {
      const updatedCategory = await CategoryService.update(id, data);
      
      if (updatedCategory) {
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!",
        });
        return true;
      }
      
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Remove uma categoria do sistema
   * 
   * Exclui permanentemente uma categoria do banco de dados.
   * ATENÇÃO: Esta operação pode afetar transações que utilizam esta categoria.
   * Recomenda-se verificar dependências antes da exclusão.
   * 
   * @param id - ID único da categoria a ser removida
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   */
  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const success = await CategoryService.delete(id);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Categoria excluída com sucesso!",
        });
        return true;
      }
      
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria.",
        variant: "destructive",
      });
      return false;
    }
  }
}
