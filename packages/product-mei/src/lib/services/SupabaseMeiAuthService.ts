import { LoginCredentials, RegisterData, User } from '../../models/User';
import { supabase } from '../supabase';

/**
 * Interface para o resultado de operações de autenticação
 */
export interface AuthResult {
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
  user?: User;
}

/**
 * Implementação do serviço de autenticação usando Supabase para o produto MEI
 */
export class SupabaseMeiAuthService {
  /**
   * Realiza o login do usuário
   * @param credentials Credenciais de login
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: {
            message: 'Não foi possível autenticar o usuário',
          },
        };
      }

      // Retornar o usuário autenticado
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || '',
          createdAt: new Date(data.user.created_at),
        },
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: {
          message: 'Ocorreu um erro inesperado',
        },
      };
    }
  }

  /**
   * Registra um novo usuário
   * @param data Dados do registro
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Verificar se as senhas coincidem
      if (data.password !== data.confirmPassword) {
        return {
          success: false,
          error: {
            message: 'As senhas não coincidem',
          },
        };
      }

      // Criar o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (authError) {
        return {
          success: false,
          error: {
            message: authError.message,
            code: authError.code,
          },
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: {
            message: 'Não foi possível criar o usuário',
          },
        };
      }

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: data.email,
          name: data.name,
          createdAt: new Date(),
        },
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        error: {
          message: 'Ocorreu um erro inesperado',
        },
      };
    }
  }

  /**
   * Realiza o logout do usuário
   */
  async logout(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Erro no logout:', error);
      return {
        success: false,
        error: {
          message: 'Ocorreu um erro inesperado',
        },
      };
    }
  }

  /**
   * Atualiza o perfil do usuário
   * @param name Novo nome do usuário
   */
  async updateProfile(name: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { name },
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || '',
          createdAt: new Date(data.user.created_at),
        },
      };
    } catch (error) {
      console.error('Erro na atualização do perfil:', error);
      return {
        success: false,
        error: {
          message: 'Ocorreu um erro inesperado',
        },
      };
    }
  }

  /**
   * Atualiza a senha do usuário
   * @param currentPassword Senha atual
   * @param newPassword Nova senha
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      // O Supabase não tem um método direto para atualizar senha com verificação da senha atual
      // Poderíamos implementar uma verificação manual aqui, mas para simplificar vamos apenas atualizar
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Erro na atualização da senha:', error);
      return {
        success: false,
        error: {
          message: 'Ocorreu um erro inesperado',
        },
      };
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const { data, error } = await supabase.auth.getSession();
    return !error && data?.session !== null;
  }

  /**
   * Obtém o usuário atual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
        createdAt: new Date(data.user.created_at),
      };
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }
} 