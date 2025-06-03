import { LoginCredentials, RegisterData, UserModel } from '@/models/User';
import { toast } from '@/hooks/use-toast';

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

      // Simulação de login - aqui seria integrado com a API real
      console.log('Tentativa de login MEI:', credentials);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao FinManage MEI",
      });
      
      return true;
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

      // Simulação de cadastro - aqui seria integrado com a API real
      console.log('Tentativa de cadastro MEI:', userData);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada. Faça login para continuar.",
      });
      
      return true;
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
      // Simulação de logout - aqui seria integrado com a API real
      console.log('Realizando logout MEI');
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
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
      
      // Simulação de atualização - aqui seria integrado com a API real
      console.log('Atualizando perfil MEI:', { name });
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return true;
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
      
      // Simulação de atualização - aqui seria integrado com a API real
      console.log('Atualizando senha MEI');
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return true;
    } catch (error) {
      toast({
        title: "Erro na atualização",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }
} 