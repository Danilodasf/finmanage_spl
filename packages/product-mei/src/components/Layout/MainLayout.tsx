import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Settings, LogOut, LayoutDashboard, Receipt, FolderOpen, BarChart, Bell, FileText } from 'lucide-react';
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
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Dados de exemplo para notificações
  const notifications = [
    { id: 1, message: "Bem-vindo ao FinManage MEI!", date: "Hoje" },
    { id: 2, message: "Sua assinatura está ativa.", date: "Ontem" },
  ];

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

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
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
              onClick={toggleNotifications}
            >
              <Bell className="h-4 w-4 text-emerald-800" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </Button>
            
            {/* Popup de notificações */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">Notificações</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div>
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Nenhuma notificação
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-200">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-emerald-800 hover:text-emerald-700">
                    Ver todas
                  </Button>
                </div>
              </div>
            )}
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
              <Link to="/imposto-das">
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