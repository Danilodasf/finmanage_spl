
export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa' | 'ambos';
}

export interface CreateCategoryData {
  name: string;
  type: 'receita' | 'despesa' | 'ambos';
}
