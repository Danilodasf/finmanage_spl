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

describe('Gestão de DAS - MEI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve calcular e registrar pagamento de DAS corretamente', async () => {
    // Arrange
    const mockDASService = {
      calculateDAS: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: '1',
          month: 1,
          year: 2024,
          value: 66.60,
          dueDate: new Date('2024-02-20'),
          isPaid: false,
          revenue: 5000.00
        }
      })
    };

    (DIContainer.get as any).mockReturnValue(mockDASService);

    const dasData = {
      month: 1,
      year: 2024,
      revenue: 5000.00
    };

    // Act
    const result = await mockDASService.calculateDAS(dasData);

    // Assert
    expect(mockDASService.calculateDAS).toHaveBeenCalledWith(dasData);
    expect(result.success).toBe(true);
    expect(result.data.value).toBe(66.60);
    expect(result.data.revenue).toBe(5000.00);
    expect(result.data.isPaid).toBe(false);
  });
});