import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AuthController } from '@/controllers/AuthController';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <div className="min-h-screen bg-emerald-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-emerald-800">FinManage MEI</h1>
            
            <div className="flex space-x-4">
              <Link to="/dashboard">
                <Button 
                  className={isActive('/dashboard') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/transactions">
                <Button 
                  className={isActive('/transactions') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}
                  variant={isActive('/transactions') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Transações
                </Button>
              </Link>
              <Link to="/categories">
                <Button 
                  className={isActive('/categories') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}
                  variant={isActive('/categories') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Categorias
                </Button>
              </Link>
              <Link to="/reports">
                <Button 
                  className={isActive('/reports') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}
                  variant={isActive('/reports') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Relatórios
                </Button>
              </Link>
              <Link to="/settings">
                <Button 
                  className={isActive('/settings') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : ''}
                  variant={isActive('/settings') ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Configurações
                </Button>
              </Link>
              <Button 
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-1" />
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}; 