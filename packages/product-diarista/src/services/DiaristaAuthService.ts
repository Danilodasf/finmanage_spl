/**
 * Implementação do serviço de autenticação para diaristas
 * Implementa a interface AuthService do core com funcionalidades específicas
 */

import { AuthService, ServiceResult, User, Session } from '../lib/core/services';
import { getSupabaseClient } from '../lib/supabase';

type AuthResult<T> = ServiceResult<T>;
import { databaseAdapter } from '../lib/database/DatabaseAdapter';

interface DiaristaUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  address?: string;
  specialties?: string[];
  hourly_rate?: number;
  availability?: string[];
  rating?: number;
  total_services?: number;
  created_at: string;
  updated_at: string;
}

export class DiaristaAuthService implements AuthService {
  private readonly usersTable = 'profiles';
  private currentUser: DiaristaUser | null = null;
  private readonly db = databaseAdapter;
  private supabase: any;

  constructor() {
    this.supabase = getSupabaseClient();
    
    // Configura listener para mudanças de autenticação
    this.supabase.auth.onAuthStateChange((event: string, session: any) => {
      console.log('[DiaristaAuthService] Mudança de estado de autenticação:', event);
      
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        console.log('[DiaristaAuthService] Usuário deslogado ou sessão expirada, limpando dados locais');
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('auth_token');
      } else if (event === 'SIGNED_IN' && session) {
        console.log('[DiaristaAuthService] Usuário logado, sessão ativa:', session.user?.id);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('[DiaristaAuthService] Token renovado com sucesso');
      }
    });
  }



  async login(email: string, password: string): Promise<ServiceResult<{ user: User; session: Session }>> {
    console.log('[DiaristaAuthService] Método login chamado com email:', email);
    
    // Validações básicas
    if (!email || !password) {
      console.error('[DiaristaAuthService] Email ou senha não fornecidos');
      return {
        success: false,
        error: 'Email e senha são obrigatórios'
      };
    }

    // Validação básica de email
    if (!email.includes('@')) {
      console.error('[DiaristaAuthService] Email inválido:', email);
      return {
        success: false,
        error: 'Email inválido'
      };
    }

    try {
      console.log('[DiaristaAuthService] Fazendo login com Supabase Auth...');
      
      // Fazer login com Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('[DiaristaAuthService] Erro no login:', authError.message);
        return {
          success: false,
          error: authError.message === 'Invalid login credentials' ? 'Email ou senha inválidos' : authError.message
        };
      }

      if (!authData.user) {
        console.error('[DiaristaAuthService] Usuário não retornado pelo Supabase');
        return {
          success: false,
          error: 'Erro ao fazer login'
        };
      }

      console.log('[DiaristaAuthService] Login realizado com sucesso:', authData.user.id);

      // Buscar dados do perfil do usuário
      console.log('[DiaristaAuthService] Buscando perfil do usuário...');
      const profileResult = await this.db.getById('profiles', authData.user.id);
      
      if (profileResult.error || !profileResult.data) {
        console.error('[DiaristaAuthService] Erro ao buscar perfil:', profileResult.error);
        return {
          success: false,
          error: 'Perfil do usuário não encontrado'
        };
      }

      const userProfile = profileResult.data as DiaristaUser;
      this.currentUser = userProfile;

      console.log('[DiaristaAuthService] Login concluído com sucesso');
      return {
        success: true,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name
        },
        session: {
          id: authData.session?.access_token || '',
          user_id: userProfile.id,
          token: authData.session?.access_token || '',
          expires_at: authData.session?.expires_at ? new Date(authData.session.expires_at * 1000).toISOString() : ''
        }
      };
    } catch (error) {
      console.error('[DiaristaAuthService] Erro no login:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      // Validações
      if (!email || !password || !name) {
        return {
          success: false,
          error: 'Todos os campos são obrigatórios',
          user: null
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: 'A senha deve ter pelo menos 6 caracteres',
          user: null
        };
      }

      if (!email.includes('@')) {
        return {
          success: false,
          error: 'Email inválido',
          user: null
        };
      }

      console.log('[DiaristaAuthService] Iniciando registro para:', email);

      console.log('[DiaristaAuthService] Criando usuário no Supabase Auth...');
      
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        console.error('[DiaristaAuthService] Erro ao criar usuário no Supabase Auth:', authError);
        return {
          success: false,
          error: authError.message === 'User already registered' ? 'Este email já está em uso' : authError.message,
          user: null
        };
      }

      if (!authData.user) {
        console.error('[DiaristaAuthService] Usuário não retornado pelo Supabase Auth');
        return {
          success: false,
          error: 'Erro ao criar usuário',
          user: null
        };
      }

      console.log('[DiaristaAuthService] Usuário criado no Supabase Auth:', authData.user.id);

      // Criar perfil na tabela profiles
      console.log('[DiaristaAuthService] Criando perfil na tabela profiles...');
      const profileData = {
        id: authData.user.id, // Usar o ID do Supabase Auth
        email,
        name
      };

      const userResult = await this.db.create('profiles', profileData);
      console.log('[DiaristaAuthService] Resultado da criação do perfil:', userResult);

      if (userResult.error) {
        console.error('[DiaristaAuthService] Erro ao criar perfil:', userResult.error);
        return {
          success: false,
          error: 'Erro ao criar perfil do usuário',
          user: null
        };
      }

      if (!userResult.data) {
        console.error('[DiaristaAuthService] Usuário criado mas dados não retornados');
        return {
          success: false,
          user: null,
          error: 'Erro ao criar usuário'
        };
      }

      const newUser = userResult.data;
      console.log('[DiaristaAuthService] Usuário criado com sucesso:', newUser.id);

      // Retorna sucesso sem fazer login automático
      return {
        success: true,
        error: null,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        }
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        user: null
      };
    }
  }

  async logout(): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('[DiaristaAuthService] Fazendo logout...');
      
      // Fazer logout no Supabase Auth
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        console.error('[DiaristaAuthService] Erro ao fazer logout no Supabase:', error);
        // Continua com o logout local mesmo se houver erro no Supabase
      }

      // Limpa o estado local
      this.currentUser = null;
      
      // Limpa TODOS os dados do localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('auth_token');

      console.log('[DiaristaAuthService] Logout concluído com sucesso');
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Erro no logout:', error);
      
      // Limpa dados locais mesmo em caso de erro
      this.currentUser = null;
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('auth_token');
      
      return {
        success: false,
        error: 'Erro ao fazer logout'
      };
    }
  }

  async getCurrentUser(): Promise<{ user: DiaristaUser | null; error: string | null }> {
    try {
      console.log('[DiaristaAuthService] Verificando usuário autenticado no Supabase...');
      
      // Primeiro, verifica se há uma sessão ativa
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      console.log('[DiaristaAuthService] Resultado da verificação de sessão:', {
        hasSession: !!session,
        sessionError: sessionError?.message,
        userId: session?.user?.id
      });
      
      if (sessionError) {
        console.error('[DiaristaAuthService] Erro ao verificar sessão:', sessionError);
        
        // Limpa dados locais se há erro na verificação da sessão
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('auth_token');
        
        return {
          user: null,
          error: 'Sessão inválida ou expirada. Faça login novamente.'
        };
      }
      
      if (!session) {
        console.log('[DiaristaAuthService] Nenhuma sessão ativa encontrada');
        
        // Limpa dados locais se não há sessão
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('auth_token');
        
        return {
          user: null,
          error: 'Usuário não autenticado. Faça login para continuar.'
        };
      }
      
      // Se há sessão, obtém os dados do usuário
      const { data: userData, error } = await this.supabase.auth.getUser();
      let user = userData?.user;
      
      console.log('[DiaristaAuthService] Resultado da verificação de usuário:', {
        hasUser: !!user,
        error: error?.message,
        userId: user?.id
      });

      if (error) {
        console.error('[DiaristaAuthService] Erro ao verificar usuário no Supabase Auth:', error);
        
        // Se o erro é de sessão ausente, tenta renovar a sessão
        if (error.message.includes('Auth session missing')) {
          console.log('[DiaristaAuthService] Tentando renovar sessão...');
          
          const { data: refreshData, error: refreshError } = await this.supabase.auth.refreshSession();
          
          if (refreshError || !refreshData.session) {
            console.error('[DiaristaAuthService] Falha ao renovar sessão:', refreshError);
            
            // Limpa dados locais se não conseguiu renovar
            this.currentUser = null;
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('auth_token');
            
            return {
              user: null,
              error: 'Sessão expirada. Faça login novamente.'
            };
          }
          
          // Tenta obter o usuário novamente após renovar a sessão
          const { data: renewedData, error: renewedError } = await this.supabase.auth.getUser();
          const renewedUser = renewedData?.user;
          
          if (renewedError || !renewedUser) {
            console.error('[DiaristaAuthService] Erro ao obter usuário após renovação:', renewedError);
            
            this.currentUser = null;
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('auth_token');
            
            return {
              user: null,
              error: 'Falha na autenticação. Faça login novamente.'
            };
          }
          
          // Atualiza a referência do usuário
          user = renewedUser;
        } else {
          // Para outros tipos de erro, limpa dados locais
          this.currentUser = null;
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('auth_token');
          
          return {
            user: null,
            error: error.message
          };
        }
      }
      
      if (!user) {
        console.log('[DiaristaAuthService] Nenhum usuário autenticado encontrado no Supabase');
        
        // Limpa dados locais se não há usuário autenticado no Supabase
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('auth_token');
        
        return {
          user: null,
          error: 'Usuário não autenticado'
        };
      }
      
      console.log('[DiaristaAuthService] Usuário autenticado encontrado no Supabase:', user.id);
      
      // Se já temos o usuário em cache e está válido, retorna
      if (this.currentUser && this.currentUser.id === user.id) {
        console.log('[DiaristaAuthService] Retornando usuário do cache:', this.currentUser.id);
        return {
          user: this.currentUser,
          error: null
        };
      }
      
      // Busca o perfil completo do usuário no banco
      console.log('[DiaristaAuthService] Buscando perfil do usuário na tabela:', this.usersTable, 'com ID:', user.id);
      const userProfile = await databaseAdapter.getById<DiaristaUser>(
        this.usersTable,
        user.id
      );
      
      if (userProfile.error) {
        console.error('[DiaristaAuthService] Erro ao buscar perfil do usuário:', userProfile.error);
        return {
          user: null,
          error: `Erro ao buscar perfil: ${userProfile.error.message}`
        };
      }
      
      if (!userProfile.data) {
        console.error('[DiaristaAuthService] Perfil do usuário não encontrado para ID:', user.id);
        return {
          user: null,
          error: 'Perfil do usuário não encontrado'
        };
      }
      
      console.log('[DiaristaAuthService] Perfil encontrado:', userProfile.data.id, userProfile.data.email);
      
      // Atualiza o cache
      this.currentUser = userProfile.data;
      console.log('[DiaristaAuthService] Retornando usuário autenticado:', this.currentUser.id);
      
      return {
        user: this.currentUser,
        error: null
      };
    } catch (error) {
      console.error('[DiaristaAuthService] Erro ao verificar usuário:', error);
      
      // Limpa dados locais em caso de erro
      this.currentUser = null;
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('auth_token');
      
      return {
        user: null,
        error: 'Erro interno ao verificar usuário'
      };
    }
  }

  // Métodos específicos para diaristas

  /**
   * Atualiza o perfil do diarista
   */
  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    address?: string;
    specialties?: string[];
    hourly_rate?: number;
    availability?: string[];
  }): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const result = await databaseAdapter.update<DiaristaUser>(
        this.usersTable,
        this.currentUser.id,
        profileData
      );

      if (result.error) {
        return {
          success: false,
          error: 'Erro ao atualizar perfil'
        };
      }

      // Atualiza o usuário em memória
      this.currentUser = { ...this.currentUser, ...profileData };

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Busca o perfil completo do diarista
   */
  async getFullProfile(): Promise<{ profile: DiaristaUser | null; error: string | null }> {
    try {
      if (!this.currentUser) {
        return {
          profile: null,
          error: 'Usuário não autenticado'
        };
      }

      const result = await databaseAdapter.getById<DiaristaUser>(this.usersTable, this.currentUser.id);

      if (result.error) {
        return {
          profile: null,
          error: 'Erro ao buscar perfil'
        };
      }

      return {
        profile: result.data,
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar perfil completo:', error);
      return {
        profile: null,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Atualiza a senha do usuário
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      if (!newPassword || newPassword.length < 6) {
        return {
          success: false,
          error: 'A nova senha deve ter pelo menos 6 caracteres'
        };
      }

      // Atualizar senha no Supabase Auth
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('[DiaristaAuthService] Erro ao atualizar senha:', error);
        return {
          success: false,
          error: error.message || 'Erro ao atualizar senha'
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Atualiza a avaliação do diarista
   */
  async updateRating(newRating: number): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      if (newRating < 0 || newRating > 5) {
        return {
          success: false,
          error: 'Avaliação deve estar entre 0 e 5'
        };
      }

      const result = await databaseAdapter.update<DiaristaUser>(
        this.usersTable,
        this.currentUser.id,
        { rating: newRating }
      );

      if (result.error) {
        return {
          success: false,
          error: 'Erro ao atualizar avaliação'
        };
      }

      this.currentUser.rating = newRating;

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}