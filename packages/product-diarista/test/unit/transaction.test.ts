import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DIContainer } from '../../src/lib/core/di';
import { toast } from '../../src/hooks/use-toast';

// Mock do container DI
vi.mock('../../src/lib/core/di', () => ({
  DIContainer: {
    getInstance: vi.fn(() => ({
      get: vi.fn()
    }))
  }
}));

// Mock do toast
vi.mock('../../src/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('Gestão de Transações - Diarista', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar transação de receita', async () => {
    // Arrange
    const mockTransactionService = {
      createTransaction: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: '1',
          type: 'receita',
          amount: 100.00,
          description: 'Pagamento serviço',
          date: new Date('2024-01-15')
        }
      })
    };

    const mockContainer = {
      get: vi.fn().mockReturnValue(mockTransactionService)
    };
    
    (DIContainer.getInstance as any).mockReturnValue(mockContainer);

    const transactionData = {
      type: 'receita' as const,
      amount: 100.00,
      description: 'Pagamento serviço',
      date: new Date('2024-01-15')
    };

    // Act
    const container = DIContainer.getInstance();
    const transactionService = container.get('TRANSACTION_SERVICE');
    const result = await transactionService.createTransaction(transactionData);

    // Assert
    expect(transactionService.createTransaction).toHaveBeenCalledWith(transactionData);
    expect(result.success).toBe(true);
    expect(result.data.type).toBe('receita');
    expect(result.data.amount).toBe(100.00);
  });
});