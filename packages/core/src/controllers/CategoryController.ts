import { Category, CreateCategoryData } from '@/models/Category';
import { toast } from '@/hooks/use-toast';
import { CategoryService } from '@/lib/services/category';

export class CategoryController {
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
