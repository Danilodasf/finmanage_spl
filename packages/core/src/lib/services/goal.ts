import { BaseEntityService } from './base';

/**
 * Interface para representar uma meta financeira
 */
export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category_id?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para o serviço de metas
 */
export interface GoalService extends BaseEntityService<Goal> {
  /**
   * Atualiza o valor atual de uma meta
   * @param id ID da meta
   * @param amount Novo valor atual
   */
  updateCurrentAmount(id: string, amount: number): Promise<{ data: Goal | null; error: Error | null }>;
  
  /**
   * Calcula o progresso de uma meta
   * @param id ID da meta
   */
  calculateProgress(id: string): Promise<{ 
    progress: number; 
    remaining: number; 
    isCompleted: boolean; 
    error: Error | null 
  }>;
  
  /**
   * Busca metas por status de conclusão
   * @param completed Status de conclusão
   */
  getByCompletionStatus(completed: boolean): Promise<{ data: Goal[] | null; error: Error | null }>;
} 