import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  CreditCard, 
  FolderOpen, 
  BarChart3,
  Menu,
  X,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { DIAuthController } from '../controllers/DIAuthController';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Chamar o método de logout do DIAuthController
      const authController = new DIAuthController();
      await authController.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Sempre redirecionar para login, independente do resultado
      navigate('/login');
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      path: '/transactions',
      icon: CreditCard,
      label: 'Transações'
    },
    {
      path: '/categories',
      icon: FolderOpen,
      label: 'Categorias'
    },
    {
      path: '/services',
      icon: Briefcase,
      label: 'Serviços'
    },
    {
      path: '/service-profits',
      icon: TrendingUp,
      label: 'Lucro por Serviço'
    },
    {
      path: '/reports',
      icon: BarChart3,
      label: 'Relatórios'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Configurações'
    }
  ];

  return (
    <div className="min-h-screen bg-emerald-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      } flex flex-col`}>
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <h1 className="text-lg font-bold text-emerald-800 truncate">
                FinManage Diarista
              </h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              {isSidebarOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path}>
                  <Link to={item.path}>
                    <Button
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className={`w-full justify-start ${
                        isActive(item.path)
                          ? 'bg-emerald-800 hover:bg-emerald-700 text-white'
                          : 'hover:bg-emerald-50'
                      } ${!isSidebarOpen ? 'px-2' : ''}`}
                    >
                      <IconComponent className={`w-5 h-5 ${
                        isSidebarOpen ? 'mr-3' : ''
                      }`} />
                      {isSidebarOpen && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="px-4 pb-4">
          <Button
            variant="ghost"
            className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${
              !isSidebarOpen ? 'px-2' : ''
            }`}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className={`w-5 h-5 ${
              isSidebarOpen ? 'mr-3' : ''
            }`} />
            {isSidebarOpen && (
              <span className="truncate">
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </span>
            )}
          </Button>
        </div>

        {/* Spacer para empurrar conteúdo para baixo se necessário */}
        <div className="flex-1"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar (opcional, para breadcrumbs ou ações) */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Breadcrumb ou título da página atual */}
              <h2 className="text-xl font-semibold text-gray-800">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Página'}
              </h2>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;