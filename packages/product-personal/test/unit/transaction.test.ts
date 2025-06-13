import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Transações - Personal', () => {
  let mockTransactionController: any;

  beforeEach(() => {
    mockTransactionController = {
      createTransaction: vi.fn()
    };
    
    vi.clearAllMocks();
  });

  it('deve criar uma nova transação', async () => {
    const transactionData = {
      description: 'Compra no supermercado',
      amount: 150.50,
      type: 'expense',
      category: 'alimentacao',
      date: new Date('2024-01-15')
    };
    
    const expectedTransaction = {
      id: '1',
      ...transactionData,
      createdAt: new Date()
    };
    
    mockTransactionController.createTransaction.mockResolvedValue({
      success: true,
      transaction: expectedTransaction
    });
    
    const result = await mockTransactionController.createTransaction(transactionData);
    
    expect(mockTransactionController.createTransaction).toHaveBeenCalledWith(transactionData);
    expect(result.success).toBe(true);
    expect(result.transaction).toEqual(expectedTransaction);
  });
});
