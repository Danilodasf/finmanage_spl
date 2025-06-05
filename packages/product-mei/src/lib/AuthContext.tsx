import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthController } from '../controllers/AuthController';
import { User } from '../models/User';
import { DICategoryController } from '../controllers/DICategoryController';
import { ensureUserProfile } from './supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await AuthController.isAuthenticated();
        
        if (isAuth) {
          const currentUser = await AuthController.getCurrentUser();
          setUser(currentUser);
          
          // Garantir que o perfil do usuário exista no Supabase
          console.log('AuthContext - Garantindo que o perfil do usuário exista...');
          const profileExists = await ensureUserProfile();
          console.log('AuthContext - Perfil do usuário existe?', profileExists);
          
          // Garantir que o usuário tenha categorias padrão
          if (profileExists) {
            console.log('AuthContext - Garantindo categorias padrão...');
            await DICategoryController.ensureDefaultCategories();
          } else {
            console.error('AuthContext - Não foi possível garantir o perfil do usuário');
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        setError('Erro ao verificar autenticação');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Componente para proteger rotas
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AuthController.isAuthenticated();
      if (!isAuth) {
        navigate('/login');
      }
    };
    
    if (!loading) {
      checkAuth();
    }
  }, [loading, navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : null;
}; 