import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Target, LineChart, Layers, Database, TrendingUp, CircleCheck, RefreshCw, ListTree, FileWarning, BarChart3, CreditCard, PiggyBank, FolderOpen, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DIAuthController } from '@/controllers/DIAuthController';

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
    
    // Chamar o método de logout do DIAuthController
    const success = await DIAuthController.logout();
    
    if (success) {
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
      navigate('/login-di');
    }
    
    setIsLoggingOut(false);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex">
      {/* Sidebar Lateral Esquerda */}
      <aside className="w-64 bg-white shadow-lg border-r border-emerald-100 flex flex-col">
        {/* Header da Sidebar */}
        <div className="p-6 border-b border-emerald-100">
          <h1 className="text-xl font-bold text-emerald-800">FinManage Personal</h1>
        </div>
        
        {/* Menu de Navegação */}
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard">
            <Button 
              className={`w-full justify-start ${isActive('/dashboard') || isActive('/dashboard-di') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : 'hover:bg-emerald-50'}`}
              variant={isActive('/dashboard') || isActive('/dashboard-di') ? 'default' : 'ghost'}
              size="sm"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
          </Link>
          
          <Link to="/transactions">
            <Button 
              className={`w-full justify-start ${isActive('/transactions') || isActive('/transactions-di') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : 'hover:bg-emerald-50'}`}
              variant={isActive('/transactions') || isActive('/transactions-di') ? 'default' : 'ghost'}
              size="sm"
            >
              <CreditCard className="w-4 h-4 mr-3" />
              Transações
            </Button>
          </Link>
          
          <Link to="/investments">
            <Button 
              className={`w-full justify-start ${isActive('/investments') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : 'hover:bg-emerald-50'}`}
              variant={isActive('/investments') ? 'default' : 'ghost'}
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-3" />
              Investimentos
            </Button>
          </Link>
          
          <Link to="/categories">
            <Button 
              className={`w-full justify-start ${isActive('/categories') || isActive('/categories-di') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : 'hover:bg-emerald-50'}`}
              variant={isActive('/categories') || isActive('/categories-di') ? 'default' : 'ghost'}
              size="sm"
            >
              <FolderOpen className="w-4 h-4 mr-3" />
              Categorias
            </Button>
          </Link>
          
          <Link to="/goals">
            <Button 
              className={`w-full justify-start ${isActive('/goals') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : 'hover:bg-emerald-50'}`}
              variant={isActive('/goals') ? 'default' : 'ghost'}
              size="sm"
            >
              <Target className="w-4 h-4 mr-3" />
              Objetivos
            </Button>
          </Link>
          
          <Link to="/budgets">
            <Button 
              className={`w-full justify-start ${isActive('/budgets') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : 'hover:bg-emerald-50'}`}
              variant={isActive('/budgets') ? 'default' : 'ghost'}
              size="sm"
            >
              <PiggyBank className="w-4 h-4 mr-3" />
              Orçamentos
            </Button>
          </Link>
          
          <Link to="/reports">
            <Button 
              className={`w-full justify-start ${isActive('/reports') || isActive('/reports-di') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : 'hover:bg-emerald-50'}`}
              variant={isActive('/reports') || isActive('/reports-di') ? 'default' : 'ghost'}
              size="sm"
            >
              <FileText className="w-4 h-4 mr-3" />
              Relatórios
            </Button>
          </Link>
          
          <Link to="/settings">
            <Button 
              className={`w-full justify-start ${isActive('/settings') || isActive('/settings-di') ? 'bg-emerald-800 hover:bg-emerald-700 text-white' : 'hover:bg-emerald-50'}`}
              variant={isActive('/settings') || isActive('/settings-di') ? 'default' : 'ghost'}
              size="sm"
            >
              <Settings className="w-4 h-4 mr-3" />
              Configurações
            </Button>
          </Link>
        </nav>
        
        {/* Botão de Logout na parte inferior */}
        <div className="p-4 border-t border-emerald-100">
          <Button 
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </Button>
        </div>
      </aside>
      
      {/* Conteúdo Principal */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};