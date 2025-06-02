export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PIX = 'pix'
}

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

// Simulação de repositório em memória
class TransactionRepository {
  private transactions: Transaction[] = [];

  public findAll(): Transaction[] {
    return this.transactions;
  }

  public findById(id: string): Transaction | undefined {
    return this.transactions.find(transaction => transaction.id === id);
  }

  public create(transaction: Omit<Transaction, 'id'>): Transaction {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substring(2, 9)
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  public update(id: string, transactionData: Partial<Transaction>): Transaction | undefined {
    const index = this.transactions.findIndex(transaction => transaction.id === id);
    if (index === -1) return undefined;
    
    this.transactions[index] = { ...this.transactions[index], ...transactionData };
    return this.transactions[index];
  }

  public delete(id: string): boolean {
    const index = this.transactions.findIndex(transaction => transaction.id === id);
    if (index === -1) return false;
    
    this.transactions.splice(index, 1);
    return true;
  }
}

export const transactionRepository = new TransactionRepository(); 