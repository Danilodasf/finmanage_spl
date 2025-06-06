import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Settings, LogOut, LayoutDashboard, Receipt, FolderOpen, BarChart, Bell, FileText, ShoppingBag, Menu, X } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { DIAuthController } from '../../controllers/DIAuthController';

// Exportar interface e funções de notificação para reutilização
export interface Notification {
  id: number;
  message: string;
  date: string;
  read?: boolean;
}

export interface NotificationProps {
  notifications: Notification[];
  notificationsCount: number;
  showNotifications: boolean;
  toggleNotifications: () => void;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Chamar o método de logout do DIAuthController
    const success = await DIAuthController.logout();
    
    if (success) {
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
      navigate('/login');
    }
    
    setIsLoggingOut(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-emerald-50">
      {/* Botão de toggle para mobile */}
      <div className={`fixed z-50 top-4 ${sidebarOpen ? 'left-64' : 'left-4'} md:hidden`}>
        <Button
          variant="outline"
          size="sm"
          className="bg-white rounded-full p-2 h-8 w-8 flex items-center justify-center shadow-md border border-emerald-800"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <X className="h-4 w-4 text-emerald-800" /> : <Menu className="h-4 w-4 text-emerald-800" />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white shadow-md border-r flex flex-col h-screen fixed transition-transform duration-300 ease-in-out z-40`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-800">FinManage MEI</h1>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white rounded-full p-2 h-8 w-8 flex items-center justify-center shadow-sm border border-emerald-800 md:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-4 w-4 text-emerald-800" />
          </Button>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
                <Button 
                  className={`w-full justify-start ${isActive('/dashboard') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}`}
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/transactions" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
                <Button 
                  className={`w-full justify-start ${isActive('/transactions') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}`}
                  variant={isActive('/transactions') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Transações
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/vendas" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
                <Button 
                  className={`w-full justify-start ${isActive('/vendas') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}`}
                  variant={isActive('/vendas') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Vendas
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/imposto-das" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
                <Button 
                  className={`w-full justify-start ${isActive('/imposto-das') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}`}
                  variant={isActive('/imposto-das') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Imposto DAS
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/categories" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
                <Button 
                  className={`w-full justify-start ${isActive('/categories') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}`}
                  variant={isActive('/categories') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Categorias
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/reports" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
                <Button 
                  className={`w-full justify-start ${isActive('/reports') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}`}
                  variant={isActive('/reports') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Relatórios
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/settings" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
                <Button 
                  className={`w-full justify-start ${isActive('/settings') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}`}
                  variant={isActive('/settings') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t mt-auto">
          <Button 
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className={`${sidebarOpen ? 'md:ml-64' : 'ml-0'} flex-1 p-8 transition-all duration-300 ease-in-out w-full`}>
        {children}
      </main>
    </div>
  );
};