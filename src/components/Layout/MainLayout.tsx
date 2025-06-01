import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-emerald-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-emerald-800">FinManage</h1>
            
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
