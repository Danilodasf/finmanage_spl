import { DIContainer, AUTH_SERVICE } from '@finmanage/core/di';
import { AuthService } from '@finmanage/core/services';
import { toast } from '@/hooks/use-toast';
import { LoginCredentials, RegisterData } from '@/models/User';

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
   * Realiza login do usuário
   * @param credentials Credenciais de login
   * @returns true se o login foi realizado com sucesso
   */
  static async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const authService = this.getAuthService();
      const { success, error } = await authService.signIn(credentials.email, credentials.password);
      
      if (!success) {
        toast({
          title: "Erro no login",
          description: error || "Credenciais inválidas",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao FinManage Personal",
      });
      
      return true;
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
   * Registra um novo usuário
   * @param userData Dados do usuário
   * @returns true se o registro foi realizado com sucesso
   */
  static async register(userData: RegisterData): Promise<boolean> {
    try {
      // Validar dados
      if (userData.password !== userData.confirmPassword) {
        toast({
          title: "Erro de validação",
          description: "As senhas não coincidem",
          variant: "destructive",
        });
        return false;
      }

      if (!userData.name || !userData.email || !userData.password) {
        toast({
          title: "Erro de validação",
          description: "Todos os campos são obrigatórios",
          variant: "destructive",
        });
        return false;
      }

      const authService = this.getAuthService();
      const { success, error } = await authService.signUp(userData.email, userData.password, userData.name);
      
      if (!success) {
        toast({
          title: "Erro no cadastro",
          description: error || "Não foi possível criar sua conta",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada. Faça login para continuar.",
      });
      
      return true;
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
   * Realiza logout do usuário
   * @returns true se o logout foi realizado com sucesso
   */
  static async logout(): Promise<boolean> {
    try {
      const authService = this.getAuthService();
      await authService.signOut();
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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
   * @param name Nome do usuário
   * @returns true se o perfil foi atualizado com sucesso
   */
  static async updateProfile(name: string): Promise<boolean> {
    try {
      if (!name.trim()) {
        toast({
          title: "Erro de validação",
          description: "Nome não pode ser vazio",
          variant: "destructive",
        });
        return false;
      }
      
      const authService = this.getAuthService();
      const { success, error } = await authService.updateProfile(name);
      
      if (!success) {
        toast({
          title: "Erro na atualização",
          description: error || "Não foi possível atualizar seu perfil",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso",
      });
      
      return true;
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
   * @returns true se a senha foi atualizada com sucesso
   */
  static async updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      if (!currentPassword || !newPassword) {
        toast({
          title: "Erro de validação",
          description: "Preencha todos os campos",
          variant: "destructive",
        });
        return false;
      }
      
      if (newPassword.length < 6) {
        toast({
          title: "Erro de validação",
          description: "Nova senha deve ter pelo menos 6 caracteres",
          variant: "destructive",
        });
        return false;
      }
      
      const authService = this.getAuthService();
      const { success, error } = await authService.updatePassword(newPassword);
      
      if (!success) {
        toast({
          title: "Erro na atualização da senha",
          description: error || "Não foi possível atualizar sua senha",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('Erro na atualização da senha:', error);
      toast({
        title: "Erro na atualização",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }
} 