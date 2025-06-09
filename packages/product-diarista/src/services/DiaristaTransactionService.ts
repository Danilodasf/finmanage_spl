/**
 * Implementação do serviço de transações para diaristas
 * Implementa a interface TransactionService do core com funcionalidades específicas
 */

import { TransactionService, Transaction, CreateTransactionDTO, UpdateTransactionDTO } from '../lib/core/services';
import { databaseAdapter } from '../lib/database/DatabaseAdapter';
import { TransacaoDiarista, CreateTransacaoDiaristaDTO, UpdateTransacaoDiaristaDTO } from '../models/DiaristaModels';

export class DiaristaTransactionService implements TransactionService {
  private readonly tableName = 'transactions';

  /**
   * Mapeia TransacaoDiarista para Transaction (interface do core)
   */
  private mapToTransaction(transacao: TransacaoDiarista): Transaction {
    return {
      id: transacao.id,
      user_id: transacao.user_id,
      type: transacao.type,
      category_id: transacao.category_id,
      description: transacao.description,
      value: transacao.value,
      date: transacao.date,
      payment_method: transacao.payment_method,
      created_at: transacao.created_at,
      updated_at: transacao.updated_at,
      servico_id: transacao.servico_id,
      gasto_servico_id: transacao.gasto_servico_id,
      is_auto_generated: transacao.is_auto_generated
    };
  }

  /**
   * Mapeia Transaction para TransacaoDiarista
   */
  private mapToTransacaoDiarista(transaction: Transaction): TransacaoDiarista {
    return transaction as TransacaoDiarista;
  }

  async getAll(): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      const result = await databaseAdapter.getAll<TransacaoDiarista>(this.tableName);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const transactions = result.data?.map(transaction => this.mapToTransaction(transaction)) || [];
      return { data: transactions, error: null };
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return { data: null, error: error as Error };
    }
  }

  async getById(id: string): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      const result = await databaseAdapter.getById<TransacaoDiarista>(this.tableName, id);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const transaction = result.data ? this.mapToTransaction(result.data) : null;
      return { data: transaction, error: null };
    } catch (error) {
      console.error(`Erro ao buscar transação ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }

  async create(transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      // Validações específicas para diaristas
      if (transactionData.type === 'income' && !transactionData.category_id) {
        return { data: null, error: new Error('Categoria é obrigatória para receitas de serviços') };
      }
      
      if (transactionData.value <= 0) {
        return { data: null, error: new Error('Valor deve ser maior que zero') };
      }
      
      const result = await databaseAdapter.create<TransacaoDiarista>(this.tableName, transactionData);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const transaction = result.data ? this.mapToTransaction(result.data) : null;
      return { data: transaction, error: null };
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return { data: null, error: error as Error };
    }
  }

  async update(id: string, transactionData: Partial<Transaction>): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      // Validações para atualização
      if (transactionData.value !== undefined && transactionData.value <= 0) {
        return { data: null, error: new Error('Valor deve ser maior que zero') };
      }
      
      // Verificar se a transação está relacionada a um serviço concluído
      const existingTransaction = await databaseAdapter.getById<TransacaoDiarista>(this.tableName, id);
      if (existingTransaction.error) {
        return { data: null, error: existingTransaction.error };
      }
      
      if (existingTransaction.data?.servico_id) {
        // Verificar se o serviço está concluído
        const servicoResult = await databaseAdapter.getById('servicos', existingTransaction.data.servico_id);
        if (servicoResult.data && servicoResult.data.status === 'concluido') {
          return { 
            data: null, 
            error: new Error('A edição de transações relacionadas a serviços concluídos só é permitida na tela "Serviços"') 
          };
        }
      }
      
      const result = await databaseAdapter.update<TransacaoDiarista>(this.tableName, id, transactionData);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const transaction = result.data ? this.mapToTransaction(result.data) : null;
      return { data: transaction, error: null };
    } catch (error) {
      console.error(`Erro ao atualizar transação ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }

  async delete(id: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      // Verificar se a transação está relacionada a um serviço concluído
      const existingTransaction = await databaseAdapter.getById<TransacaoDiarista>(this.tableName, id);
      if (existingTransaction.error) {
        return { data: false, error: existingTransaction.error };
      }
      
      if (existingTransaction.data?.servico_id) {
        // Verificar se o serviço está concluído
        const servicoResult = await databaseAdapter.getById('servicos', existingTransaction.data.servico_id);
        if (servicoResult.data && servicoResult.data.status === 'concluido') {
          return { 
            data: false, 
            error: new Error('A deleção de transações relacionadas a serviços concluídos só é permitida na tela "Serviços"') 
          };
        }
      }
      
      const result = await databaseAdapter.delete(this.tableName, id);
      return { data: result.data || false, error: result.error };
    } catch (error) {
      console.error(`Erro ao deletar transação ${id}:`, error);
      return { data: false, error: error as Error };
    }
  }

  // Métodos específicos para diaristas
  
  /**
   * Busca transações por período específico
   */
  async getByDateRange(startDate: string, endDate: string): Promise<{ data: TransacaoDiarista[] | null; error: Error | null }> {
    try {
      const result = await databaseAdapter.getAll<TransacaoDiarista>(this.tableName);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const transactions = result.data?.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactionDate >= start && transactionDate <= end;
      }) || [];
      
      return { data: transactions, error: null };
    } catch (error) {
      console.error('Erro ao buscar transações por período:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Busca transações por status de pagamento
   */
  async getByPaymentStatus(status: 'pendente' | 'pago' | 'atrasado'): Promise<{ data: TransacaoDiarista[] | null; error: Error | null }> {
    try {
      const result = await databaseAdapter.findWhere<TransacaoDiarista>(this.tableName, {
        status_pagamento: status
      });
      
      return { data: result.data, error: result.error };
    } catch (error) {
      console.error(`Erro ao buscar transações com status ${status}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Calcula total de receitas no período
   */
  async getTotalReceitas(startDate?: string, endDate?: string): Promise<{ data: number; error: Error | null }> {
    try {
      let transactions: TransacaoDiarista[];
      
      if (startDate && endDate) {
        const result = await this.getByDateRange(startDate, endDate);
        if (result.error) return { data: 0, error: result.error };
        transactions = result.data || [];
      } else {
        const result = await databaseAdapter.getAll<TransacaoDiarista>(this.tableName);
        if (result.error) return { data: 0, error: result.error };
        transactions = result.data || [];
      }
      
      const total = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.value, 0);
      
      return { data: total, error: null };
    } catch (error) {
      console.error('Erro ao calcular total de receitas:', error);
      return { data: 0, error: error as Error };
    }
  }

  /**
   * Calcula total de despesas no período
   */
  async getTotalDespesas(startDate?: string, endDate?: string): Promise<{ data: number; error: Error | null }> {
    try {
      let transactions: TransacaoDiarista[];
      
      if (startDate && endDate) {
        const result = await this.getByDateRange(startDate, endDate);
        if (result.error) return { data: 0, error: result.error };
        transactions = result.data || [];
      } else {
        const result = await databaseAdapter.getAll<TransacaoDiarista>(this.tableName);
        if (result.error) return { data: 0, error: result.error };
        transactions = result.data || [];
      }
      
      const total = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0);
      
      return { data: total, error: null };
    } catch (error) {
      console.error('Erro ao calcular total de despesas:', error);
      return { data: 0, error: error as Error };
    }
  }
}