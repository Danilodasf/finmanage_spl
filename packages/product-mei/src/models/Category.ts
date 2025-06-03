// Importar a interface Category do core
import { Category } from '../lib/core-exports';

// Re-exportar a interface Category
export { Category };

export interface CreateCategoryData {
  name: string;
  type: 'receita' | 'despesa' | 'ambos' | 'investimento';
} 