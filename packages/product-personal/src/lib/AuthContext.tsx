import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean, error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean, error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string, avatar_url?: string }) => Promise<{ success: boolean, error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Registrar novo usuário
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // Criar usuário na autenticação
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
            name: name,
          });

        if (profileError) {
          return { success: false, error: profileError.message };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { success: false, error: 'Ocorreu um erro ao criar sua conta.' };
    } finally {
      setLoading(false);
    }
  };

  // Login de usuário
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, error: 'Ocorreu um erro ao fazer login.' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil
  const updateProfile = async (data: { name?: string, avatar_url?: string }) => {
    try {
      setLoading(true);
      
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }
      
      // Atualizar metadados do usuário
      if (data.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: data.name }
        });
        
        if (authError) {
          return { success: false, error: authError.message };
        }
      }
      
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (profileError) {
        return { success: false, error: profileError.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: 'Ocorreu um erro ao atualizar seu perfil.' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Componente para proteger rotas
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return session ? <>{children}</> : null;
}; 