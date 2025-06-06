import { AuthService, LoginCredentials, RegisterData } from '@finmanage/core';
import { SupabaseMeiAuthService } from './SupabaseMeiAuthService';

/**
 * Implementação do serviço de autenticação para o produto MEI
 * Delega para o SupabaseMeiAuthService para funcionalidade real
 */
export class MeiAuthService implements AuthService {
  private supabaseService: SupabaseMeiAuthService;

  constructor() {
    this.supabaseService = new SupabaseMeiAuthService();
  }
  /**
   * Realiza o login do usuário
   * @param credentials Credenciais de login
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error: Error | null }> {
    return await this.supabaseService.login(credentials);
  }

  /**
   * Realiza o cadastro do usuário
   * @param userData Dados do usuário
   */
  async register(userData: RegisterData): Promise<{ success: boolean; error: Error | null }> {
    return await this.supabaseService.register(userData);
  }

  /**
   * Realiza o logout do usuário
   */
  async logout(): Promise<{ success: boolean; error: Error | null }> {
    return await this.supabaseService.logout();
  }

  /**
   * Atualiza o perfil do usuário
   * @param name Novo nome do usuário
   */
  async updateProfile(name: string): Promise<{ success: boolean; error: Error | null }> {
    return await this.supabaseService.updateProfile(name);
  }

  /**
   * Atualiza a senha do usuário
   * @param newPassword Nova senha
   * @param currentPassword Senha atual (opcional)
   */
  async updatePassword(newPassword: string, currentPassword?: string): Promise<{ success: boolean; error: Error | null }> {
    console.log('🔧 MeiAuthService.updatePassword - Delegando para SupabaseMeiAuthService');
    return await this.supabaseService.updatePassword(newPassword, currentPassword);
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.supabaseService.isAuthenticated();
  }

  /**
   * Obtém o usuário atual
   */
  async getCurrentUser(): Promise<any> {
    return await this.supabaseService.getCurrentUser();
  }
}