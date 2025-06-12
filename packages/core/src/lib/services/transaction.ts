import { BaseEntityService } from './base';
import { supabase } from '../supabase';
import { getCurrentUserId } from '../supabase';

/**
 * Dados mockados para desenvolvimento e testes
 * 
 * IMPORTANTE: Estes dados devem ser removidos quando a integração
 * com Supabase estiver completamente configurada e funcionando.
 * 
 * Os dados simulam transações típicas de um usuário para permitir
 * desenvolvimento e testes das funcionalidades sem dependência do banco.
 */
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
 * Interface que representa uma transação financeira completa no sistema
 * 
 * Esta interface define a estrutura de dados para transações que serão
 * armazenadas no banco de dados (Supabase) e inclui metadados de auditoria.
 */
export interface Transaction {
  /** Identificador único da transação */
  id: string;
  
  /** ID do usuário proprietário da transação */
  user_id: string;
  
  /** Tipo da transação: 'receita' (entrada) ou 'despesa' (saída) */
  type: 'receita' | 'despesa';
  
  /** ID da categoria à qual esta transação pertence */
  category_id: string;
  
  /** Descrição detalhada da transação */
  description: string;
  
  /** Valor monetário da transação */
  value: number;
  
  /** Data da transação no formato ISO string */
  date: string;
  
  /** Método de pagamento utilizado (opcional) */
  payment_method?: string;
  
  /** Timestamp de criação do registro (ISO string) */
  created_at?: string;
  
  /** Timestamp da última atualização do registro (ISO string) */
  updated_at?: string;
}

/**
 * DTO (Data Transfer Object) para criação de uma nova transação
 * 
 * Contém apenas os campos necessários para criar uma transação.
 * Os campos id, user_id, created_at e updated_at são gerados automaticamente.
 */
export interface CreateTransactionDTO {
  /** Tipo da transação: 'receita' (entrada) ou 'despesa' (saída) */
  type: 'receita' | 'despesa';
  
  /** ID da categoria à qual esta transação pertence */
  category_id: string;
  
  /** Descrição detalhada da transação */
  description: string;
  
  /** Valor monetário da transação */
  value: number;
  
  /** Data da transação no formato ISO string */
  date: string;
  
  /** Método de pagamento utilizado (opcional) */
  payment_method?: string;
}

/**
 * DTO (Data Transfer Object) para atualização de uma transação existente
 * 
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * O campo updated_at é atualizado automaticamente pelo sistema.
 */
export interface UpdateTransactionDTO {
  /** Tipo da transação: 'receita' (entrada) ou 'despesa' (saída) */
  type?: 'receita' | 'despesa';
  
  /** ID da categoria à qual esta transação pertence */
  category_id?: string;
  
  /** Descrição detalhada da transação */
  description?: string;
  
  /** Valor monetário da transação */
  value?: number;
  
  /** Data da transação no formato ISO string */
  date?: string;
  
  /** Método de pagamento utilizado (opcional) */
  payment_method?: string;
}

/**
 * Interface que define o contrato para serviços de transação
 * 
 * Esta interface estabelece os métodos que qualquer implementação
 * de serviço de transação deve fornecer, garantindo consistência
 * entre diferentes implementações (localStorage, Supabase, etc.)
 */
export interface TransactionServiceInterface {
  /** Busca todas as transações do usuário */
  getTransactions(): Promise<Transaction[]>;
  
  /** Cria uma nova transação */
  createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  
  /** Atualiza uma transação existente */
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  
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
 * Implementação do serviço de transações
 * 
 * Esta classe fornece métodos para gerenciar transações financeiras.
 * Atualmente utiliza dados mockados para desenvolvimento, mas está
 * preparada para integração com Supabase quando configurado.
 * 
 * Funcionalidades principais:
 * - CRUD completo de transações
 * - Filtros por período e tipo
 * - Cálculos de resumos financeiros
 * - Validações de dados
 */
export class TransactionService {
  /**
   * Busca todas as transações do usuário atual
   * 
   * Durante o desenvolvimento, retorna dados mockados com um delay
   * simulado para testar estados de carregamento. Em produção,
   * fará consulta real ao Supabase.
   * 
   * @returns Promise com array de transações ordenadas por data (mais recentes primeiro)
   */
  static async getAll(): Promise<Transaction[]> {
    try {
      // Simula delay de rede para testar estados de carregamento
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
   * Busca uma transação específica pelo seu ID
   * 
   * Verifica se o usuário está autenticado e se a transação
   * pertence ao usuário atual antes de retorná-la.
   * 
   * @param id - Identificador único da transação
   * @returns Promise com a transação encontrada ou null se não existir
   */
  static async getById(id: string): Promise<Transaction | null> {
    try {
      // Simula delay de rede para busca específica
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
   * Cria uma nova transação no sistema
   * 
   * Valida os dados fornecidos, gera um ID único e timestamps,
   * associa a transação ao usuário atual e persiste no banco.
   * 
   * @param transaction - Dados da transação a ser criada (sem ID)
   * @returns Promise com a transação criada ou null em caso de erro
   */
  static async create(transaction: CreateTransactionDTO): Promise<Transaction | null> {
    try {
      // Simula delay de rede para operação de criação
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
   * 
   * Permite atualização parcial dos dados da transação.
   * Verifica se a transação existe e pertence ao usuário atual
   * antes de aplicar as modificações.
   * 
   * @param id - Identificador único da transação a ser atualizada
   * @param transaction - Dados parciais para atualização
   * @returns Promise com a transação atualizada ou null se não encontrada
   */
  static async update(id: string, transaction: UpdateTransactionDTO): Promise<Transaction | null> {
    try {
      // Simula delay de rede para operação de atualização
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
   * Remove uma transação do sistema
   * 
   * Verifica se a transação existe e pertence ao usuário atual
   * antes de removê-la permanentemente do banco de dados.
   * 
   * @param id - Identificador único da transação a ser removida
   * @returns Promise com true se removida com sucesso, false caso contrário
   */
  static async delete(id: string): Promise<boolean> {
    try {
      // Simula delay de rede para operação de remoção
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
   * Busca transações com filtros avançados
   * 
   * Permite filtrar transações por múltiplos critérios simultaneamente.
   * Todos os parâmetros são opcionais, permitindo combinações flexíveis.
   * 
   * @param type - Tipo da transação ('receita' ou 'despesa') - opcional
   * @param categoryId - ID da categoria para filtrar - opcional
   * @param startDate - Data inicial do período (ISO string) - opcional
   * @param endDate - Data final do período (ISO string) - opcional
   * @returns Promise com array de transações que atendem aos critérios
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
   * Calcula o saldo atual do usuário
   * 
   * Soma todas as receitas e subtrai todas as despesas para
   * determinar o saldo líquido disponível.
   * 
   * @returns Promise com o saldo atual (pode ser negativo)
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
   * Calcula o total de receitas em um período específico
   * 
   * Se as datas não forem fornecidas, considera todas as receitas.
   * Útil para relatórios e análises financeiras.
   * 
   * @param startDate - Data inicial do período (ISO string) - opcional
   * @param endDate - Data final do período (ISO string) - opcional
   * @returns Promise com o valor total das receitas no período
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
   * Calcula o total de despesas em um período específico
   * 
   * Se as datas não forem fornecidas, considera todas as despesas.
   * Útil para controle de gastos e análises financeiras.
   * 
   * @param startDate - Data inicial do período (ISO string) - opcional
   * @param endDate - Data final do período (ISO string) - opcional
   * @returns Promise com o valor total das despesas no período
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