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
 * Interface para o serviço de autenticação
 */
export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  logout(): Promise<AuthResult>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(name: string): Promise<AuthResult>;
  updatePassword(currentPassword: string, newPassword: string): Promise<AuthResult>;
  isAuthenticated(): Promise<boolean>;
}

/**
 * Implementação do serviço de autenticação usando Supabase
 */
export class SupabaseAuthService implements AuthService {
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

      // Buscar os dados adicionais do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        // Se não conseguir buscar os dados adicionais, ainda considera o login como sucesso
        // mas retorna apenas os dados básicos
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || '',
            createdAt: new Date(data.user.created_at),
          },
        };
      }

      return {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          createdAt: new Date(userData.created_at),
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

      // Criar o registro do usuário na tabela users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
        });

      if (userError) {
        return {
          success: false,
          error: {
            message: userError.message,
            code: userError.code,
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
   * Obtém o usuário atual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return null;
      }

      // Buscar os dados adicionais do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        // Se não conseguir buscar os dados adicionais, retorna os dados básicos
        return {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || '',
          createdAt: new Date(data.user.created_at),
        };
      }

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        createdAt: new Date(userData.created_at),
      };
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  /**
   * Atualiza o perfil do usuário
   * @param name Novo nome do usuário
   */
  async updateProfile(name: string): Promise<AuthResult> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        return {
          success: false,
          error: {
            message: 'Usuário não autenticado',
          },
        };
      }

      // Atualizar os metadados do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name },
      });

      if (updateError) {
        return {
          success: false,
          error: {
            message: updateError.message,
            code: updateError.code,
          },
        };
      }

      // Atualizar o registro na tabela users
      const { error: dbError } = await supabase
        .from('users')
        .update({ name })
        .eq('id', userData.user.id);

      if (dbError) {
        return {
          success: false,
          error: {
            message: dbError.message,
            code: dbError.code,
          },
        };
      }

      return {
        success: true,
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
      // Primeiro verificamos as credenciais do usuário
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        return {
          success: false,
          error: {
            message: 'Usuário não autenticado',
          },
        };
      }

      // Para atualizar a senha, primeiro verificamos a senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email || '',
        password: currentPassword,
      });

      if (signInError) {
        return {
          success: false,
          error: {
            message: 'Senha atual incorreta',
            code: signInError.code,
          },
        };
      }

      // Atualizar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return {
          success: false,
          error: {
            message: updateError.message,
            code: updateError.code,
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
} 