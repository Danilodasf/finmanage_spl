import { BaseEntityService } from './base';

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