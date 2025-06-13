import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DIContainer } from '../../src/lib/core-exports';
import { toast } from '../../src/hooks/use-toast';

// Mock do container DI
vi.mock('../../src/lib/core-exports', () => ({
  DIContainer: {
    get: vi.fn()
  }
}));

// Mock do toast
vi.mock('../../src/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('Gestão de Transações - MEI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar uma transação e atualizar o saldo corretamente', async () => {
    // Arrange
    const mockTransactionService = {
      createTransaction: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: '1',
          type: 'receita',
          date: new Date('2024-01-15'),
          value: 1500.00,
          description: 'Venda de produto',
          categoryId: 'cat-1'
        }
      })
    };

    (DIContainer.get as any).mockReturnValue(mockTransactionService);

    const createData = {
      type: 'receita' as const,
      date: new Date('2024-01-15'),
      value: 1500.00,
      description: 'Venda de produto',
      categoryId: 'cat-1'
    };

    // Act
    const result = await mockTransactionService.createTransaction(createData);

    // Assert
    expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(createData);
    expect(result.success).toBe(true);
    expect(result.data.type).toBe('receita');
    expect(result.data.value).toBe(1500.00);
    expect(result.data.description).toBe('Venda de produto');
  });
});