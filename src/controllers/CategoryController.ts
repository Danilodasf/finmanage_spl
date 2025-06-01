import { Category, CreateCategoryData } from '@/models/Category';
import { toast } from '@/hooks/use-toast';

export class CategoryController {
  private static storageKey = 'finmanage_categories';

  static getCategories(): Category[] {
    const stored = localStorage.getItem(this.storageKey);
    const categories = stored ? JSON.parse(stored) : [];
    
    // Se não há categorias, criar algumas padrão
    if (categories.length === 0) {
      const defaultCategories: Category[] = [
        { id: '1', name: 'Faculdade', type: 'despesa' },
        { id: '2', name: 'Salário', type: 'receita' },
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(defaultCategories));
      return defaultCategories;
    }
    
    return categories;
  }

  static createCategory(data: CreateCategoryData): boolean {
    try {
      const categories = this.getCategories();
      const newCategory: Category = {
        id: Date.now().toString(),
        ...data
      };

      categories.push(newCategory);
      localStorage.setItem(this.storageKey, JSON.stringify(categories));
      
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria.",
        variant: "destructive",
      });
      return false;
    }
  }

  static updateCategory(id: string, data: CreateCategoryData): boolean {
    try {
      const categories = this.getCategories();
      const index = categories.findIndex(c => c.id === id);
      
      if (index !== -1) {
        categories[index] = { ...categories[index], ...data };
        localStorage.setItem(this.storageKey, JSON.stringify(categories));
        
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!",
        });
        
        return true;
      }
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

  static deleteCategory(id: string): boolean {
    try {
      const categories = this.getCategories();
      const filtered = categories.filter(c => c.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
      
      return true;
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
