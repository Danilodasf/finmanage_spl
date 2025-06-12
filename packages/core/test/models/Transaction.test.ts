import { describe, it, expect } from 'vitest';
import { Transaction } from '../../src/models/Transaction';

describe('Transaction Model - Core', () => {
  it('deve validar um objeto Transaction válido', () => {
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
});