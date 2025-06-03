import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Settings, LogOut, LayoutDashboard, Receipt, FolderOpen, BarChart, Bell } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { AuthController } from '../../controllers/AuthController';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Chamar o método de logout do AuthController
    const success = await AuthController.logout();
    
    if (success) {
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
      navigate('/login');
    }
    
    setIsLoggingOut(false);
  };

  return (
    <div className="flex min-h-screen bg-emerald-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md border-r flex flex-col h-screen fixed">
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-800">FinManage MEI</h1>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-white rounded-full p-2 h-8 w-8 flex items-center justify-center shadow-sm border border-emerald-800"
            >
              <Bell className="h-4 w-4 text-emerald-800" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard-di">
                <Button 
                  className={`w-full justify-start ${isActive('/dashboard-di') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}`}
                  variant={isActive('/dashboard-di') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/transactions">
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
              <Link to="/categories">
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
              <Link to="/reports">
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
              <Link to="/settings">
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
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}; 