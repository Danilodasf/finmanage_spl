// Importa o container de injeção de dependências (DI) do core
import { DIContainer, AUTH_SERVICE, AuthService, LoginCredentials, RegisterData, toast } from '../lib/core-exports';

/**
 * Controlador de autenticação que usa injeção de dependências
 */
export class DIAuthController {
  /**
   * Obtém o serviço de autenticação do container de DI
   * @returns Instância do serviço de autenticação
   */
  private static getAuthService(): AuthService {
    return DIContainer.get<AuthService>(AUTH_SERVICE);
  }

  /**
   * Realiza o login do usuário
   * @param credentials Credenciais de login
   * @returns true se o login foi bem-sucedido
   */
  static async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const authService = this.getAuthService();
      const { success, error } = await authService.login(credentials);
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }
      
      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao FinManage MEI",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Realiza o cadastro do usuário
   * @param userData Dados do usuário
   * @returns true se o cadastro foi bem-sucedido
   */
  static async register(userData: RegisterData): Promise<boolean> {
    try {
      const authService = this.getAuthService();
      const { success, error } = await authService.register(userData);
      
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }
      
      if (success) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Sua conta foi criada. Faça login para continuar.",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Realiza o logout do usuário
   * @returns true se o logout foi bem-sucedido
   */
  static async logout(): Promise<boolean> {
    try {
      const authService = this.getAuthService();
      const { success, error } = await authService.logout();
      
      if (error) {
        toast({
          title: "Erro ao sair",
          description: "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }
      
      if (success) {
        toast({
          title: "Logout realizado com sucesso!",
          description: "Você foi desconectado da sua conta.",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Atualiza o perfil do usuário
   * @param name Novo nome do usuário
   * @returns true se a atualização foi bem-sucedida
   */
  static async updateProfile(name: string): Promise<boolean> {
    try {
      const authService = this.getAuthService();
      const { success, error } = await authService.updateProfile(name);
      
      if (error) {
        toast({
          title: "Erro na atualização",
          description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }
      
      if (success) {
        toast({
          title: "Perfil atualizado com sucesso!",
          description: "Suas informações foram salvas.",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erro na atualização do perfil:', error);
      toast({
        title: "Erro na atualização",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Atualiza a senha do usuário
   * @param currentPassword Senha atual
   * @param newPassword Nova senha
   * @returns true se a atualização foi bem-sucedida
   */
  static async updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    console.log('🔧 DIAuthController.updatePassword - INÍCIO');
    console.log('🔧 DIAuthController.updatePassword - currentPassword length:', currentPassword?.length);
    console.log('🔧 DIAuthController.updatePassword - newPassword length:', newPassword?.length);
    
    try {
      // Validações básicas
      if (!currentPassword) {
        console.log('🔧 DIAuthController.updatePassword - ERRO: Senha atual vazia');
        toast({
          title: "Erro de validação",
          description: "Senha atual é obrigatória",
          variant: "destructive",
        });
        return false;
      }
      
      if (newPassword.length < 6) {
        console.log('🔧 DIAuthController.updatePassword - ERRO: Nova senha muito curta');
        toast({
          title: "Erro de validação",
          description: "Nova senha deve ter pelo menos 6 caracteres",
          variant: "destructive",
        });
        return false;
      }

      console.log('🔧 DIAuthController.updatePassword - Obtendo authService...');
      const authService = this.getAuthService();
      console.log('🔧 DIAuthController.updatePassword - AuthService obtido:', authService.constructor.name);
      
      console.log('🔧 DIAuthController.updatePassword - Chamando authService.updatePassword...');
      const { success, error } = await authService.updatePassword(newPassword, currentPassword);
      console.log('🔧 DIAuthController.updatePassword - Resultado do authService:', { success, error: error?.message });
      
      if (error) {
        let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
        
        if (error.message.includes('Senha atual incorreta')) {
          errorMessage = "Senha atual incorreta";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Erro na atualização",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
      
      if (success) {
        console.log('🔧 DIAuthController.updatePassword - SUCESSO: Senha alterada!');
        toast({
          title: "Senha alterada com sucesso!",
          description: "Sua nova senha já está ativa.",
        });
      }
      
      console.log('🔧 DIAuthController.updatePassword - RETORNANDO:', success);
      return success;
    } catch (error) {
      console.error('🔧 DIAuthController.updatePassword - ERRO CATCH:', error);
      console.error('🔧 DIAuthController.updatePassword - ERRO STACK:', error instanceof Error ? error.stack : 'No stack trace');
      toast({
        title: "Erro na atualização",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns true se o usuário está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const authService = this.getAuthService();
      return await authService.isAuthenticated();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Obtém o usuário atual
   * @returns Dados do usuário atual ou null se não autenticado
   */
  static async getCurrentUser(): Promise<any> {
    try {
      const authService = this.getAuthService();
      return await authService.getCurrentUser();
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }
}