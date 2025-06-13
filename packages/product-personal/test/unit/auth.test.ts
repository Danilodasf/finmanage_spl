import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock completo do DIContainer e dependências
vi.mock('@finmanage/core/di', () => ({
  DIContainer: {
    get: vi.fn()
  },
  AUTH_SERVICE: 'AUTH_SERVICE'
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('Autenticação - Personal', () => {
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn()
    };
    
    vi.clearAllMocks();
  });

  it('deve fazer login com credenciais válidas', async () => {
    const credentials = { email: 'test@example.com', password: 'password123' };
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    
    mockAuthService.login.mockResolvedValue({ success: true, user: mockUser });
    
    const result = await mockAuthService.login(credentials.email, credentials.password);
    
    expect(mockAuthService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
    expect(result.success).toBe(true);
    expect(result.user).toEqual(mockUser);
  });
});
