import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-emerald-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Página não encontrada</h2>
        <p className="text-gray-600 mb-8">
          A página que você está procurando não existe ou foi removida.
        </p>
        
        <Link to="/">
          <Button className="bg-emerald-800 hover:bg-emerald-700">
            <Home className="mr-2 h-4 w-4" />
            Voltar para o início
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 