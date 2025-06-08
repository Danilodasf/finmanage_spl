/**
 * Controlador de autenticação usando injeção de dependências
 * Gerencia operações de autenticação específicas para diaristas
 */

import { DIContainer } from '../lib/core/di';
import { AuthService, ServiceResult, User, Session } from '../lib/core/services';

// Definindo AuthResult localmente
type AuthResult = ServiceResult<{ user: User; session: Session }>;
import { AUTH_SERVICE, CATEGORY_SERVICE } from '../lib/di/bootstrap';
import { DiaristaAuthService } from '../services/DiaristaAuthService';
import { DiaristaCategoryService } from '../services/DiaristaCategoryService';

export class DIAuthController {
  private authService: DiaristaAuthService;
  private categoryService: DiaristaCategoryService;

  constructor() {
    const container = DIContainer.getInstance();
    
    // Obtém os serviços do container DI
    this.authService = container.get(AUTH_SERVICE) as DiaristaAuthService;
    this.categoryService = container.get(CATEGORY_SERVICE) as DiaristaCategoryService;
    
    if (!this.authService) {
      throw new Error('AuthService não encontrado no container DI');
    }
    
    if (!this.categoryService) {
      throw new Error('CategoryService não encontrado no container DI');
    }
  }

  /**
   * Realiza login do usuário
   */
  async login(email: string, password: string): Promise<{
    success: boolean;
    user: any | null;
    error: string | null;
  }> {
    try {
      // Validações básicas - aceita qualquer informação por enquanto
      if (!email || !password) {
        return {
          success: false,
          user: null,
          error: 'Email e senha são obrigatórios'
        };
      }
      
      // Usar o serviço de autenticação real
      const result = await this.authService.login(email.trim(), password);
      
      if (!result.success) {
        return {
          success: false,
          user: null,
          error: result.error || 'Erro no login'
        };
      }

      // Armazenar dados de autenticação no localStorage
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('auth_token', 'authenticated'); // Token para verificação de autenticação
      }

      return {
        success: true,
        user: result.user,
        error: null
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        user: null,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Realiza registro de novo usuário
   */
  async register(email: string, password: string, name: string, createDefaultCategories: boolean = true): Promise<{
    success: boolean;
    user: any | null;
    error: string | null;
  }> {
    try {
      // Validações básicas
      if (!email || !password || !name) {
        return {
          success: false,
          user: null,
          error: 'Email, senha e nome são obrigatórios'
        };
      }

      // Validações específicas
      if (name.trim().length < 2) {
        return {
          success: false,
          user: null,
          error: 'Nome deve ter pelo menos 2 caracteres'
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          user: null,
          error: 'Senha deve ter pelo menos 6 caracteres'
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          user: null,
          error: 'Formato de email inválido'
        };
      }

      // Realiza o registro
      const result = await this.authService.register(email.trim(), password, name.trim());
      
      if (!result.success) {
        return {
          success: false,
          user: null,
          error: result.error || 'Erro no registro'
        };
      }

      // Se o registro foi bem-sucedido e deve criar categorias padrão
      if (result.user && createDefaultCategories) {
        try {
          await this.categoryService.createDefaultCategories(result.user.id);
          console.log('Categorias padrão criadas para o novo usuário');
        } catch (error) {
          console.warn('Erro ao criar categorias padrão:', error);
          // Não falha o registro por causa das categorias
        }
      }

      return {
        success: true,
        user: result.user,
        error: null
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        user: null,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<{ success: boolean; error: string | null }> {
    try {
      const result = await this.authService.logout();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Erro no logout'
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Erro no logout:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Busca o usuário atual
   */
  async getCurrentUser(): Promise<{ user: any | null; error: string | null }> {
    try {
      const result = await this.authService.getCurrentUser();
      
      if (result.error) {
        return {
          user: null,
          error: result.error
        };
      }

      return {
        user: result.user,
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

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<{ isAuthenticated: boolean; user: any | null }> {
    try {
      const result = await this.getCurrentUser();
      
      return {
        isAuthenticated: !!result.user,
        user: result.user
      };
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return {
        isAuthenticated: false,
        user: null
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
      // Validações
      if (profileData.name !== undefined && profileData.name.trim().length < 2) {
        return {
          success: false,
          error: 'Nome deve ter pelo menos 2 caracteres'
        };
      }

      if (profileData.hourly_rate !== undefined && profileData.hourly_rate < 0) {
        return {
          success: false,
          error: 'Valor por hora deve ser positivo'
        };
      }

      if (profileData.phone !== undefined && profileData.phone.length > 0) {
        // Validação básica de telefone (apenas números, parênteses, espaços e hífens)
        const phoneRegex = /^[\d\s\(\)\-\+]+$/;
        if (!phoneRegex.test(profileData.phone)) {
          return {
            success: false,
            error: 'Formato de telefone inválido'
          };
        }
      }

      const result = await this.authService.updateProfile(profileData);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Erro ao atualizar perfil'
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
   * Busca o perfil completo do diarista
   */
  async getFullProfile(): Promise<{ profile: any | null; error: string | null }> {
    try {
      const result = await this.authService.getFullProfile();
      
      if (result.error) {
        return {
          profile: null,
          error: result.error
        };
      }

      return {
        profile: result.profile,
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
      if (newRating < 0 || newRating > 5) {
        return {
          success: false,
          error: 'Avaliação deve estar entre 0 e 5'
        };
      }

      const result = await this.authService.updateRating(newRating);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Erro ao atualizar avaliação'
        };
      }

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

  /**
   * Valida dados de perfil antes de salvar
   */
  validateProfileData(profileData: {
    name?: string;
    phone?: string;
    address?: string;
    specialties?: string[];
    hourly_rate?: number;
    availability?: string[];
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (profileData.name !== undefined) {
      if (!profileData.name || profileData.name.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
      }
      if (profileData.name.length > 100) {
        errors.push('Nome deve ter no máximo 100 caracteres');
      }
    }

    if (profileData.phone !== undefined && profileData.phone.length > 0) {
      const phoneRegex = /^[\d\s\(\)\-\+]+$/;
      if (!phoneRegex.test(profileData.phone)) {
        errors.push('Formato de telefone inválido');
      }
    }

    if (profileData.hourly_rate !== undefined) {
      if (profileData.hourly_rate < 0) {
        errors.push('Valor por hora deve ser positivo');
      }
      if (profileData.hourly_rate > 1000) {
        errors.push('Valor por hora deve ser menor que R$ 1.000');
      }
    }

    if (profileData.specialties !== undefined) {
      if (profileData.specialties.length === 0) {
        errors.push('Selecione pelo menos uma especialidade');
      }
    }

    if (profileData.availability !== undefined) {
      if (profileData.availability.length === 0) {
        errors.push('Selecione pelo menos um dia de disponibilidade');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Busca estatísticas do perfil
   */
  async getProfileStats(): Promise<{
    data: {
      profileCompleteness: number;
      missingFields: string[];
      hasSpecialties: boolean;
      hasAvailability: boolean;
      hasContactInfo: boolean;
    } | null;
    error: string | null;
  }> {
    try {
      const profileResult = await this.getFullProfile();
      
      if (profileResult.error || !profileResult.profile) {
        return {
          data: null,
          error: profileResult.error || 'Perfil não encontrado'
        };
      }

      const profile = profileResult.profile;
      const missingFields: string[] = [];
      let completedFields = 0;
      const totalFields = 7; // name, email, phone, address, specialties, hourly_rate, availability

      // Campos obrigatórios sempre presentes
      if (profile.name) completedFields++;
      if (profile.email) completedFields++;

      // Campos opcionais
      if (profile.phone) {
        completedFields++;
      } else {
        missingFields.push('Telefone');
      }

      if (profile.address) {
        completedFields++;
      } else {
        missingFields.push('Endereço');
      }

      if (profile.specialties && profile.specialties.length > 0) {
        completedFields++;
      } else {
        missingFields.push('Especialidades');
      }

      if (profile.hourly_rate && profile.hourly_rate > 0) {
        completedFields++;
      } else {
        missingFields.push('Valor por hora');
      }

      if (profile.availability && profile.availability.length > 0) {
        completedFields++;
      } else {
        missingFields.push('Disponibilidade');
      }

      const profileCompleteness = Math.round((completedFields / totalFields) * 100);

      return {
        data: {
          profileCompleteness,
          missingFields,
          hasSpecialties: !!(profile.specialties && profile.specialties.length > 0),
          hasAvailability: !!(profile.availability && profile.availability.length > 0),
          hasContactInfo: !!(profile.phone || profile.address)
        },
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do perfil:', error);
      return {
        data: null,
        error: 'Erro interno do servidor'
      };
    }
  }
}