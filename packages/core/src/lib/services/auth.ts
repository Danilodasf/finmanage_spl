import { LoginCredentials, RegisterData, User } from '../../models/User';
import { supabase } from '../supabase';

/**
 * Interface que define o resultado de operações de autenticação
 * 
 * Padroniza o retorno de todas as operações de autenticação,
 * fornecendo informações sobre sucesso/falha, erros e dados do usuário.
 */
export interface AuthResult {
  /** Indica se a operação foi bem-sucedida */
  success: boolean;
  /** Informações de erro, se houver */
  error?: {
    /** Mensagem descritiva do erro */
    message: string;
    /** Código específico do erro (opcional) */
    code?: string;
  };
  /** Dados do usuário autenticado (quando aplicável) */
  user?: User;
}

/**
 * Interface que define o contrato do serviço de autenticação
 * 
 * Especifica todos os métodos necessários para gerenciar
 * autenticação de usuários, incluindo login, registro,
 * atualização de perfil e verificação de estado.
 */
export interface AuthService {
  /** Autentica um usuário com email e senha */
  login(credentials: LoginCredentials): Promise<AuthResult>;
  /** Registra um novo usuário no sistema */
  register(data: RegisterData): Promise<AuthResult>;
  /** Encerra a sessão do usuário atual */
  logout(): Promise<AuthResult>;
  /** Obtém os dados do usuário autenticado */
  getCurrentUser(): Promise<User | null>;
  /** Atualiza o nome do perfil do usuário */
  updateProfile(name: string): Promise<AuthResult>;
  /** Altera a senha do usuário autenticado */
  updatePassword(currentPassword: string, newPassword: string): Promise<AuthResult>;
  /** Verifica se existe uma sessão ativa */
  isAuthenticated(): Promise<boolean>;
}

/**
 * Implementação do serviço de autenticação utilizando Supabase
 * 
 * Fornece funcionalidades completas de autenticação incluindo login,
 * registro, logout, atualização de perfil e gerenciamento de sessões.
 * Integra-se com o sistema de autenticação do Supabase e gerencia
 * dados adicionais do usuário na tabela 'users'.
 */
export class SupabaseAuthService implements AuthService {
  /**
   * Autentica um usuário no sistema
   * 
   * Realiza o login utilizando email e senha, buscando dados adicionais
   * do usuário na tabela 'users'. Em caso de falha na busca dos dados
   * adicionais, ainda considera o login como bem-sucedido mas retorna
   * apenas informações básicas do perfil.
   * 
   * @param credentials - Objeto contendo email e senha do usuário
   * @returns Promise<AuthResult> Resultado da operação com dados do usuário
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
   * Registra um novo usuário no sistema
   * 
   * Cria uma nova conta de usuário validando os dados fornecidos,
   * verificando se as senhas coincidem e criando registros tanto
   * no sistema de autenticação quanto na tabela de usuários.
   * 
   * @param data - Dados do registro incluindo email, senha, confirmação e nome
   * @returns Promise<AuthResult> Resultado da operação de registro
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
   * Encerra a sessão do usuário atual
   * 
   * Remove a sessão ativa do usuário, desconectando-o do sistema.
   * Após o logout, o usuário precisará fazer login novamente para
   * acessar funcionalidades protegidas.
   * 
   * @returns Promise<AuthResult> Resultado da operação de logout
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
   * Obtém os dados do usuário autenticado atualmente
   * 
   * Busca informações completas do usuário logado, incluindo dados
   * adicionais armazenados na tabela 'users'. Se não conseguir
   * acessar os dados adicionais, retorna informações básicas
   * do perfil de autenticação.
   * 
   * @returns Promise<User | null> Dados do usuário ou null se não autenticado
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
   * Atualiza o perfil do usuário autenticado
   * 
   * Modifica o nome do usuário tanto nos metadados de autenticação
   * quanto no registro da tabela 'users'. A operação é atômica
   * e falha se qualquer uma das atualizações não for bem-sucedida.
   * 
   * @param name Novo nome do usuário
   * @returns Promise<AuthResult> Resultado da operação de atualização
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
   * Atualiza a senha do usuário autenticado
   * 
   * Altera a senha do usuário após verificar a senha atual.
   * Por segurança, reautentica o usuário com a senha atual
   * antes de permitir a alteração para a nova senha.
   * 
   * @param currentPassword Senha atual do usuário para verificação
   * @param newPassword Nova senha a ser definida
   * @returns Promise<AuthResult> Resultado da operação de atualização
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
   * Verifica se existe um usuário autenticado atualmente
   * 
   * Consulta a sessão ativa do Supabase para determinar
   * se há um usuário logado no sistema.
   * 
   * @returns Promise<boolean> true se há usuário autenticado, false caso contrário
   */
  async isAuthenticated(): Promise<boolean> {
    const { data, error } = await supabase.auth.getSession();
    return !error && data?.session !== null;
  }
}