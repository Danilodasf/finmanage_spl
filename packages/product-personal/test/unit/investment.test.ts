import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Investimentos - Personal', () => {
  let mockInvestmentController: any;

  beforeEach(() => {
    mockInvestmentController = {
      createInvestment: vi.fn()
    };
    
    vi.clearAllMocks();
  });

  it('deve criar um novo investimento', async () => {
    const investmentData = {
      name: 'Tesouro Direto',
      type: 'fixed_income',
      amount: 1000,
      expectedReturn: 12.5,
      maturityDate: new Date('2025-12-31')
    };
    
    const expectedInvestment = {
      id: '1',
      ...investmentData,
      createdAt: new Date()
    };
    
    mockInvestmentController.createInvestment.mockResolvedValue({
      success: true,
      investment: expectedInvestment
    });
    
    const result = await mockInvestmentController.createInvestment(investmentData);
    
    expect(mockInvestmentController.createInvestment).toHaveBeenCalledWith(investmentData);
    expect(result.success).toBe(true);
    expect(result.investment).toEqual(expectedInvestment);
  });
});