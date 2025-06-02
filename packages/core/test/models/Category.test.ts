import { describe, it, expect } from 'vitest';
import { Category } from '../../src/models/Category';

describe('Category Model', () => {
  it('should validate a valid Category object', () => {
    const category: Category = {
      id: 'cat-123',
      name: 'Alimentação',
      type: 'despesa'
    };

    expect(category).toHaveProperty('id');
    expect(category).toHaveProperty('name', 'Alimentação');
    expect(category).toHaveProperty('type', 'despesa');
  });

  it('should accept valid category types', () => {
    const category1: Category = {
      id: 'cat-123',
      name: 'Salário',
      type: 'receita'
    };

    const category2: Category = {
      id: 'cat-456',
      name: 'Transporte',
      type: 'despesa'
    };

    expect(category1.type).toBe('receita');
    expect(category2.type).toBe('despesa');
  });
}); 