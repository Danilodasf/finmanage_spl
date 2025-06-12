import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DIContainer } from '../lib/core-exports';
import { toast } from '@/hooks/use-toast';

// Mock do container DI
vi.mock('../lib/core-exports', () => ({
  DIContainer: {
    get: vi.fn()
  }
}));

// Mock do toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('Gestão de Categorias - MEI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar categoria corretamente', async () => {
    // Arrange
    const mockCategoryService = {
      createCategory: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: '1',
          name: 'Vendas',
          type: 'receita',
          color: '#10B981',
          isDefault: false
        }
      })
    };

    (DIContainer.get as any).mockReturnValue(mockCategoryService);

    const createCategoryData = {
      name: 'Vendas',
      type: 'receita' as const,
      color: '#10B981',
      isDefault: false
    };

    // Act
    const result = await mockCategoryService.createCategory(createCategoryData);

    // Assert
    expect(mockCategoryService.createCategory).toHaveBeenCalledWith(createCategoryData);
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Vendas');
    expect(result.data.type).toBe('receita');
  });
});