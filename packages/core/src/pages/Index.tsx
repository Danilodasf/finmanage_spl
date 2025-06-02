
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Shield, Users } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">FinManage</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Entrar
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Cadastrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Gerencie suas
            <span className="text-green-600 block">Finanças Pessoais</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            O FinManage é a solução completa para controlar suas receitas, despesas e investimentos
            de forma simples e intuitiva.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Controle de Gastos</h3>
            <p className="text-gray-600">Monitore todas suas despesas e receitas em tempo real</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios Detalhados</h3>
            <p className="text-gray-600">Visualize gráficos e relatórios sobre sua situação financeira</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
            <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Segurança Total</h3>
            <p className="text-gray-600">Seus dados protegidos com criptografia de ponta</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
            <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fácil de Usar</h3>
            <p className="text-gray-600">Interface intuitiva para toda a família</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
