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
        name,
        phone: '',
        address: '',
        specialties: [],
        hourly_rate: 0,
        availability: [],
        rating: 0,
        total_services: 0
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

      console.log('[DiaristaAuthService] Logout concluído com sucesso');
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Erro no logout:', error);
      return {
        success: false,
        error: 'Erro ao fazer logout'
      };
    }
  }

  async getCurrentUser(): Promise<{ user: any | null; error: string | null }> {
    try {
      // Se já temos o usuário em memória, retorna
      if (this.currentUser) {
        return {
          user: {
            id: this.currentUser.id,
            email: this.currentUser.email,
            name: this.currentUser.name
          },
          error: null
        };
      }

      // Verifica se há dados salvos no localStorage
      const savedUser = localStorage.getItem('user');
      const savedAuth = localStorage.getItem('isAuthenticated');
      
      if (savedUser && savedAuth === 'true') {
        try {
          const userData = JSON.parse(savedUser);
          console.log('[DiaristaAuthService] Usuário encontrado no localStorage:', userData.id);
          
          // Define o usuário atual a partir do localStorage
          this.currentUser = userData;
          
          return {
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name
            },
            error: null
          };
        } catch (parseError) {
          console.error('[DiaristaAuthService] Erro ao fazer parse dos dados do localStorage:', parseError);
          // Remove dados corrompidos
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
        }
      }

      console.log('[DiaristaAuthService] Verificando usuário autenticado no Supabase...');
      
      // Verifica se há um usuário autenticado no Supabase
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) {
        console.error('[DiaristaAuthService] Erro ao verificar usuário:', error);
        return {
          user: null,
          error: null
        };
      }

      if (!user) {
        console.log('[DiaristaAuthService] Nenhum usuário autenticado');
        return {
          user: null,
          error: null
        };
      }

      console.log('[DiaristaAuthService] Usuário autenticado encontrado:', user.id);

      // Busca os dados do perfil do usuário
      const profileResult = await this.db.getById('profiles', user.id);

      if (profileResult.error || !profileResult.data) {
        console.error('[DiaristaAuthService] Erro ao buscar perfil:', profileResult.error);
        return {
          user: null,
          error: 'Perfil do usuário não encontrado'
        };
      }

      const userProfile = profileResult.data as DiaristaUser;
      this.currentUser = userProfile;

      return {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name
        },
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return {
        user: null,
        error: 'Erro interno do servidor'
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