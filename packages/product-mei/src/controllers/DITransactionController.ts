import { DIContainer, TRANSACTION_SERVICE, TransactionService, Transaction, CreateTransactionData, toast } from '../lib/core-exports';

/**
 * Controlador de transações que usa injeção de dependências
 */
export class DITransactionController {
  /**
   * Obtém o serviço de transações do container de DI
   * @returns Instância do serviço de transações
   */
  private static getTransactionService(): TransactionService {
    return DIContainer.get<TransactionService>(TRANSACTION_SERVICE);
  }

  /**
   * Busca todas as transações
   * @returns Lista de transações
   */
  static async getTransactions(): Promise<Transaction[]> {
    try {
      const transactionService = this.getTransactionService();
      const { data, error } = await transactionService.getAll();
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao buscar transações.",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar transações.",
        variant: "destructive",
      });
      return [];
    }
  }

  /**
   * Busca transações por tipo
   * @param type Tipo da transação
   * @returns Lista de transações do tipo especificado
   */
  static async getTransactionsByType(type: 'receita' | 'despesa'): Promise<Transaction[]> {
    try {
      const transactionService = this.getTransactionService();
      const { data, error } = await transactionService.getByType(type);
      
      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao buscar transações do tipo ${type}.`,
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar transações do tipo ${type}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao buscar transações do tipo ${type}.`,
        variant: "destructive",
      });
      return [];
    }
  }

  /**
   * Busca transações por intervalo de datas
   * @param startDate Data inicial
   * @param endDate Data final
   * @returns Lista de transações no intervalo especificado
   */
  static async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const transactionService = this.getTransactionService();
      const { data, error } = await transactionService.getByDateRange(startDate, endDate);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao buscar transações por período.",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações por período:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar transações por período.",
        variant: "destructive",
      });
      return [];
    }
  }

  /**
   * Busca transações por categoria
   * @param categoryId ID da categoria
   * @returns Lista de transações da categoria especificada
   */
  static async getTransactionsByCategory(categoryId: string): Promise<Transaction[]> {
    try {
      const transactionService = this.getTransactionService();
      const { data, error } = await transactionService.getByCategory(categoryId);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao buscar transações por categoria.",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações por categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar transações por categoria.",
        variant: "destructive",
      });
      return [];
    }
  }

  /**
   * Cria uma nova transação
   * @param data Dados da transação
   * @returns true se a transação foi criada com sucesso
   */
  static async createTransaction(data: CreateTransactionData): Promise<boolean> {
    try {
      const transactionService = this.getTransactionService();
      const { data: newTransaction, error } = await transactionService.create({
        type: data.type,
        date: data.date.toISOString().split('T')[0], // Converter para formato 'YYYY-MM-DD'
        value: data.value,
        description: data.description,
        categoryId: data.categoryId
      });
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao criar transação.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar transação.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Atualiza uma transação existente
   * @param id ID da transação
   * @param data Dados para atualização
   * @returns true se a transação foi atualizada com sucesso
   */
  static async updateTransaction(id: string, data: Partial<CreateTransactionData>): Promise<boolean> {
    try {
      const transactionService = this.getTransactionService();
      
      // Preparar dados para atualização
      const updateData: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>> = {
        type: data.type,
        description: data.description,
        value: data.value,
        categoryId: data.categoryId
      };
      
      // Converter data para string se estiver presente
      if (data.date) {
        updateData.date = data.date.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
      }
      
      const { data: updatedTransaction, error } = await transactionService.update(id, updateData);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar transação.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Exclui uma transação
   * @param id ID da transação
   * @returns true se a transação foi excluída com sucesso
   */
  static async deleteTransaction(id: string): Promise<boolean> {
    try {
      const transactionService = this.getTransactionService();
      const { success, error } = await transactionService.delete(id);
      
      if (error || !success) {
        toast({
          title: "Erro",
          description: "Erro ao excluir transação.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir transação.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Calcula um resumo financeiro para um período específico
   * @param period Período (mês ou ano)
   * @returns Resumo financeiro com receitas, despesas, saldo e transações
   */
  static async getFinancialSummary(period: 'month' | 'year' = 'month') {
    try {
      const transactionService = this.getTransactionService();
      return await transactionService.getFinancialSummary(period);
    } catch (error) {
      console.error('Erro ao calcular resumo financeiro:', error);
      toast({
        title: "Erro",
        description: "Erro ao calcular resumo financeiro.",
        variant: "destructive",
      });
      return {
        receitas: 0,
        despesas: 0,
        saldo: 0,
        transactions: []
      };
    }
  }
} 