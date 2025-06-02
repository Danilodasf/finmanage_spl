import { toast } from '@/hooks/use-toast';
import { CategoryService, Category } from '@/lib/services/CategoryService';

export class CategoryController {
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await CategoryService.getAll();
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao buscar categorias.",
          variant: "destructive",
        });
        return [];
      }
      
      // Se não há categorias, criar algumas padrão
      if (!data || data.length === 0) {
        await this.createDefaultCategories();
        const { data: defaultCategories } = await CategoryService.getAll();
        return defaultCategories || [];
      }
      
      return data;
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

  private static async createDefaultCategories(): Promise<void> {
    try {
      // Obter o ID do usuário através do serviço
      const { data: currentUser } = await CategoryService.getCurrentUser();
      
      if (!currentUser || !currentUser.id) return;
      
      const defaultCategories: Omit<Category, 'id' | 'created_at' | 'updated_at'>[] = [
        { name: 'Faculdade', type: 'despesa', user_id: currentUser.id },
        { name: 'Salário', type: 'receita', user_id: currentUser.id },
        { name: 'Alimentação', type: 'despesa', user_id: currentUser.id },
        { name: 'Transporte', type: 'despesa', user_id: currentUser.id },
        { name: 'Lazer', type: 'despesa', user_id: currentUser.id },
      ];
      
      for (const category of defaultCategories) {
        await CategoryService.create(category);
      }
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
    }
  }

  static async createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { data: newCategory, error } = await CategoryService.create(data);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao criar categoria.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria.",
        variant: "destructive",
      });
      return false;
    }
  }

  static async updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    try {
      const { data: updatedCategory, error } = await CategoryService.update(id, data);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar categoria.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria.",
        variant: "destructive",
      });
      return false;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const { success, error } = await CategoryService.delete(id);
      
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