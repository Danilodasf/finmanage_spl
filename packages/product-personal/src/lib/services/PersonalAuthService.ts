import { AuthService } from '@finmanage/core/services';
import { supabase } from '../supabase';

/**
 * Implementação do serviço de autenticação para o produto Personal
 */
export class PersonalAuthService implements AuthService {
  /**
   * Realiza login de usuário
   * @param email Email do usuário
   * @param password Senha do usuário
   */
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Ocorreu um erro inesperado. Tente novamente.' };
    }
  }
  
  /**
   * Registra um novo usuário
   * @param email Email do usuário
   * @param password Senha do usuário
   * @param name Nome do usuário
   */
  async signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Registrar usuário no Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Criar perfil do usuário
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Não falhar o registro se apenas o perfil falhar
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, error: 'Ocorreu um erro inesperado. Tente novamente.' };
    }
  }
  
  /**
   * Realiza logout do usuário
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }
  
  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }
  
  /**
   * Obtém o usuário atual
   */
  async getCurrentUser(): Promise<any | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
  
  /**
   * Atualiza o perfil do usuário
   * @param name Nome do usuário
   */
  async updateProfile(name: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }
      
      // Atualizar metadados do usuário
      const { error: authError } = await supabase.auth.updateUser({
        data: { name }
      });
      
      if (authError) {
        return { success: false, error: authError.message };
      }
      
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);
        
      if (profileError) {
        return { success: false, error: profileError.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro na atualização do perfil:', error);
      return { success: false, error: 'Ocorreu um erro inesperado. Tente novamente.' };
    }
  }
  
  /**
   * Atualiza a senha do usuário
   * @param newPassword Nova senha do usuário
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Atualizar senha
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro na atualização da senha:', error);
      return { success: false, error: 'Ocorreu um erro inesperado. Tente novamente.' };
    }
  }
} 