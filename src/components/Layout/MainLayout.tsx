
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">FinManage</h1>
            
            <div className="flex space-x-4">
              <Link to="/dashboard">
                <Button 
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/transactions">
                <Button 
                  variant={isActive('/transactions') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Transações
                </Button>
              </Link>
              <Link to="/categories">
                <Button 
                  variant={isActive('/categories') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Categorias
                </Button>
              </Link>
              <Link to="/reports">
                <Button 
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
