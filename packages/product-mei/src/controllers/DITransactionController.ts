// Importa o container de injeção de dependências (DI) do core
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
      console.log('[DITransactionController] getTransactions - Iniciando...');
      const transactionService = this.getTransactionService();
      console.log('[DITransactionController] getTransactions - Serviço obtido:', transactionService);
      
      const { data, error } = await transactionService.getAll();
      console.log('[DITransactionController] getTransactions - Resultado do serviço:');
      console.log('- Data:', data);
      console.log('- Error:', error);
      
      if (error) {
        console.error('[DITransactionController] getTransactions - Erro do serviço:', error);
        toast({
          title: "Erro",
          description: "Erro ao buscar transações.",
          variant: "destructive",
        });
        return [];
      }
      
      console.log(`[DITransactionController] getTransactions - Retornando ${data?.length || 0} transações`);
      return data || [];
    } catch (error) {
      console.error('[DITransactionController] getTransactions - Erro inesperado:', error);
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
      console.log('[updateTransaction] INICIADO', { id, data });
      const transactionService = this.getTransactionService();

      // Preparar dados para atualização
      const updateData: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>> = {
        type: data.type,
        description: data.description,
        value: data.value,
        categoryId: data.categoryId
      };
      console.log('[updateTransaction] Dados preparados para update:', updateData);

      // Converter data para string se estiver presente
      if (data.date) {
        updateData.date = data.date.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'
        console.log('[updateTransaction] Data convertida:', updateData.date);
      }

      const { data: updatedTransaction, error } = await transactionService.update(id, updateData);
      console.log('[updateTransaction] Resposta do service:', { updatedTransaction, error });

      if (error) {
        console.error('[updateTransaction] ERRO do service:', error);
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
      console.error('[updateTransaction] EXCEPTION:', error);
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

  /**
   * Cria uma transação de venda
   * @param value Valor da venda
   * @param date Data da venda
   * @param description Descrição da venda
   * @param categoryId ID da categoria (opcional, usa 'Vendas' como padrão)
   * @returns true se a transação foi criada com sucesso
   */
  static async createSaleTransaction(
    value: number, 
    date: Date, 
    description: string,
    categoryId?: string
  ): Promise<boolean> {
    try {
      // Se não foi fornecido um categoryId, buscar a categoria "Vendas"
      let saleCategoryId = categoryId;
      if (!saleCategoryId) {
        const { DICategoryController } = await import('./DICategoryController');
        // Garantir que as categorias padrão existam
        await DICategoryController.ensureDefaultCategories();
        
        // Buscar a categoria de vendas
        const categories = await DICategoryController.getCategories();
        const vendasCategory = categories.find(c => 
          c.name.toLowerCase() === 'vendas' && 
          c.type === 'receita'
        );
        
        if (vendasCategory) {
          saleCategoryId = vendasCategory.id;
        } else {
          // Se não existir, criar
          const newCategory = await DICategoryController.createCategory('Vendas', 'receita', '#4CAF50');
          if (newCategory) {
            saleCategoryId = newCategory.id;
          }
        }
      }
      
      // Criar transação de venda (receita)
      return await this.createTransaction({
        type: 'receita',
        value,
        date,
        description,
        categoryId: saleCategoryId || '',
      });
    } catch (error) {
      console.error('Erro ao criar transação de venda:', error);
      return false;
    }
  }

  /**
   * Cria uma transação de pagamento de imposto DAS
   * @param value Valor do imposto
   * @param date Data do pagamento
   * @param description Descrição do pagamento (mês/ano de referência)
   * @param categoryId ID da categoria (opcional, usa 'Impostos' como padrão)
   * @returns true se a transação foi criada com sucesso
   */
  static async createTaxPaymentTransaction(
    value: number, 
    date: Date, 
    description: string,
    categoryId?: string
  ): Promise<boolean> {
    try {
      // Se não foi fornecido um categoryId, buscar a categoria "Impostos"
      let taxCategoryId = categoryId;
      if (!taxCategoryId) {
        const { DICategoryController } = await import('./DICategoryController');
        // Garantir que as categorias padrão existam
        await DICategoryController.ensureDefaultCategories();
        
        // Buscar a categoria de impostos
        const categories = await DICategoryController.getCategories();
        const impostosCategory = categories.find(c => 
          c.name.toLowerCase() === 'impostos' && 
          c.type === 'despesa'
        );
        
        if (impostosCategory) {
          taxCategoryId = impostosCategory.id;
        } else {
          // Se não existir, criar
          const newCategory = await DICategoryController.createCategory('Impostos', 'despesa', '#F44336');
          if (newCategory) {
            taxCategoryId = newCategory.id;
          }
        }
      }
      
      // Criar transação de pagamento de imposto (despesa)
      return await this.createTransaction({
        type: 'despesa',
        value,
        date,
        description,
        categoryId: taxCategoryId || '',
      });
    } catch (error) {
      console.error('Erro ao criar transação de pagamento de imposto:', error);
      return false;
    }
  }

  /**
   * Cria uma transação de serviço
   * @param value Valor do serviço
   * @param date Data do serviço
   * @param description Descrição do serviço
   * @param categoryId ID da categoria (opcional, usa 'Serviços' como padrão)
   * @returns true se a transação foi criada com sucesso
   */
  static async createServiceTransaction(
    value: number, 
    date: Date, 
    description: string,
    categoryId?: string
  ): Promise<boolean> {
    try {
      // Se não foi fornecido um categoryId, buscar a categoria "Serviços"
      let serviceCategoryId = categoryId;
      if (!serviceCategoryId) {
        const { DICategoryController } = await import('./DICategoryController');
        // Garantir que as categorias padrão existam
        await DICategoryController.ensureDefaultCategories();
        
        // Buscar a categoria de serviços
        const categories = await DICategoryController.getCategories();
        const servicosCategory = categories.find(c => 
          c.name.toLowerCase() === 'serviços' && 
          c.type === 'receita'
        );
        
        if (servicosCategory) {
          serviceCategoryId = servicosCategory.id;
        } else {
          // Se não existir, criar
          const newCategory = await DICategoryController.createCategory('Serviços', 'receita', '#2196F3');
          if (newCategory) {
            serviceCategoryId = newCategory.id;
          }
        }
      }
      
      // Criar transação de serviço (receita)
      return await this.createTransaction({
        type: 'receita',
        value,
        date,
        description,
        categoryId: serviceCategoryId || '',
      });
    } catch (error) {
      console.error('Erro ao criar transação de serviço:', error);
      return false;
    }
  }

  /**
   * Busca transações de pagamentos próximos do vencimento (7 dias ou menos)
   * @returns Lista de transações próximas do vencimento
   */
  static async getUpcomingPayments(): Promise<Transaction[]> {
    try {
      const transactionService = this.getTransactionService();
      const { data, error } = await transactionService.getAll();
      
      if (error || !data) {
        return [];
      }
      
      // Filtrar transações do tipo despesa com data futura e no máximo 7 dias à frente
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      sevenDaysFromNow.setHours(23, 59, 59, 999);
      
      const upcomingPayments = data.filter(transaction => {
        // Verificar se é uma despesa
        if (transaction.type !== 'despesa') return false;
        
        // Converter a data da transação para objeto Date
        const transactionDate = new Date(transaction.date);
        transactionDate.setHours(0, 0, 0, 0);
        
        // Verificar se a data está entre hoje e 7 dias à frente
        return transactionDate >= today && transactionDate <= sevenDaysFromNow;
      });
      
      return upcomingPayments;
    } catch (error) {
      console.error('Erro ao buscar pagamentos próximos:', error);
      return [];
    }
  }
}