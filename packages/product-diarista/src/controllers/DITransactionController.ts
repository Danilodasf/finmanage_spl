/**
 * Controlador de transações usando injeção de dependências
 * Gerencia operações de transações específicas para diaristas
 */

import { DIContainer } from '../lib/core/di';
import { TransactionService, Transaction } from '../lib/core/services';
import { TRANSACTION_SERVICE, AUTH_SERVICE } from '../lib/di/bootstrap';
import { DiaristaTransactionService } from '../services/DiaristaTransactionService';
import { DiaristaAuthService } from '../services/DiaristaAuthService';
import { TransacaoDiarista, CreateTransacaoDiaristaDTO, UpdateTransacaoDiaristaDTO } from '../models/DiaristaModels';

export class DITransactionController {
  private transactionService: DiaristaTransactionService;
  private authService: DiaristaAuthService;
  private currentUser: any = null;

  constructor() {
    const container = DIContainer.getInstance();
    
    // Obtém os serviços do container DI
    this.transactionService = container.get(TRANSACTION_SERVICE) as DiaristaTransactionService;
    this.authService = container.get(AUTH_SERVICE) as DiaristaAuthService;
    
    if (!this.transactionService) {
      throw new Error('TransactionService não encontrado no container DI');
    }
    
    if (!this.authService) {
      throw new Error('AuthService não encontrado no container DI');
    }
  }

  /**
   * Verifica e obtém o usuário atual
   */
  private async ensureUserAuthenticated(): Promise<{ user: any | null; error: string | null }> {
    try {
      const result = await this.authService.getCurrentUser();
      if (result.user) {
        this.currentUser = result.user;
        return { user: result.user, error: null };
      }
      return { user: null, error: result.error || 'Usuário não autenticado' };
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return { user: null, error: 'Erro ao verificar autenticação' };
    }
  }

  /**
   * Busca todas as transações do usuário atual
   */
  async getAllTransactions(): Promise<{ data: Transaction[] | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      const result = await this.transactionService.getAll();
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      // Filtra transações do usuário atual
      const userTransactions = result.data?.filter(
        transaction => transaction.user_id === this.currentUser.id
      ) || [];

      return { data: userTransactions, error: null };
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Busca uma transação específica por ID
   */
  async getTransactionById(id: string): Promise<{ data: Transaction | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      const result = await this.transactionService.getById(id);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      // Verifica se a transação pertence ao usuário atual
      if (result.data && result.data.user_id !== this.currentUser.id) {
        return { data: null, error: 'Transação não encontrada' };
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Cria uma nova transação
   */
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Transaction | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      // Adiciona o user_id à transação
      const completeTransactionData = {
        ...transactionData,
        user_id: this.currentUser.id
      };

      const result = await this.transactionService.create(completeTransactionData);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Atualiza uma transação existente
   */
  async updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<{ data: Transaction | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      // Verifica se a transação pertence ao usuário
      const existingResult = await this.getTransactionById(id);
      if (existingResult.error || !existingResult.data) {
        return { data: null, error: existingResult.error || 'Transação não encontrada' };
      }

      const result = await this.transactionService.update(id, transactionData);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Exclui uma transação
   */
  async deleteTransaction(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { success: false, error: authResult.error || 'Usuário não autenticado' };
      }

      // Verifica se a transação pertence ao usuário
      const existingResult = await this.getTransactionById(id);
      if (existingResult.error || !existingResult.data) {
        return { success: false, error: existingResult.error || 'Transação não encontrada' };
      }

      const result = await this.transactionService.delete(id);
      
      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: result.data, error: null };
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Métodos específicos para diaristas

  /**
   * Busca transações por período
   */
  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<{ data: TransacaoDiarista[] | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      const result = await this.transactionService.getByDateRange(startDate, endDate);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      // Filtra transações do usuário atual
      const userTransactions = result.data?.filter(
        transaction => transaction.user_id === this.currentUser.id
      ) || [];

      return { data: userTransactions, error: null };
    } catch (error) {
      console.error('Erro ao buscar transações por período:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Busca transações por status de pagamento
   */
  async getTransactionsByPaymentStatus(status: 'pendente' | 'pago' | 'atrasado'): Promise<{ data: TransacaoDiarista[] | null; error: string | null }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      const result = await this.transactionService.getByPaymentStatus(status);
      
      if (result.error) {
        return { data: null, error: result.error.message };
      }

      // Filtra transações do usuário atual
      const userTransactions = result.data?.filter(
        transaction => transaction.user_id === this.currentUser.id
      ) || [];

      return { data: userTransactions, error: null };
    } catch (error) {
      console.error('Erro ao buscar transações por status:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Calcula resumo financeiro
   */
  async getFinancialSummary(startDate?: string, endDate?: string): Promise<{
    data: {
      totalReceitas: number;
      totalDespesas: number;
      saldo: number;
      transacoesCount: number;
    } | null;
    error: string | null;
  }> {
    try {
      // Verifica autenticação antes de prosseguir
      const authResult = await this.ensureUserAuthenticated();
      if (!authResult.user) {
        return { data: null, error: authResult.error || 'Usuário não autenticado' };
      }

      const [receitasResult, despesasResult] = await Promise.all([
        this.transactionService.getTotalReceitas(startDate, endDate),
        this.transactionService.getTotalDespesas(startDate, endDate)
      ]);

      if (receitasResult.error) {
        return { data: null, error: receitasResult.error.message };
      }

      if (despesasResult.error) {
        return { data: null, error: despesasResult.error.message };
      }

      // Busca contagem de transações
      const transactionsResult = startDate && endDate 
        ? await this.getTransactionsByDateRange(startDate, endDate)
        : await this.getAllTransactions();

      if (transactionsResult.error) {
        return { data: null, error: transactionsResult.error };
      }

      const totalReceitas = receitasResult.data;
      const totalDespesas = despesasResult.data;
      const saldo = totalReceitas - totalDespesas;
      const transacoesCount = transactionsResult.data?.length || 0;

      return {
        data: {
          totalReceitas,
          totalDespesas,
          saldo,
          transacoesCount
        },
        error: null
      };
    } catch (error) {
      console.error('Erro ao calcular resumo financeiro:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Busca transações recentes
   */
  async getRecentTransactions(limit: number = 10): Promise<{ data: Transaction[] | null; error: string | null }> {
    try {
      const result = await this.getAllTransactions();
      
      if (result.error) {
        return { data: null, error: result.error };
      }

      // Ordena por data de criação (mais recentes primeiro) e limita
      const recentTransactions = result.data
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit) || [];

      return { data: recentTransactions, error: null };
    } catch (error) {
      console.error('Erro ao buscar transações recentes:', error);
      return { data: null, error: 'Erro interno do servidor' };
    }
  }
}