import { Category, CreateCategoryData } from '@/models/Category';
import { toast } from '@/hooks/use-toast';

export class CategoryController {
  static async createCategory(data: CreateCategoryData): Promise<boolean> {
    try {
      // Simulação de criação - aqui seria integrado com a API real
      console.log('Criando categoria MEI:', data);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Categoria criada",
        description: "A categoria foi registrada com sucesso.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro ao criar categoria",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  static async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<boolean> {
    try {
      // Simulação de atualização - aqui seria integrado com a API real
      console.log(`Atualizando categoria MEI ${id}:`, data);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro ao atualizar categoria",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  static async deleteCategory(id: string): Promise<boolean> {
    try {
      // Simulação de exclusão - aqui seria integrado com a API real
      console.log(`Excluindo categoria MEI ${id}`);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro ao excluir categoria",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  static getDefaultCategories(): Category[] {
    // Categorias padrão para MEI
    return [
      { id: '1', name: 'Vendas', type: 'receita' },
      { id: '2', name: 'Serviços', type: 'receita' },
      { id: '3', name: 'Materiais', type: 'despesa' },
      { id: '4', name: 'Aluguel', type: 'despesa' },
      { id: '5', name: 'Impostos', type: 'despesa' },
      { id: '6', name: 'Água/Luz/Internet', type: 'despesa' },
      { id: '7', name: 'Transporte', type: 'despesa' },
      { id: '8', name: 'Alimentação', type: 'despesa' },
      { id: '9', name: 'Pró-labore', type: 'ambos' },
    ];
  }
} 