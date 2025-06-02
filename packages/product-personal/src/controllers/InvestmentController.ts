import { Investment, InvestmentReturn, createInvestment, createInvestmentReturn, updateInvestment } from '@/models/Investment';
import { toast } from '@/hooks/use-toast';

const INVESTMENTS_STORAGE_KEY = 'finmanage_investments';
const RETURNS_STORAGE_KEY = 'finmanage_investment_returns';

export class InvestmentController {
  static getInvestments(): Investment[] {
    try {
      const savedData = localStorage.getItem(INVESTMENTS_STORAGE_KEY);
      if (!savedData) return [];
      
      const investments: Investment[] = JSON.parse(savedData);
      
      // Converter strings de data para objetos Date
      return investments.map(investment => ({
        ...investment,
        createdAt: new Date(investment.createdAt),
        updatedAt: new Date(investment.updatedAt)
      }));
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

  static getInvestmentReturns(investmentId?: string): InvestmentReturn[] {
    try {
      const savedData = localStorage.getItem(RETURNS_STORAGE_KEY);
      if (!savedData) return [];
      
      let returns: InvestmentReturn[] = JSON.parse(savedData);
      
      // Garantir que o array está definido
      if (!Array.isArray(returns)) {
        console.warn('Dados de rendimentos inválidos, retornando array vazio');
        return [];
      }
      
      // Filtrar por investimentoId se fornecido
      if (investmentId) {
        returns = returns.filter(ret => ret.investmentId === investmentId);
      }
      
      // Converter strings de data para objetos Date
      return returns.map(ret => ({
        ...ret,
        createdAt: new Date(ret.createdAt)
      }));
    } catch (error) {
      console.error('Erro ao buscar rendimentos:', error);
      return [];
    }
  }

  static getInvestmentById(id: string): Investment | null {
    const investments = this.getInvestments();
    return investments.find(investment => investment.id === id) || null;
  }

  static createInvestment(data: Omit<Investment, 'id' | 'totalReturns' | 'createdAt' | 'updatedAt'>): boolean {
    try {
      // Criar o investimento
      const investments = this.getInvestments();
      const newInvestment = createInvestment(data);
      
      localStorage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify([...investments, newInvestment]));
      
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

  static updateInvestment(id: string, data: Partial<Omit<Investment, 'id' | 'totalReturns' | 'createdAt' | 'updatedAt'>>): boolean {
    try {
      const investments = this.getInvestments();
      const investmentIndex = investments.findIndex(investment => investment.id === id);
      
      if (investmentIndex === -1) {
        toast({
          title: "Erro",
          description: "Investimento não encontrado.",
          variant: "destructive"
        });
        return false;
      }
      
      const updatedInvestment = updateInvestment(investments[investmentIndex], data);
      
      investments[investmentIndex] = updatedInvestment;
      
      localStorage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(investments));
      
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

  static deleteInvestment(id: string): boolean {
    try {
      const investments = this.getInvestments();
      const filteredInvestments = investments.filter(investment => investment.id !== id);
      
      if (filteredInvestments.length === investments.length) {
        toast({
          title: "Erro",
          description: "Investimento não encontrado.",
          variant: "destructive"
        });
        return false;
      }
      
      // Excluir também todos os rendimentos associados
      const returns = this.getInvestmentReturns();
      const filteredReturns = returns.filter(ret => ret.investmentId !== id);
      
      localStorage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(filteredInvestments));
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(filteredReturns));
      
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

  static addInvestmentReturn(data: Omit<InvestmentReturn, 'id' | 'createdAt'>): boolean {
    try {
      // Adicionar o rendimento
      const returns = this.getInvestmentReturns() || [];
      const newReturn = createInvestmentReturn(data);
      
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify([...returns, newReturn]));
      
      // Atualizar o total de rendimentos do investimento
      const investments = this.getInvestments();
      const investmentIndex = investments.findIndex(inv => inv.id === data.investmentId);
      
      if (investmentIndex !== -1) {
        investments[investmentIndex].totalReturns += data.amount;
        localStorage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(investments));
      } else {
        console.error('Investimento não encontrado:', data.investmentId);
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

  static deleteInvestmentReturn(id: string): boolean {
    try {
      const returns = this.getInvestmentReturns();
      const returnToDelete = returns.find(ret => ret.id === id);
      
      if (!returnToDelete) {
        toast({
          title: "Erro",
          description: "Rendimento não encontrado.",
          variant: "destructive"
        });
        return false;
      }
      
      // Remover o rendimento
      const filteredReturns = returns.filter(ret => ret.id !== id);
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(filteredReturns));
      
      // Atualizar o total de rendimentos do investimento
      const investments = this.getInvestments();
      const investment = investments.find(inv => inv.id === returnToDelete.investmentId);
      
      if (investment) {
        investment.totalReturns -= returnToDelete.amount;
        localStorage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(investments));
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