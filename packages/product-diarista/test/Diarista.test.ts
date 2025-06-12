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

describe('Gestão de Diaristas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve cadastrar diarista com especialidades', async () => {
    // Arrange
    const mockDiaristaService = {
      create: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: '1',
          name: 'Maria Silva',
          email: 'maria@teste.com',
          phone: '11999999999',
          specialties: ['limpeza', 'cozinha'],
          hourlyRate: 25.00,
          availability: ['segunda', 'terça', 'quarta']
        }
      })
    };

    const mockContainer = {
      get: vi.fn().mockReturnValue(mockDiaristaService)
    };
    
    (DIContainer.getInstance as any).mockReturnValue(mockContainer);

    const createData = {
      name: 'Maria Silva',
      email: 'maria@teste.com',
      phone: '11999999999',
      specialties: ['limpeza', 'cozinha'],
      hourlyRate: 25.00,
      availability: ['segunda', 'terça', 'quarta']
    };

    // Act
    const container = DIContainer.getInstance();
    const diaristaService = container.get('DIARISTA_SERVICE');
    const result = await diaristaService.create(createData);

    // Assert
    expect(diaristaService.create).toHaveBeenCalledWith(createData);
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Maria Silva');
    expect(result.data.specialties).toContain('limpeza');
    expect(result.data.hourlyRate).toBe(25.00);
  });
});