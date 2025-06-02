import { BaseEntityService } from './base';

/**
 * Interface para representar um orçamento
 */
export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  spent: number;
  category_id?: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para o serviço de orçamentos
 */
export interface BudgetService extends BaseEntityService<Budget> {
  /**
   * Busca orçamentos por período
   * @param startDate Data inicial
   * @param endDate Data final
   */
  getByDateRange(startDate: string, endDate: string): Promise<{ data: Budget[] | null; error: Error | null }>;
  
  /**
   * Atualiza o valor gasto de um orçamento
   * @param id ID do orçamento
   * @param amount Valor gasto
   */
  updateSpent(id: string, amount: number): Promise<{ data: Budget | null; error: Error | null }>;
  
  /**
   * Verifica se um orçamento está dentro do limite
   * @param id ID do orçamento
   */
  isWithinLimit(id: string): Promise<{ withinLimit: boolean; remaining: number; error: Error | null }>;
} 