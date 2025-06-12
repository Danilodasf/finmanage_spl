import { describe, it, expect } from 'vitest';
import { Category } from '../../src/models/Category';

describe('Category Model - Core', () => {
  it('deve validar um objeto Category válido', () => {
    const category: Category = {
      id: 'cat-123',
      name: 'Alimentação',
      type: 'despesa'
    };

    expect(category).toHaveProperty('id');
    expect(category).toHaveProperty('name', 'Alimentação');
    expect(category).toHaveProperty('type', 'despesa');
  });
});