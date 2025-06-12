// Importa o container de injeção de dependências (DI) do core
import { DIContainer, TRANSACTION_SERVICE } from '@finmanage/core/di';
import { TransactionService, Transaction } from '@finmanage/core/services';
import { toast } from '@/hooks/use-toast';

/**
 * Controlador de transações que usa injeção de dependências
 * Este é um exemplo de como usar o sistema de DI para acessar serviços
 */
export class DITransactionController {
  /**
   * Obtém o serviço de transações do container de DI
   * @returns Instância do serviço de transações
   */
  private static getTransactionService(): TransactionService {
    // Adicionar verificação explícita para DIContainer
    if (!DIContainer) {
      const errorMessage = 'DIContainer não está disponível. Não é possível obter o serviço de transações.';
      console.error(errorMessage);
      toast({
        title: "Erro Crítico de Sistema",
        description: "O container de Injeção de Dependência não está disponível. Por favor, recarregue a página ou contate o suporte.",
        variant: "destructive",
      });
      throw new Error(errorMessage);
    }

    try {
      // Verificar se o serviço está registrado
      if (!DIContainer.has(TRANSACTION_SERVICE)) {
        const errorMessage = `Serviço ${TRANSACTION_SERVICE} não está registrado no container`;
        console.error(errorMessage);
        toast({ // Toast específico para serviço não registrado
          title: "Erro de Configuração",
          description: `Serviço essencial (${TRANSACTION_SERVICE}) não registrado. Funcionalidades podem estar indisponíveis.`,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      const service = DIContainer.get<TransactionService>(TRANSACTION_SERVICE);
      
      if (!service) {
        const errorMessage = `Serviço ${TRANSACTION_SERVICE} é nulo ou indefinido após DIContainer.get()`;
        console.error(errorMessage);
        toast({ // Toast específico para serviço nulo
          title: "Erro de Serviço",
          description: `O serviço (${TRANSACTION_SERVICE}) não pôde ser carregado corretamente.`,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
      
      return service;
    } catch (error) { // Este catch agora lida com erros de .has(), .get() ou os erros lançados acima
      console.error('Erro ao obter serviço de transações do DIContainer:', error);
      // Evitar toasts duplicados se um específico já foi emitido.
      // O throw error já está aqui, e os toasts específicos já foram acionados.
      // O toast genérico original pode ser redundante ou pode ser mantido como um fallback
      // se a lógica de não duplicar for muito complexa.
      // Por ora, o throw error é o mais importante.
      // O toast genérico original é:
      // toast({
      //   title: "Erro de sistema",
      //   description: "Erro ao inicializar serviços. Tente recarregar a página.",
      //   variant: "destructive",
      // });
      throw error; // Re-throw para que o chamador possa tratar.
    }
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
   * Calcula o saldo disponível (receitas - despesas) do mês atual
   * @returns Saldo disponível
   */
  static async getAvailableBalance(): Promise<number> {
    try {
      const { receitas, despesas } = await this.getFinancialSummary('month');
      return receitas - despesas;
    } catch (error) {
      console.error('Erro ao calcular saldo disponível:', error);
      return 0;
    }
  }

  /**
   * Verifica se há saldo disponível para uma despesa
   * @param amount Valor da despesa
   * @returns true se há saldo disponível
   */
  static async hasAvailableBalance(amount: number): Promise<boolean> {
    try {
      const availableBalance = await this.getAvailableBalance();
      return availableBalance >= amount;
    } catch (error) {
      console.error('Erro ao verificar saldo disponível:', error);
      return false;
    }
  }

  /**
   * Cria uma nova transação
   * @param data Dados da transação
   * @returns true se a transação foi criada com sucesso
   */
  static async createTransaction(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      // Se for uma despesa, verificar se há saldo disponível
      if (data.type === 'despesa') {
        const hasSufficientBalance = await this.hasAvailableBalance(data.value);
        if (!hasSufficientBalance) {
          toast({
            title: "Saldo insuficiente",
            description: "Você não possui saldo suficiente para esta despesa.",
            variant: "destructive",
          });
          return false;
        }
      }

      const transactionService = this.getTransactionService();
      const { data: newTransaction, error } = await transactionService.create(data);
      
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
      const now = new Date();
      let startDate, endDate;
      
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      } else {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      }
      
      const transactionService = this.getTransactionService();
      const { data, error } = await transactionService.getByDateRange(startDate, endDate);
      
      if (error || !data) {
        return {
          receitas: 0,
          despesas: 0,
          saldo: 0,
          transactions: []
        };
      }
      
      const receitas = data
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + Number(t.value), 0);
      
      const despesas = data
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + Number(t.value), 0);

      return {
        receitas,
        despesas,
        saldo: receitas - despesas,
        transactions: data
      };
    } catch (error) {
      console.error('Erro ao calcular resumo financeiro:', error);
      return {
        receitas: 0,
        despesas: 0,
        saldo: 0,
        transactions: []
      };
    }
  }

  /**
   * Obtém dados mensais de receitas e despesas para um ano específico
   * @param year Ano (padrão: ano atual)
   * @returns Dados mensais de receitas e despesas
   */
  static async getMonthlyData(year: number = new Date().getFullYear()): Promise<{ name: string; receitas: number; despesas: number }[]> {
    try {
      // Nomes dos meses em português
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      // Inicializa o array com todos os meses
      const monthlyData = monthNames.map((name, index) => ({
        name,
        receitas: 0,
        despesas: 0,
        month: index + 1 // Mês 1-12
      }));
      
      // Define o período para o ano inteiro
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      // Busca todas as transações do ano
      const transactionService = this.getTransactionService();
      const { data, error } = await transactionService.getByDateRange(startDate, endDate);
      
      if (error || !data) {
        return monthlyData.map(({ name, receitas, despesas }) => ({ name, receitas, despesas }));
      }
      
      // Processa as transações e agrupa por mês
      data.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = date.getMonth(); // 0-11
        
        if (transaction.type === 'receita') {
          monthlyData[month].receitas += Number(transaction.value);
        } else if (transaction.type === 'despesa') {
          monthlyData[month].despesas += Number(transaction.value);
        }
      });
      
      // Remove a propriedade month antes de retornar
      return monthlyData.map(({ name, receitas, despesas }) => ({ 
        name, 
        receitas, 
        despesas 
      }));
    } catch (error) {
      console.error('Erro ao buscar dados mensais:', error);
      return [];
    }
  }
}