import { LoginCredentials, RegisterData, User, AuthService } from '../core-exports';
import { supabase, clearUserCache } from '../supabase';

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
export class SupabaseMeiAuthService implements AuthService {
  /**
   * Converte AuthResult para o formato da interface AuthService
   */
  private convertAuthResult(result: AuthResult): { success: boolean; error: Error | null } {
    return {
      success: result.success,
      error: result.error ? new Error(result.error.message) : null
    };
  }

  /**
   * Realiza o login do usuário (implementação interna)
   * @param credentials Credenciais de login
   */
  private async loginInternal(credentials: LoginCredentials): Promise<AuthResult> {
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
   * Realiza o login do usuário
   * @param credentials Credenciais de login
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error: Error | null }> {
    // Limpar cache antes do login para evitar dados antigos
    clearUserCache();
    
    const result = await this.loginInternal(credentials);
    return this.convertAuthResult(result);
  }

  /**
   * Registra um novo usuário (implementação interna)
   * @param data Dados do registro
   */
  private async registerInternal(data: RegisterData): Promise<AuthResult> {
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
   * Registra um novo usuário
   * @param data Dados do registro
   */
  async register(data: RegisterData): Promise<{ success: boolean; error: Error | null }> {
    // Limpar cache antes do registro para evitar dados antigos
    clearUserCache();
    
    const result = await this.registerInternal(data);
    return this.convertAuthResult(result);
  }

  /**
   * Realiza o logout do usuário (implementação interna)
   */
  private async logoutInternal(): Promise<AuthResult> {
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
   * Realiza o logout do usuário
   */
  async logout(): Promise<{ success: boolean; error: Error | null }> {
    const result = await this.logoutInternal();
    
    // Limpar cache local após logout bem-sucedido
    if (result.success) {
      clearUserCache();
    }
    
    return this.convertAuthResult(result);
  }

  /**
   * Atualiza o perfil do usuário (implementação interna)
   * @param name Novo nome do usuário
   */
  private async updateProfileInternal(name: string): Promise<AuthResult> {
    try {
      // Primeiro, atualizar os metadados do usuário no auth
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

      // Depois, atualizar a tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ first_name: name })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Erro ao atualizar tabela profiles:', profileError);
        return {
          success: false,
          error: {
            message: `Erro ao atualizar perfil: ${profileError.message}`,
            code: profileError.code,
          },
        };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || name,
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
   * Atualiza o perfil do usuário
   * @param name Novo nome do usuário
   */
  async updateProfile(name: string): Promise<{ success: boolean; error: Error | null }> {
    const result = await this.updateProfileInternal(name);
    return this.convertAuthResult(result);
  }

  /**
   * Atualiza a senha do usuário (implementação interna)
   * @param newPassword Nova senha
   * @param currentPassword Senha atual (opcional)
   */
  private async updatePasswordInternal(newPassword: string, currentPassword?: string): Promise<AuthResult> {
    try {
      console.log('[SupabaseMeiAuthService] updatePasswordInternal - Iniciando atualização de senha');
      console.log('[SupabaseMeiAuthService] updatePasswordInternal - Senha atual fornecida:', !!currentPassword);
      
      // Primeiro, verificamos se o usuário está autenticado
      console.log('[SupabaseMeiAuthService] updatePasswordInternal - Verificando autenticação...');
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('[SupabaseMeiAuthService] updatePasswordInternal - Erro ao obter usuário:', userError);
        return {
          success: false,
          error: {
            message: 'Usuário não autenticado',
          },
        };
      }
      
      if (!userData.user) {
        console.error('[SupabaseMeiAuthService] updatePasswordInternal - Nenhum usuário encontrado');
        return {
          success: false,
          error: {
            message: 'Usuário não autenticado',
          },
        };
      }
      
      console.log('[SupabaseMeiAuthService] updatePasswordInternal - Usuário autenticado:', userData.user.id);

      // Se a senha atual foi fornecida, verificá-la primeiro
      if (currentPassword) {
        console.log('[SupabaseMeiAuthService] updatePasswordInternal - Verificando senha atual...');
        
        // Criar um cliente temporário para verificar a senha atual sem afetar a sessão
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qvtniooiarxjczikmiui.supabase.co';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dG5pb29pYXJ4amN6aWttaXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjEwNjgsImV4cCI6MjA2NDYzNzA2OH0.aNl9IBCYvzOEAQpHZkeWh14jY5OmLpXcIANvoDah7kg';
        const tempClient = createClient(supabaseUrl, supabaseAnonKey);
        
        console.log('[SupabaseMeiAuthService] updatePasswordInternal - Email do usuário:', userData.user.email);

        // Verificar a senha atual usando o cliente temporário
        console.log('[SupabaseMeiAuthService] updatePasswordInternal - Tentando verificar senha atual...');
        const { error: signInError } = await tempClient.auth.signInWithPassword({
          email: userData.user.email || '',
          password: currentPassword,
        });

        if (signInError) {
          console.error('[SupabaseMeiAuthService] updatePasswordInternal - Erro na verificação da senha atual:', signInError);
          return {
            success: false,
            error: {
              message: 'Senha atual incorreta',
              code: 'invalid_current_password',
            },
          };
        }
        
        console.log('[SupabaseMeiAuthService] updatePasswordInternal - Senha atual verificada com sucesso');
      }

      // Se a senha atual está correta, atualizar para a nova senha usando o cliente principal
      console.log('[SupabaseMeiAuthService] updatePasswordInternal - Atualizando senha no Supabase...');
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('[SupabaseMeiAuthService] updatePasswordInternal - Erro ao atualizar senha:', error);
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        };
      }

      console.log('[SupabaseMeiAuthService] updatePasswordInternal - Senha atualizada com sucesso');
      return {
        success: true,
      };
    } catch (error) {
      console.error('[SupabaseMeiAuthService] updatePasswordInternal - Erro inesperado capturado:', error);
      console.error('[SupabaseMeiAuthService] updatePasswordInternal - Stack trace:', error instanceof Error ? error.stack : 'N/A');
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
   * @param newPassword Nova senha
   * @param currentPassword Senha atual (opcional)
   */
  async updatePassword(newPassword: string, currentPassword?: string): Promise<{ success: boolean; error: Error | null }> {
    const result = await this.updatePasswordInternal(newPassword, currentPassword);
    return this.convertAuthResult(result);
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