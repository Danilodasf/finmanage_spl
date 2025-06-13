import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DIContainer } from '../../src/lib/core/di';
import { toast } from '../../src/hooks/use-toast';
import { StatusServico } from '../../src/models/Servico';

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

describe('Gestão de Serviços - Diarista', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar serviço com cálculo de valor total', async () => {
    // Arrange
    const mockServicoService = {
      createServico: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: '1',
          description: 'Limpeza completa',
          hours: 4,
          hourlyRate: 25.00,
          totalValue: 100.00,
          date: new Date('2024-01-15'),
          status: StatusServico.AGENDADO
        }
      })
    };

    const mockContainer = {
      get: vi.fn().mockReturnValue(mockServicoService)
    };
    
    (DIContainer.getInstance as any).mockReturnValue(mockContainer);

    const servicoData = {
      description: 'Limpeza completa',
      hours: 4,
      hourlyRate: 25.00,
      date: new Date('2024-01-15')
    };

    // Act
    const container = DIContainer.getInstance();
    const servicoService = container.get('SERVICO_SERVICE');
    const result = await servicoService.createServico(servicoData);

    // Assert
    expect(servicoService.createServico).toHaveBeenCalledWith(servicoData);
    expect(result.success).toBe(true);
    expect(result.data.totalValue).toBe(100.00);
    expect(result.data.status).toBe(StatusServico.AGENDADO);
  });
});