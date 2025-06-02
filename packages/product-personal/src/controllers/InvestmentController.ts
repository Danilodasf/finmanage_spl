import { toast } from '@/hooks/use-toast';
import { InvestmentService, Investment, InvestmentReturn } from '@/lib/services/InvestmentService';

export class InvestmentController {
  static async getInvestments(): Promise<Investment[]> {
    try {
      const { data, error } = await InvestmentService.getAll();
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os investimentos.",
          variant: "destructive"
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os investimentos.",
        variant: "destructive"
      });
      return [];
    }
  }

  static async getInvestmentReturns(investmentId: string): Promise<InvestmentReturn[]> {
    try {
      const { data, error } = await InvestmentService.getInvestmentReturns(investmentId);
      
      if (error) {
        console.error('Erro ao buscar rendimentos:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar rendimentos:', error);
      return [];
    }
  }

  static async getInvestmentById(id: string): Promise<Investment | null> {
    try {
      const { data, error } = await InvestmentService.getById(id);
      
      if (error) {
        console.error(`Erro ao buscar investimento com ID ${id}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar investimento com ID ${id}:`, error);
      return null;
    }
  }

  static async createInvestment(data: Omit<Investment, 'id' | 'created_at' | 'updated_at' | 'total_returns'>): Promise<boolean> {
    try {
      // Adicionar o total_returns com valor inicial 0
      const investmentData = {
        ...data,
        total_returns: 0
      };
      
      const { error } = await InvestmentService.create(investmentData);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o investimento.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Investimento criado com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o investimento.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async updateInvestment(id: string, data: Partial<Omit<Investment, 'id' | 'created_at' | 'updated_at' | 'total_returns'>>): Promise<boolean> {
    try {
      const { error } = await InvestmentService.update(id, data);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o investimento.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Investimento atualizado com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o investimento.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async deleteInvestment(id: string): Promise<boolean> {
    try {
      const { success, error } = await InvestmentService.delete(id);
      
      if (error || !success) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o investimento.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Investimento excluído com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir investimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o investimento.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async addInvestmentReturn(data: Omit<InvestmentReturn, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await InvestmentService.addInvestmentReturn(data);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o rendimento.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Rendimento adicionado com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar rendimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o rendimento.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async deleteInvestmentReturn(id: string): Promise<boolean> {
    try {
      const { success, error } = await InvestmentService.deleteInvestmentReturn(id);
      
      if (error || !success) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o rendimento.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Rendimento excluído com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir rendimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o rendimento.",
        variant: "destructive"
      });
      return false;
    }
  }
} 