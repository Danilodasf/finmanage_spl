import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DIContainer } from '../src/lib/core/di';
import { toast } from '@/hooks/use-toast';

// Mock do container DI
vi.mock('../src/lib/core/di', () => ({
  DIContainer: {
    getInstance: vi.fn(() => ({
      get: vi.fn()
    }))
  }
}));

// Mock do toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('Gestão de Gastos - Diarista', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar gasto com dados válidos', async () => {
    // Arrange
    const mockGastoService = {
      createGasto: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: '1',
          description: 'Material de limpeza',
          amount: 50.00,
          date: new Date('2024-01-15'),
          category: 'materiais'
        }
      })
    };

    const mockContainer = {
      get: vi.fn().mockReturnValue(mockGastoService)
    };
    
    (DIContainer.getInstance as any).mockReturnValue(mockContainer);

    const gastoData = {
      description: 'Material de limpeza',
      amount: 50.00,
      date: new Date('2024-01-15'),
      category: 'materiais'
    };

    // Act
    const container = DIContainer.getInstance();
    const gastoService = container.get('GASTO_SERVICE');
    const result = await gastoService.createGasto(gastoData);

    // Assert
    expect(gastoService.createGasto).toHaveBeenCalledWith(gastoData);
    expect(result.success).toBe(true);
    expect(result.data.description).toBe('Material de limpeza');
    expect(result.data.amount).toBe(50.00);
  });
});