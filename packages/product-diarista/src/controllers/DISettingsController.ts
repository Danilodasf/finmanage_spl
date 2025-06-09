/**
 * Controlador de configurações usando injeção de dependências
 * Gerencia operações de configurações específicas para diaristas
 */

import { DIContainer } from '../lib/core/di';
import { StorageService, ServiceResult } from '../lib/core/services';
import { STORAGE_SERVICE } from '../lib/di/bootstrap';
import { DIAuthController } from './DIAuthController';

export interface ProfileData {
  name: string;
  email: string;
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PreferencesData {
  currency: string;
  dateFormat: string;
  notifications: boolean;
  darkMode: boolean;
}

export class DISettingsController {
  private storageService: StorageService;

  constructor() {
    const container = DIContainer.getInstance();
    
    // Obtém o serviço do container DI
    this.storageService = container.get(STORAGE_SERVICE) as StorageService;
    
    if (!this.storageService) {
      throw new Error('StorageService não encontrado no container DI');
    }
  }

  /**
   * Atualiza o perfil do usuário
   */
  async updateProfile(profileData: ProfileData): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      // Validações básicas
      if (!profileData.name || !profileData.email) {
        return {
          success: false,
          error: 'Nome e email são obrigatórios'
        };
      }

      if (!profileData.email.includes('@')) {
        return {
          success: false,
          error: 'Email inválido'
        };
      }

      // Simular atualização do perfil
      await this.delay(1000);
      
      // Salvar no storage
      const { error } = await this.storageService.setItem('user_profile', profileData);
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

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
   * Atualiza a senha do usuário
   */
  async updatePassword(passwordData: PasswordData): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      // Validações
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        return {
          success: false,
          error: 'Todos os campos de senha são obrigatórios'
        };
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        return {
          success: false,
          error: 'As senhas não coincidem'
        };
      }

      if (passwordData.newPassword.length < 6) {
        return {
          success: false,
          error: 'A nova senha deve ter pelo menos 6 caracteres'
        };
      }

      // Simular verificação da senha atual
      if (passwordData.currentPassword !== 'senha123') {
        return {
          success: false,
          error: 'Senha atual incorreta'
        };
      }

      // Simular atualização da senha
      await this.delay(1000);

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
   * Atualiza as preferências do usuário
   */
  async updatePreferences(preferences: PreferencesData): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      // Validações básicas
      if (!preferences.currency || !preferences.dateFormat) {
        return {
          success: false,
          error: 'Moeda e formato de data são obrigatórios'
        };
      }

      // Simular salvamento das preferências
      await this.delay(1000);
      
      // Salvar no storage
      const { error } = await this.storageService.setItem('user_preferences', preferences);
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Carrega o perfil do usuário
   */
  async loadProfile(): Promise<{
    success: boolean;
    data: ProfileData | null;
    error: string | null;
  }> {
    try {
      // Obter usuário autenticado
      const { user, error } = await DIAuthController.getCurrentUser();
      
      if (error || !user) {
        return {
          success: false,
          data: null,
          error: error || 'Usuário não autenticado'
        };
      }

      const profileData: ProfileData = {
        name: user.name || '',
        email: user.email || ''
      };

      return {
        success: true,
        data: profileData,
        error: null
      };
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      return {
        success: false,
        data: null,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Carrega as preferências do usuário
   */
  async loadPreferences(): Promise<{
    success: boolean;
    data: PreferencesData | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await this.storageService.getItem('user_preferences');
      
      if (error) {
        return {
          success: false,
          data: null,
          error: error.message
        };
      }

      // Se não há dados salvos, retorna preferências padrão
      const preferences = data || {
        currency: 'BRL',
        dateFormat: 'dd/MM/yyyy',
        notifications: true,
        darkMode: false
      };

      return {
        success: true,
        data: preferences as PreferencesData,
        error: null
      };
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      return {
        success: false,
        data: null,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Simula delay para operações assíncronas
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}