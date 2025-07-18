import { LoginCredentials, RegisterData, UserModel } from '@/models/User';
import { toast } from '@/hooks/use-toast';
import { SupabaseAuthService, AuthService, AuthResult } from '@/lib/services/auth';

/**
 * Mock AuthService para desenvolvimento sem banco de dados
 * Remove quando o Supabase estiver configurado
 */
class MockAuthService implements AuthService {
  private mockUser = {
    id: 'mock-user-id',
    email: 'user@example.com',
    name: 'Usuário Teste',
    createdAt: new Date()
  };

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Simula um pequeno delay para parecer real
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      user: this.mockUser
    };
  }

  async register(data: RegisterData): Promise<AuthResult> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      user: {
        ...this.mockUser,
        email: data.email,
        name: data.name
      }
    };
  }

  async logout(): Promise<AuthResult> {
    return { success: true };
  }

  async getCurrentUser() {
    return this.mockUser;
  }

  async updateProfile(name: string): Promise<AuthResult> {
    this.mockUser.name = name;
    return { success: true, user: this.mockUser };
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    return { success: true };
  }

  async isAuthenticated(): Promise<boolean> {
    return true;
  }
}

// TODO: Substituir por SupabaseAuthService quando o banco estiver configurado
// const authService = new SupabaseAuthService();
const authService = new MockAuthService();

export class AuthController {
  static async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const errors = UserModel.validateLoginData(credentials);
      
      if (errors.length > 0) {
        toast({
          title: "Erro de validação",
          description: errors.join(', '),
          variant: "destructive",
        });
        return false;
      }

      const result = await authService.login(credentials);
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo ao FinManage, ${result.user?.name}`,
        });
        return true;
      } else {
        toast({
          title: "Erro no login",
          description: result.error?.message || "Credenciais inválidas",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }

  static async register(userData: RegisterData): Promise<boolean> {
    try {
      const errors = UserModel.validateRegisterData(userData);
      
      if (errors.length > 0) {
        toast({
          title: "Erro de validação",
          description: errors.join(', '),
          variant: "destructive",
        });
        return false;
      }

      const result = await authService.register(userData);
      
      if (result.success) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Sua conta foi criada. Faça login para continuar.",
        });
        return true;
      } else {
        toast({
          title: "Erro no cadastro",
          description: result.error?.message || "Não foi possível criar a conta",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  static async logout(): Promise<boolean> {
    try {
      const result = await authService.logout();
      
      if (result.success) {
        return true;
      } else {
        toast({
          title: "Erro ao sair",
          description: result.error?.message || "Não foi possível sair",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }
  
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
      
      const result = await authService.updateProfile(name);
      
      if (result.success) {
        toast({
          title: "Perfil atualizado",
          description: "Seu perfil foi atualizado com sucesso",
        });
        return true;
      } else {
        toast({
          title: "Erro na atualização",
          description: result.error?.message || "Não foi possível atualizar o perfil",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro na atualização",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  static async updatePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      if (!currentPassword) {
        toast({
          title: "Erro de validação",
          description: "Senha atual é obrigatória",
          variant: "destructive",
        });
        return false;
      }
      
      if (!UserModel.validatePassword(newPassword)) {
        toast({
          title: "Erro de validação",
          description: "Nova senha deve ter pelo menos 6 caracteres",
          variant: "destructive",
        });
        return false;
      }
      
      const result = await authService.updatePassword(currentPassword, newPassword);
      
      if (result.success) {
        toast({
          title: "Senha atualizada",
          description: "Sua senha foi atualizada com sucesso",
        });
        return true;
      } else {
        toast({
          title: "Erro na atualização",
          description: result.error?.message || "Não foi possível atualizar a senha",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro na atualização",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  static async isAuthenticated(): Promise<boolean> {
    return await authService.isAuthenticated();
  }
  
  static async getCurrentUser() {
    return await authService.getCurrentUser();
  }
}
