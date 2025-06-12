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

describe('Autenticação de Diarista', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve fazer login com credenciais válidas', async () => {
    // Arrange
    const mockAuthService = {
      login: vi.fn().mockResolvedValue({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User'
          },
          token: 'mock-token'
        }
      })
    };

    const mockContainer = {
      get: vi.fn().mockReturnValue(mockAuthService)
    };
    
    (DIContainer.getInstance as any).mockReturnValue(mockContainer);

    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    // Act
    const container = DIContainer.getInstance();
    const authService = container.get('AUTH_SERVICE');
    const result = await authService.login(loginData);

    // Assert
    expect(authService.login).toHaveBeenCalledWith(loginData);
    expect(result.success).toBe(true);
    expect(result.data.user.email).toBe('test@example.com');
    expect(result.data.token).toBe('mock-token');
  });
});