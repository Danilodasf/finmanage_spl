export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  date: Date;
  value: number;
  description: string;
  categoryId: string;
}

export interface CreateTransactionData {
  type: 'receita' | 'despesa';
  date: Date;
  value: number;
  description: string;
  categoryId: string;
} 