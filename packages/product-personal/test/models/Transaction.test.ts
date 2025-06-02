import { describe, it, expect } from 'vitest';
import { 
  Transaction, 
  CreateTransactionData, 
  transactionRepository,
  TransactionType,
  PaymentMethod
} from '../../src/models/Transaction';

describe('Transaction Model', () => {
  it('should have correct transaction type enum values', () => {
    expect(TransactionType.INCOME).toBe('income');
    expect(TransactionType.EXPENSE).toBe('expense');
  });

  it('should have correct payment method enum values', () => {
    expect(PaymentMethod.CASH).toBe('cash');
    expect(PaymentMethod.CREDIT_CARD).toBe('credit_card');
    expect(PaymentMethod.DEBIT_CARD).toBe('debit_card');
    expect(PaymentMethod.BANK_TRANSFER).toBe('bank_transfer');
    expect(PaymentMethod.PIX).toBe('pix');
  });

  it('should handle Transaction interface', () => {
    const transaction: Transaction = {
      id: 'txn-123',
      type: 'receita',
      date: new Date('2023-01-15'),
      value: 100.50,
      description: 'Salário',
      categoryId: 'cat-123'
    };

    expect(transaction.id).toBe('txn-123');
    expect(transaction.type).toBe('receita');
    expect(transaction.date).toBeInstanceOf(Date);
    expect(transaction.value).toBe(100.50);
    expect(transaction.description).toBe('Salário');
    expect(transaction.categoryId).toBe('cat-123');
  });

  it('should handle CreateTransactionData interface', () => {
    const createData: CreateTransactionData = {
      type: 'despesa',
      date: new Date('2023-02-10'),
      value: 50.75,
      description: 'Supermercado',
      categoryId: 'cat-456'
    };

    expect(createData.type).toBe('despesa');
    expect(createData.date).toBeInstanceOf(Date);
    expect(createData.value).toBe(50.75);
    expect(createData.description).toBe('Supermercado');
    expect(createData.categoryId).toBe('cat-456');
    expect(Object.keys(createData)).not.toContain('id');
  });

  it('should handle repository operations correctly', () => {
    // Create
    const newTransaction = transactionRepository.create({
      type: 'despesa',
      date: new Date('2023-03-01'),
      value: 200,
      description: 'Aluguel',
      categoryId: 'cat-789'
    });

    expect(newTransaction.id).toBeDefined();
    expect(newTransaction.description).toBe('Aluguel');

    // Read
    const allTransactions = transactionRepository.findAll();
    expect(allTransactions.length).toBeGreaterThan(0);

    const found = transactionRepository.findById(newTransaction.id);
    expect(found).toBeDefined();
    expect(found?.description).toBe('Aluguel');

    // Update
    const updated = transactionRepository.update(newTransaction.id, { value: 220 });
    expect(updated).toBeDefined();
    expect(updated?.value).toBe(220);

    // Delete
    const deleted = transactionRepository.delete(newTransaction.id);
    expect(deleted).toBe(true);

    const notFound = transactionRepository.findById(newTransaction.id);
    expect(notFound).toBeUndefined();
  });
}); 