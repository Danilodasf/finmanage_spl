import { BaseEntityService } from './base';

/**
 * Interface para representar um investimento
 */
export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: string;
  amount: number;
  initial_amount: number;
  start_date: string;
  end_date?: string;
  interest_rate?: number;
  category_id?: string;
  description?: string;
  status: 'ativo' | 'resgatado' | 'vencido';
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para o serviço de investimentos
 */
export interface InvestmentService extends BaseEntityService<Investment> {
  /**
   * Busca investimentos por tipo
   * @param type Tipo de investimento
   */
  getByType(type: string): Promise<{ data: Investment[] | null; error: Error | null }>;
  
  /**
   * Busca investimentos por status
   * @param status Status do investimento
   */
  getByStatus(status: 'ativo' | 'resgatado' | 'vencido'): Promise<{ data: Investment[] | null; error: Error | null }>;
  
  /**
   * Calcula o rendimento de um investimento
   * @param id ID do investimento
   */
  calculateReturn(id: string): Promise<{ 
    currentValue: number; 
    profit: number; 
    profitPercentage: number; 
    error: Error | null 
  }>;
  
  /**
   * Registra o resgate de um investimento
   * @param id ID do investimento
   * @param amount Valor resgatado
   */
  registerWithdrawal(id: string, amount: number): Promise<{ data: Investment | null; error: Error | null }>;
} 