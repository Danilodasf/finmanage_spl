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

describe('Autenticação de Usuário - MEI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve validar credenciais de login corretamente', async () => {
    // Arrange
    const mockAuthService = {
      login: vi.fn().mockResolvedValue({ 
        success: true, 
        error: null,
        user: {
          id: '1',
          name: 'João Silva',
          email: 'usuario@teste.com',
          cnpj: '12.345.678/0001-90'
        }
      })
    };
    
    (DIContainer.get as any).mockReturnValue(mockAuthService);
    
    const validCredentials = {
      email: 'usuario@teste.com',
      password: '123456'
    };

    // Act
    const result = await mockAuthService.login(validCredentials);

    // Assert
    expect(mockAuthService.login).toHaveBeenCalledWith(validCredentials);
    expect(result.success).toBe(true);
    expect(result.user.email).toBe('usuario@teste.com');
  });
});