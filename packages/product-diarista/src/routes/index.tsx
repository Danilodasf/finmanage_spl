import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importar as telas
import Login from '../views/auth/Login';
import Register from '../views/auth/Register';
import Dashboard from '../views/Dashboard';
import Transactions from '../views/Transactions';
import Categories from '../views/Categories';
import Reports from '../views/Reports';
import Settings from '../views/Settings';
import Services from '../views/Services';
import ServiceProfits from '../views/ServiceProfits';

// Componente de layout principal
import Layout from '../components/Layout';

// Importar o hook de autenticação correto
import { useAuthContext } from '../hooks/useAuth';

// Hook para verificar autenticação
const useAuth = () => {
  return useAuthContext();
};

// Componente para rotas protegidas
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Aguarda o carregamento da verificação de autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Layout>
      {children}
    </Layout>
  );
};

// Componente para rotas públicas (apenas para usuários não autenticados)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Aguarda o carregamento da verificação de autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Componente principal de roteamento
const AppRoutes: React.FC = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Rotas Públicas (Autenticação) */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Rotas Protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services" 
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/service-profits" 
          element={
            <ProtectedRoute>
              <ServiceProfits />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota padrão - redirecionar para login */}
        <Route 
          path="/" 
          element={
            <Navigate to="/login" replace />
          } 
        />
        
        {/* Rota 404 - página não encontrada */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Página não encontrada</p>
                <a 
                  href="/dashboard" 
                  className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700"
                >
                  Voltar ao Dashboard
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

// Exportar também o hook de autenticação para uso em outros componentes
export { useAuth };