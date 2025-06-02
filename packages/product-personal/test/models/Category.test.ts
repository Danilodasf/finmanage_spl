import { describe, it, expect } from 'vitest';
import { CategorySchema, Category, CreateCategoryData } from '../../src/models/Category';

describe('Category Model', () => {
  it('should validate a valid category with schema', () => {
    const category = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Alimentação',
      type: 'despesa',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = CategorySchema.safeParse(category);
    expect(result.success).toBe(true);
  });

  it('should handle valid category interface', () => {
    const category: Category = {
      id: 'cat-123',
      name: 'Transporte',
      type: 'despesa'
    };

    expect(category.id).toBe('cat-123');
    expect(category.name).toBe('Transporte');
    expect(category.type).toBe('despesa');
  });

  it('should handle CreateCategoryData interface', () => {
    const createData: CreateCategoryData = {
      name: 'Investimentos',
      type: 'investimento'
    };

    expect(createData.name).toBe('Investimentos');
    expect(createData.type).toBe('investimento');
    expect(Object.keys(createData)).not.toContain('id');
  });

  it('should accept all valid category types', () => {
    const category1: Category = {
      id: 'cat-1',
      name: 'Salário',
      type: 'receita'
    };
    
    const category2: Category = {
      id: 'cat-2',
      name: 'Transporte',
      type: 'despesa'
    };
    
    const category3: Category = {
      id: 'cat-3',
      name: 'Misto',
      type: 'ambos'
    };
    
    const category4: Category = {
      id: 'cat-4',
      name: 'Ações',
      type: 'investimento'
    };

    expect(category1.type).toBe('receita');
    expect(category2.type).toBe('despesa');
    expect(category3.type).toBe('ambos');
    expect(category4.type).toBe('investimento');
  });
}); 