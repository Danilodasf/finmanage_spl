export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'receita' | 'despesa' | 'ambos';
  color?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryData {
  name: string;
  type: 'receita' | 'despesa' | 'ambos';
  color?: string;
}
