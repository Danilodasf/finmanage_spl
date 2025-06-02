import { describe, it, expect } from 'vitest';
import { 
  InvestmentSchema, 
  createInvestment, 
  updateInvestment,
  createInvestmentReturn
} from '../../src/models/Investment';

describe('Investment Model', () => {
  it('should validate a valid investment object with schema', () => {
    const investment = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Tesouro Direto',
      amount: 1000,
      categoryId: 'cat-123',
      description: 'Investimento em tesouro direto',
      totalReturns: 50,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = InvestmentSchema.safeParse(investment);
    expect(result.success).toBe(true);
  });

  it('should create a new investment with correct defaults', () => {
    const input = {
      name: 'Poupança',
      amount: 500,
      categoryId: 'cat-456',
      description: 'Poupança bancária'
    };

    const investment = createInvestment(input);

    expect(investment.id).toBeDefined();
    expect(investment.name).toBe('Poupança');
    expect(investment.amount).toBe(500);
    expect(investment.categoryId).toBe('cat-456');
    expect(investment.description).toBe('Poupança bancária');
    expect(investment.totalReturns).toBe(0);
    expect(investment.createdAt).toBeInstanceOf(Date);
    expect(investment.updatedAt).toBeInstanceOf(Date);
  });

  it('should update an existing investment correctly', () => {
    const originalInvestment = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Tesouro Direto',
      amount: 1000,
      categoryId: 'cat-123',
      description: 'Investimento em tesouro direto',
      totalReturns: 50,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    };

    const updates = {
      name: 'Tesouro Selic',
      amount: 1200
    };

    const updatedInvestment = updateInvestment(originalInvestment, updates);

    expect(updatedInvestment.id).toBe(originalInvestment.id);
    expect(updatedInvestment.name).toBe('Tesouro Selic');
    expect(updatedInvestment.amount).toBe(1200);
    expect(updatedInvestment.categoryId).toBe('cat-123');
    expect(updatedInvestment.description).toBe('Investimento em tesouro direto');
    expect(updatedInvestment.totalReturns).toBe(50);
    expect(updatedInvestment.createdAt).toEqual(originalInvestment.createdAt);
    expect(updatedInvestment.updatedAt).not.toEqual(originalInvestment.updatedAt);
  });

  it('should create an investment return correctly', () => {
    const input = {
      investmentId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 25.50,
      date: '2023-05-15'
    };

    const investmentReturn = createInvestmentReturn(input);

    expect(investmentReturn.id).toBeDefined();
    expect(investmentReturn.investmentId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(investmentReturn.amount).toBe(25.50);
    expect(investmentReturn.date).toBe('2023-05-15');
    expect(investmentReturn.createdAt).toBeInstanceOf(Date);
  });
}); 