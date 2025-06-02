import { LoginCredentials, RegisterData, UserModel } from '@/models/User';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
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

      // Registrar usuário no Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });
      
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Criar perfil do usuário
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: userData.name,
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Não falhar o registro se apenas o perfil falhar
        }
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
  
  static async logout(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
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
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return false;
      }
      
      // Atualizar metadados do usuário
      const { error: authError } = await supabase.auth.updateUser({
        data: { name }
      });
      
      if (authError) {
        toast({
          title: "Erro na atualização",
          description: authError.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);
        
      if (profileError) {
        toast({
          title: "Erro na atualização do perfil",
          description: profileError.message,
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
      
      // Atualizar senha
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        toast({
          title: "Erro na atualização da senha",
          description: error.message,
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