/**
 * Implementação do serviço de autenticação para diaristas
 * Implementa a interface AuthService do core com funcionalidades específicas
 */

import { AuthService, ServiceResult, User, Session } from '../lib/core/services';

type AuthResult<T> = ServiceResult<T>;
import { databaseAdapter } from '../lib/database/DatabaseAdapter';

interface DiaristaUser {
  id: string;
  email: string;
  password: string;
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

interface DiaristaSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export class DiaristaAuthService implements AuthService {
  private readonly usersTable = 'users';
  private readonly sessionsTable = 'sessions';
  private currentUser: DiaristaUser | null = null;
  private currentSession: DiaristaSession | null = null;

  /**
   * Gera um token simples para sessão (em produção, usar JWT ou similar)
   */
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Hash simples da senha (em produção, usar bcrypt ou similar)
   */
  private hashPassword(password: string): string {
    // Implementação simples para demonstração
    // Em produção, usar uma biblioteca de hash segura
    return btoa(password + 'salt_diarista');
  }

  /**
   * Verifica se a senha está correta
   */
  private verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  /**
   * Valida formato do email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida força da senha
   */
  private isValidPassword(password: string): boolean {
    // Mínimo 6 caracteres
    return password.length >= 6;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Validações básicas
      if (!email || !password) {
        return {
          success: false,
          error: 'Email e senha são obrigatórios',
          user: null
        };
      }

      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: 'Formato de email inválido',
          user: null
        };
      }

      // Busca o usuário pelo email
      const userResult = await databaseAdapter.findWhere<DiaristaUser>(this.usersTable, {
        email: email.toLowerCase()
      });

      if (userResult.error) {
        return {
          success: false,
          error: 'Erro interno do servidor',
          user: null
        };
      }

      const users = userResult.data || [];
      if (users.length === 0) {
        return {
          success: false,
          error: 'Email ou senha incorretos',
          user: null
        };
      }

      const user = users[0];

      // Verifica a senha
      if (!this.verifyPassword(password, user.password)) {
        return {
          success: false,
          error: 'Email ou senha incorretos',
          user: null
        };
      }

      // Cria uma nova sessão
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

      const sessionData = {
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString()
      };

      const sessionResult = await databaseAdapter.create<DiaristaSession>(this.sessionsTable, sessionData);

      if (sessionResult.error) {
        return {
          success: false,
          error: 'Erro ao criar sessão',
          user: null
        };
      }

      // Armazena o usuário e sessão atuais
      this.currentUser = user;
      this.currentSession = sessionResult.data!;

      // Salva no localStorage para persistência
      localStorage.setItem('diarista_auth_token', token);
      localStorage.setItem('diarista_user_id', user.id);

      return {
        success: true,
        error: null,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
        user: null
      };
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      // Validações
      if (!email || !password || !name) {
        return {
          success: false,
          error: 'Email, senha e nome são obrigatórios',
          user: null
        };
      }

      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: 'Formato de email inválido',
          user: null
        };
      }

      if (!this.isValidPassword(password)) {
        return {
          success: false,
          error: 'Senha deve ter pelo menos 6 caracteres',
          user: null
        };
      }

      if (name.trim().length < 2) {
        return {
          success: false,
          error: 'Nome deve ter pelo menos 2 caracteres',
          user: null
        };
      }

      // Verifica se o email já está em uso
      const existingUserResult = await databaseAdapter.findWhere<DiaristaUser>(this.usersTable, {
        email: email.toLowerCase()
      });

      if (existingUserResult.error) {
        return {
          success: false,
          error: 'Erro interno do servidor',
          user: null
        };
      }

      if (existingUserResult.data && existingUserResult.data.length > 0) {
        return {
          success: false,
          error: 'Este email já está cadastrado',
          user: null
        };
      }

      // Cria o novo usuário
      const userData = {
        email: email.toLowerCase(),
        password: this.hashPassword(password),
        name: name.trim(),
        specialties: [],
        hourly_rate: 0,
        availability: [],
        rating: 0,
        total_services: 0
      };

      const userResult = await databaseAdapter.create<DiaristaUser>(this.usersTable, userData);

      if (userResult.error) {
        return {
          success: false,
          error: 'Erro ao criar usuário',
          user: null
        };
      }

      const newUser = userResult.data!;

      // Faz login automático após o registro
      return await this.login(email, password);
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
      // Remove a sessão do banco de dados
      if (this.currentSession) {
        await databaseAdapter.delete(this.sessionsTable, this.currentSession.id);
      }

      // Limpa o estado local
      this.currentUser = null;
      this.currentSession = null;

      // Remove do localStorage - limpar todos os tokens de autenticação
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('diarista_auth_token');
      localStorage.removeItem('diarista_user_id');

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

      // Tenta recuperar do localStorage
      const token = localStorage.getItem('diarista_auth_token');
      const userId = localStorage.getItem('diarista_user_id');

      if (!token || !userId) {
        return {
          user: null,
          error: null
        };
      }

      // Verifica se a sessão ainda é válida
      const sessionResult = await databaseAdapter.findWhere<DiaristaSession>(this.sessionsTable, {
        token: token,
        user_id: userId
      });

      if (sessionResult.error || !sessionResult.data || sessionResult.data.length === 0) {
        // Sessão inválida, limpa o localStorage
        localStorage.removeItem('diarista_auth_token');
        localStorage.removeItem('diarista_user_id');
        return {
          user: null,
          error: null
        };
      }

      const session = sessionResult.data[0];

      // Verifica se a sessão não expirou
      if (new Date(session.expires_at) < new Date()) {
        // Sessão expirada, remove
        await databaseAdapter.delete(this.sessionsTable, session.id);
        localStorage.removeItem('diarista_auth_token');
        localStorage.removeItem('diarista_user_id');
        return {
          user: null,
          error: null
        };
      }

      // Busca os dados do usuário
      const userResult = await databaseAdapter.getById<DiaristaUser>(this.usersTable, userId);

      if (userResult.error || !userResult.data) {
        return {
          user: null,
          error: 'Usuário não encontrado'
        };
      }

      this.currentUser = userResult.data;
      this.currentSession = session;

      return {
        user: {
          id: this.currentUser.id,
          email: this.currentUser.email,
          name: this.currentUser.name
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