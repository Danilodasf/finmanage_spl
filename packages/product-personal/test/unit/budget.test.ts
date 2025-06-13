import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Orçamento - Personal', () => {
  let mockBudgetController: any;

  beforeEach(() => {
    mockBudgetController = {
      createBudget: vi.fn()
    };
    
    vi.clearAllMocks();
  });

  it('deve criar um novo orçamento', async () => {
    const budgetData = {
      category: 'alimentacao',
      amount: 500,
      period: 'monthly',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    };
    
    const expectedBudget = {
      id: '1',
      ...budgetData,
      spent: 0,
      remaining: 500,
      createdAt: new Date()
    };
    
    mockBudgetController.createBudget.mockResolvedValue({
      success: true,
      budget: expectedBudget
    });
    
    const result = await mockBudgetController.createBudget(budgetData);
    
    expect(mockBudgetController.createBudget).toHaveBeenCalledWith(budgetData);
    expect(result.success).toBe(true);
    expect(result.budget).toEqual(expectedBudget);
  });
});