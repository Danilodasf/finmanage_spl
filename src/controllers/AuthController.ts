
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
      console.log('Tentativa de login:', credentials);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao FinManage",
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
      console.log('Tentativa de cadastro:', userData);
      
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
}
