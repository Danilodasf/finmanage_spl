/**
 * Hook para gerenciar autenticação usando injeção de dependências
 * Fornece estado e operações para autenticação de diaristas
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { DIAuthController } from '../controllers/DIAuthController';
import { DiaristaUser } from '../services/DiaristaAuthService';

interface UseAuthState {
  user: DiaristaUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  profileStats: {
    profileCompleteness: number;
    missingFields: string[];
    hasSpecialties: boolean;
    hasAvailability: boolean;
    hasContactInfo: boolean;
  } | null;
}

interface UseAuthActions {
  // Operações de autenticação
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, createDefaultCategories?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  
  // Operações de perfil
  updateProfile: (profileData: {
    name?: string;
    phone?: string;
    address?: string;
    specialties?: string[];
    hourly_rate?: number;
    availability?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  updateRating: (newRating: number) => Promise<{ success: boolean; error?: string }>;
  
  // Utilitários
  refreshUser: () => Promise<void>;
  refreshProfileStats: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

interface UseAuthReturn extends UseAuthState, UseAuthActions {}

// Context para compartilhar estado de autenticação
interface AuthContextType extends UseAuthReturn {}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    isAuthenticated: false,
    loading: true, // Inicia como true para verificar autenticação
    error: null,
    profileStats: null
  });

  // Removido controller - agora usando métodos estáticos

  // Função para atualizar estado
  const updateState = useCallback((updates: Partial<UseAuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Verifica autenticação atual
  const checkAuth = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await DIAuthController.isAuthenticated();
      
      updateState({
        user: result.user,
        isAuthenticated: result.isAuthenticated,
        loading: false
      });
      
      // Se autenticado, carrega estatísticas do perfil
      if (result.isAuthenticated && result.user) {
        await refreshProfileStats();
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      updateState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Erro ao verificar autenticação'
      });
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await DIAuthController.login(email, password);
      
      if (result.success && result.user) {
        updateState({
          user: result.user,
          isAuthenticated: true,
          loading: false
        });
        
        // Carrega estatísticas do perfil após login
        await refreshProfileStats();
        
        return { success: true };
      } else {
        updateState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: result.error || 'Erro ao fazer login'
        });
        
        return {
          success: false,
          error: result.error || 'Erro ao fazer login'
        };
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      const errorMessage = 'Erro interno ao fazer login';
      updateState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Registro
  const register = useCallback(async (email: string, password: string, name: string, createDefaultCategories = true) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await DIAuthController.register(email, password, name, createDefaultCategories);
      
      if (result.success) {
        // NÃO definir como autenticado após registro
        // O usuário deve fazer login separadamente
        updateState({
          user: null,
          isAuthenticated: false,
          loading: false
        });
        
        return { success: true };
      } else {
        updateState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: result.error || 'Erro ao criar conta'
        });
        
        return {
          success: false,
          error: result.error || 'Erro ao criar conta'
        };
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      const errorMessage = 'Erro interno ao criar conta';
      updateState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await DIAuthController.logout();
      
      // Limpa TODOS os dados do localStorage relacionados à autenticação
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('auth_token');
      
      updateState({
        user: null,
        isAuthenticated: false,
        loading: false,
        profileStats: null
      });
      
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      const errorMessage = 'Erro interno ao fazer logout';
      
      // Limpa o localStorage mesmo em caso de erro
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('auth_token');
      
      updateState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage,
        profileStats: null
      });
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Atualizar perfil
  const updateProfile = useCallback(async (profileData: {
    name?: string;
    phone?: string;
    address?: string;
    specialties?: string[];
    hourly_rate?: number;
    availability?: string[];
  }) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.updateProfile(profileData);
      
      if (result.success && result.user) {
        updateState({
          user: result.user,
          loading: false
        });
        
        // Recarrega o usuário atual após atualizar perfil
        await refreshUser();
        await refreshProfileStats();
        
        return { success: true };
      } else {
        updateState({
          loading: false,
          error: result.error || 'Erro ao atualizar perfil'
        });
        
        return {
          success: false,
          error: result.error || 'Erro ao atualizar perfil'
        };
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      const errorMessage = 'Erro interno ao atualizar perfil';
      updateState({
        loading: false,
        error: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Atualizar avaliação
  const updateRating = useCallback(async (newRating: number) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.updateRating(newRating);
      
      if (result.success && result.user) {
        updateState({
          user: result.user,
          loading: false
        });
        
        // Recarrega o usuário atual após atualizar avaliação
        await refreshUser();
        
        return { success: true };
      } else {
        updateState({
          loading: false,
          error: result.error || 'Erro ao atualizar avaliação'
        });
        
        return {
          success: false,
          error: result.error || 'Erro ao atualizar avaliação'
        };
      }
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      const errorMessage = 'Erro interno ao atualizar avaliação';
      updateState({
        loading: false,
        error: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Recarregar dados do usuário
  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const result = await DIAuthController.getCurrentUser();
      
      if (result.success && result.user) {
        updateState({ user: result.user });
      }
    } catch (error) {
      console.error('Erro ao recarregar usuário:', error);
      updateState({ error: 'Erro ao recarregar dados do usuário' });
    }
  }, [state.isAuthenticated]);

  // Carrega estatísticas do perfil
  const refreshProfileStats = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const result = await DIAuthController.getProfileStats();
      
      if (result.success) {
        updateState({ profileStats: result.stats });
      } else {
        console.warn('Erro ao carregar estatísticas do perfil:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas do perfil:', error);
    }
  }, [state.isAuthenticated]);

  // Recarregar estatísticas do perfil
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, []);

  // Verifica autenticação na inicialização APENAS uma vez
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      if (mounted) {
        await checkAuth();
      }
    };
    
    initAuth();
    
    return () => {
      mounted = false;
    };
  }, []); // Array vazio para executar apenas uma vez

  return {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    profileStats: state.profileStats,
    
    // Ações
    login,
    register,
    logout,
    updateProfile,
    updateRating,
    refreshUser,
    refreshProfileStats,
    clearError,
    checkAuth
  };
}

// Provider para contexto de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

// Hook para validação de dados de perfil
export function useProfileValidation() {
  // Removido controller - agora usando métodos estáticos
  
  const validateProfile = useCallback((profileData: {
    name?: string;
    phone?: string;
    address?: string;
    specialties?: string[];
    hourly_rate?: number;
    availability?: string[];
  }) => {
    return DIAuthController.validateProfileData(profileData);
  }, []);
  
  return { validateProfile };
}

// Hook para verificar se o usuário está autenticado (simples)
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
}

// Hook para obter apenas o usuário atual
export function useCurrentUser(): DiaristaUser | null {
  const { user } = useAuthContext();
  return user;
}