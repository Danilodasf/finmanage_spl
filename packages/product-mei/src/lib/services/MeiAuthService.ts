import { AuthService, LoginCredentials, RegisterData } from '../core-exports';

/**
 * Implementação do serviço de autenticação para o produto MEI
 */
export class MeiAuthService implements AuthService {
  /**
   * Realiza o login do usuário
   * @param credentials Credenciais de login
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        return { success: false, error: new Error('Email inválido') };
      }

      // Validar senha
      if (!credentials.password) {
        return { success: false, error: new Error('Senha é obrigatória') };
      }

      // Simulação de login - aqui seria integrado com a API real
      console.log('Tentativa de login MEI (via DI):', credentials);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Realiza o cadastro do usuário
   * @param userData Dados do usuário
   */
  async register(userData: RegisterData): Promise<{ success: boolean; error: Error | null }> {
    try {
      const errors: string[] = [];

      // Validar nome
      if (!userData.name.trim()) {
        errors.push('Nome é obrigatório');
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Email inválido');
      }

      // Validar senha
      if (userData.password.length < 6) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
      }

      // Validar confirmação de senha
      if (userData.password !== userData.confirmPassword) {
        errors.push('Senhas não coincidem');
      }

      if (errors.length > 0) {
        return { success: false, error: new Error(errors.join(', ')) };
      }

      // Simulação de cadastro - aqui seria integrado com a API real
      console.log('Tentativa de cadastro MEI (via DI):', userData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Realiza o logout do usuário
   */
  async logout(): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Simulação de logout - aqui seria integrado com a API real
      console.log('Realizando logout MEI (via DI)');
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao sair:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Atualiza o perfil do usuário
   * @param name Novo nome do usuário
   */
  async updateProfile(name: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      if (!name.trim()) {
        return { success: false, error: new Error('Nome não pode ser vazio') };
      }
      
      // Simulação de atualização - aqui seria integrado com a API real
      console.log('Atualizando perfil MEI (via DI):', { name });
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro na atualização do perfil:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Atualiza a senha do usuário
   * @param currentPassword Senha atual
   * @param newPassword Nova senha
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      if (!currentPassword) {
        return { success: false, error: new Error('Senha atual é obrigatória') };
      }
      
      if (newPassword.length < 6) {
        return { success: false, error: new Error('Nova senha deve ter pelo menos 6 caracteres') };
      }
      
      // Simulação de atualização - aqui seria integrado com a API real
      console.log('Atualizando senha MEI (via DI)');
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro na atualização da senha:', error);
      return { success: false, error: error as Error };
    }
  }
} 