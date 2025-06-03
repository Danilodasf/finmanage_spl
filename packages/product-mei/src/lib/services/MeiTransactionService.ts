import { TransactionService, Transaction, CreateTransactionData } from '../core-exports';

/**
 * Implementação do serviço de transações para o produto MEI
 */
export class MeiTransactionService implements TransactionService {
  // Chave para armazenamento local
  private storageKey = 'finmanage_mei_transactions';
  
  // Transações simuladas para demonstração
  private defaultTransactions: Transaction[] = [
    {
      id: '1',
      type: 'receita',
      date: '2023-06-15',
      value: 1500,
      description: 'Venda de produtos',
      categoryId: '1',
      created_at: '2023-06-15T10:00:00Z',
      updated_at: '2023-06-15T10:00:00Z'
    },
    {
      id: '2',
      type: 'despesa',
      date: '2023-06-10',
      value: 350,
      description: 'Compra de materiais',
      categoryId: '3',
      created_at: '2023-06-10T10:00:00Z',
      updated_at: '2023-06-10T10:00:00Z'
    },
    {
      id: '3',
      type: 'receita',
      date: '2023-06-05',
      value: 2000,
      description: 'Serviço de consultoria',
      categoryId: '2',
      created_at: '2023-06-05T10:00:00Z',
      updated_at: '2023-06-05T10:00:00Z'
    },
    {
      id: '4',
      type: 'despesa',
      date: '2023-06-02',
      value: 800,
      description: 'Aluguel do escritório',
      categoryId: '4',
      created_at: '2023-06-02T10:00:00Z',
      updated_at: '2023-06-02T10:00:00Z'
    }
  ];
  
  /**
   * Inicializa o armazenamento com transações padrão se estiver vazio
   */
  private initializeStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.defaultTransactions));
    }
  }
  
  /**
   * Busca todas as transações
   */
  async getAll(): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const transactions = stored ? JSON.parse(stored) : [];
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { data: transactions, error: null };
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca uma transação pelo ID
   * @param id ID da transação
   */
  async getById(id: string): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const transactions = stored ? JSON.parse(stored) : [];
      const transaction = transactions.find((t: Transaction) => t.id === id);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!transaction) {
        return { data: null, error: new Error(`Transação com ID ${id} não encontrada`) };
      }
      
      return { data: transaction, error: null };
    } catch (error) {
      console.error(`Erro ao buscar transação com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Cria uma nova transação
   * @param entity Dados da transação
   */
  async create(entity: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const transactions = stored ? JSON.parse(stored) : [];
      
      // Gerar ID único
      const id = Math.random().toString(36).substring(2, 9);
      
      // Criar nova transação
      const newTransaction: Transaction = {
        ...entity,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Adicionar à lista
      transactions.push(newTransaction);
      localStorage.setItem(this.storageKey, JSON.stringify(transactions));
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { data: newTransaction, error: null };
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Atualiza uma transação existente
   * @param id ID da transação
   * @param entity Dados para atualização
   */
  async update(id: string, entity: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const transactions = stored ? JSON.parse(stored) : [];
      
      // Encontrar índice da transação
      const index = transactions.findIndex((t: Transaction) => t.id === id);
      
      if (index === -1) {
        return { data: null, error: new Error(`Transação com ID ${id} não encontrada`) };
      }
      
      // Atualizar transação
      const updatedTransaction = {
        ...transactions[index],
        ...entity,
        updated_at: new Date().toISOString()
      };
      
      transactions[index] = updatedTransaction;
      localStorage.setItem(this.storageKey, JSON.stringify(transactions));
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { data: updatedTransaction, error: null };
    } catch (error) {
      console.error(`Erro ao atualizar transação com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Remove uma transação
   * @param id ID da transação
   */
  async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const transactions = stored ? JSON.parse(stored) : [];
      
      // Filtrar transação
      const newTransactions = transactions.filter((t: Transaction) => t.id !== id);
      
      if (newTransactions.length === transactions.length) {
        return { success: false, error: new Error(`Transação com ID ${id} não encontrada`) };
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(newTransactions));
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro ao excluir transação com ID ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  /**
   * Busca transações por intervalo de datas
   * @param startDate Data inicial
   * @param endDate Data final
   */
  async getByDateRange(startDate: string, endDate: string): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const transactions = stored ? JSON.parse(stored) : [];
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filteredTransactions = transactions.filter((t: Transaction) => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { data: filteredTransactions, error: null };
    } catch (error) {
      console.error('Erro ao buscar transações por intervalo de datas:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca transações por tipo
   * @param type Tipo da transação
   */
  async getByType(type: 'receita' | 'despesa'): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const transactions = stored ? JSON.parse(stored) : [];
      
      const filteredTransactions = transactions.filter((t: Transaction) => t.type === type);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { data: filteredTransactions, error: null };
    } catch (error) {
      console.error(`Erro ao buscar transações do tipo ${type}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca transações por categoria
   * @param categoryId ID da categoria
   */
  async getByCategory(categoryId: string): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const transactions = stored ? JSON.parse(stored) : [];
      
      const filteredTransactions = transactions.filter((t: Transaction) => t.categoryId === categoryId);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { data: filteredTransactions, error: null };
    } catch (error) {
      console.error(`Erro ao buscar transações da categoria ${categoryId}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Obtém um resumo financeiro para um período específico
   * @param period Período (mês ou ano)
   */
  async getFinancialSummary(period: 'month' | 'year'): Promise<{
    receitas: number;
    despesas: number;
    saldo: number;
    transactions: Transaction[];
  }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const allTransactions = stored ? JSON.parse(stored) : [];
      
      const now = new Date();
      let startDate, endDate;
      
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
      }
      
      const filteredTransactions = allTransactions.filter((t: Transaction) => {
        const date = new Date(t.date);
        return date >= startDate && date <= endDate;
      });
      
      const receitas = filteredTransactions
        .filter((t: Transaction) => t.type === 'receita')
        .reduce((sum: number, t: Transaction) => sum + t.value, 0);
      
      const despesas = filteredTransactions
        .filter((t: Transaction) => t.type === 'despesa')
        .reduce((sum: number, t: Transaction) => sum + t.value, 0);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        receitas,
        despesas,
        saldo: receitas - despesas,
        transactions: filteredTransactions
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
} 