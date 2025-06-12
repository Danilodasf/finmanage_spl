
/**
 * Interface que representa uma transação financeira no sistema
 * 
 * Uma transação é um registro de movimentação financeira que pode ser
 * uma receita (entrada de dinheiro) ou uma despesa (saída de dinheiro)
 */
export interface Transaction {
  /** Identificador único da transação */
  id: string;
  
  /** Tipo da transação: 'receita' (entrada) ou 'despesa' (saída) */
  type: 'receita' | 'despesa';
  
  /** Data em que a transação ocorreu */
  date: Date;
  
  /** Valor monetário da transação */
  value: number;
  
  /** Descrição ou motivo da transação */
  description: string;
  
  /** Identificador da categoria à qual esta transação pertence */
  categoryId: string;
}

/**
 * Interface para dados necessários na criação de uma nova transação
 * 
 * Contém todos os campos da transação exceto o ID, que será gerado
 * automaticamente pelo sistema durante a criação
 */
export interface CreateTransactionData {
  /** Tipo da transação: 'receita' (entrada) ou 'despesa' (saída) */
  type: 'receita' | 'despesa';
  
  /** Data em que a transação ocorreu */
  date: Date;
  
  /** Valor monetário da transação */
  value: number;
  
  /** Descrição ou motivo da transação */
  description: string;
  
  /** Identificador da categoria à qual esta transação pertence */
  categoryId: string;
}
