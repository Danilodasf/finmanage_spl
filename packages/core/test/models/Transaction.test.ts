import { describe, it, expect } from 'vitest';
import { Transaction, CreateTransactionData } from '../../src/models/Transaction';

describe('Transaction Model', () => {
  it('should validate a valid Transaction object', () => {
    const transaction: Transaction = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'receita',
      date: new Date('2023-01-01'),
      value: 100.50,
      description: 'Salário',
      categoryId: 'cat-123'
    };

    expect(transaction).toHaveProperty('id');
    expect(transaction).toHaveProperty('type', 'receita');
    expect(transaction).toHaveProperty('date');
    expect(transaction).toHaveProperty('value', 100.50);
    expect(transaction).toHaveProperty('description', 'Salário');
    expect(transaction).toHaveProperty('categoryId', 'cat-123');
  });

  it('should validate a valid CreateTransactionData object', () => {
    const createData: CreateTransactionData = {
      type: 'despesa',
      date: new Date('2023-02-15'),
      value: 50.75,
      description: 'Compras supermercado',
      categoryId: 'cat-456'
    };

    expect(createData).toHaveProperty('type', 'despesa');
    expect(createData).toHaveProperty('date');
    expect(createData).toHaveProperty('value', 50.75);
    expect(createData).toHaveProperty('description', 'Compras supermercado');
    expect(createData).toHaveProperty('categoryId', 'cat-456');
    expect(createData).not.toHaveProperty('id');
  });
}); 