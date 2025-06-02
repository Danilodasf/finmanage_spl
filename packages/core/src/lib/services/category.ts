import { BaseEntityService } from './base';

/**
 * Interface para representar uma categoria
 */
export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa' | 'ambos' | 'investimento';
  color?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para o serviço de categorias
 */
export interface CategoryService extends BaseEntityService<Category> {
  /**
   * Busca categorias por tipo
   * @param type Tipo da categoria
   */
  getByType(type: 'receita' | 'despesa' | 'ambos' | 'investimento'): Promise<{ data: Category[] | null; error: Error | null }>;
} 