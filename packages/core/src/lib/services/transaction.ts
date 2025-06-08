import { BaseEntityService } from './base';
import { supabase } from '../supabase';
import { getCurrentUserId } from '../supabase';

// Mock data para desenvolvimento (remover quando o Supabase estiver configurado)
let mockTransactionIdCounter = 1;
const mockTransactions: Transaction[] = [
  {
    id: '1',
    user_id: 'mock-user-id',
    type: 'receita',
    category_id: '1',
    description: 'Venda de produto',
    value: 1500.00,
    date: '2024-01-15',
    payment_method: 'PIX',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: 'mock-user-id',
    type: 'despesa',
    category_id: '4',
    description: 'Aluguel do escritório',
    value: 800.00,
    date: '2024-01-10',
    payment_method: 'Transferência',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  },
  {
    id: '3',
    user_id: 'mock-user-id',
    type: 'receita',
    category_id: '2',
    description: 'Prestação de serviço',
    value: 2000.00,
    date: '2024-01-20',
    payment_method: 'Cartão',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  }
];

/**
 * Interface para representar uma transação
 */
export interface Transaction {
  id: string;
  user_id: string;
  type: 'receita' | 'despesa';
  category_id: string;
  description: string;
  value: number;
  date: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para criar uma nova transação
 */
export interface CreateTransactionDTO {
  type: 'receita' | 'despesa';
  category_id: string;
  description: string;
  value: number;
  date: string;
  payment_method?: string;
}

/**
 * Interface para atualizar uma transação existente
 */
export interface UpdateTransactionDTO {
  type?: 'receita' | 'despesa';
  category_id?: string;
  description?: string;
  value?: number;
  date?: string;
  payment_method?: string;
}

/**
 * Interface para o serviço de transações
 */
export interface TransactionService extends BaseEntityService<Transaction> {
  /**
   * Busca transações por período
   * @param startDate Data inicial
   * @param endDate Data final
   */
  getByDateRange(startDate: string, endDate: string): Promise<{ data: Transaction[] | null; error: Error | null }>;
  
  /**
   * Busca transações por tipo (receita/despesa)
   * @param type Tipo da transação
   */
  getByType(type: 'receita' | 'despesa'): Promise<{ data: Transaction[] | null; error: Error | null }>;
  
  /**
   * Calcula o resumo financeiro para um período
   * @param period Período (mês ou ano)
   */
  getFinancialSummary(period: 'month' | 'year'): Promise<{
    receitas: number;
    despesas: number;
    saldo: number;
    transactions: Transaction[];
  }>;
  
  /**
   * Calcula o saldo disponível
   */
  getAvailableBalance(): Promise<number>;
}

/**
 * Implementação do serviço de transações usando Supabase
 */
export class TransactionService {
  /**
   * Busca todas as transações do usuário atual
   */
  static async getAll(): Promise<Transaction[]> {
    try {
      // Mock: retornar transações fictícias
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockTransactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Erro ao buscar transações:', error);
        return [];
      }
      
      return data as Transaction[];
      */
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  }
  
  /**
   * Busca uma transação pelo ID
   * @param id ID da transação
   */
  static async getById(id: string): Promise<Transaction | null> {
    try {
      // Mock: buscar transação fictícia por ID
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const transaction = mockTransactions.find(t => t.id === id);
      return transaction || null;
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar transação:', error);
        return null;
      }
      
      return data as Transaction;
      */
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      return null;
    }
  }
  
  /**
   * Cria uma nova transação
   * @param transaction Dados da transação
   */
  static async create(transaction: CreateTransactionDTO): Promise<Transaction | null> {
    try {
      // Mock: criar transação fictícia
      await new Promise(resolve => setTimeout(resolve, 300));
      
      mockTransactionIdCounter++;
      const newTransaction: Transaction = {
        id: mockTransactionIdCounter.toString(),
        user_id: 'mock-user-id',
        ...transaction,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockTransactions.push(newTransaction);
      return newTransaction;
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: userId,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao criar transação:', error);
        return null;
      }
      
      return data as Transaction;
      */
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return null;
    }
  }
  
  /**
   * Atualiza uma transação existente
   * @param id ID da transação
   * @param transaction Dados para atualização
   */
  static async update(id: string, transaction: UpdateTransactionDTO): Promise<Transaction | null> {
    try {
      // Mock: atualizar transação fictícia
      await new Promise(resolve => setTimeout(resolve, 250));
      
      const transactionIndex = mockTransactions.findIndex(t => t.id === id);
      if (transactionIndex === -1) {
        return null;
      }
      
      const updatedTransaction = {
        ...mockTransactions[transactionIndex],
        ...transaction,
        updated_at: new Date().toISOString()
      };
      
      mockTransactions[transactionIndex] = updatedTransaction;
      return updatedTransaction;
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar transação:', error);
        return null;
      }
      
      return data as Transaction;
      */
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return null;
    }
  }
  
  /**
   * Remove uma transação
   * @param id ID da transação
   */
  static async delete(id: string): Promise<boolean> {
    try {
      // Mock: remover transação fictícia
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const transactionIndex = mockTransactions.findIndex(t => t.id === id);
      if (transactionIndex === -1) {
        return false;
      }
      
      mockTransactions.splice(transactionIndex, 1);
      return true;
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao excluir transação:', error);
        return false;
      }
      
      return true;
      */
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      return false;
    }
  }
  
  /**
   * Busca transações filtradas por tipo, categoria e/ou intervalo de datas
   * @param type Tipo da transação (receita ou despesa)
   * @param categoryId ID da categoria
   * @param startDate Data inicial
   * @param endDate Data final
   */
  static async getFiltered(
    type?: 'receita' | 'despesa', 
    categoryId?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<Transaction[]> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);
        
      if (type) {
        query = query.eq('type', type);
      }
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      if (startDate) {
        query = query.gte('date', startDate);
      }
      
      if (endDate) {
        query = query.lte('date', endDate);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
        
      if (error) {
        console.error('Erro ao buscar transações filtradas:', error);
        return [];
      }
      
      return data as Transaction[];
    } catch (error) {
      console.error('Erro ao buscar transações filtradas:', error);
      return [];
    }
  }
  
  /**
   * Retorna o saldo atual (receitas - despesas)
   */
  static async getBalance(): Promise<number> {
    try {
      const transactions = await this.getAll();
      
      const balance = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'receita') {
          return acc + transaction.value;
        } else {
          return acc - transaction.value;
        }
      }, 0);
      
      return balance;
    } catch (error) {
      console.error('Erro ao calcular saldo:', error);
      return 0;
    }
  }
  
  /**
   * Retorna o total de receitas no período
   * @param startDate Data inicial
   * @param endDate Data final
   */
  static async getTotalIncome(startDate?: string, endDate?: string): Promise<number> {
    try {
      const transactions = await this.getFiltered('receita', undefined, startDate, endDate);
      
      const total = transactions.reduce((acc, transaction) => acc + transaction.value, 0);
      
      return total;
    } catch (error) {
      console.error('Erro ao calcular total de receitas:', error);
      return 0;
    }
  }
  
  /**
   * Retorna o total de despesas no período
   * @param startDate Data inicial
   * @param endDate Data final
   */
  static async getTotalExpenses(startDate?: string, endDate?: string): Promise<number> {
    try {
      const transactions = await this.getFiltered('despesa', undefined, startDate, endDate);
      
      const total = transactions.reduce((acc, transaction) => acc + transaction.value, 0);
      
      return total;
    } catch (error) {
      console.error('Erro ao calcular total de despesas:', error);
      return 0;
    }
  }
}