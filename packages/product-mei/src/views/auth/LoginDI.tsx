import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AuthLayout } from '../../components/Layout/AuthLayout';
import { DIAuthController } from '../../controllers/DIAuthController';
import { LoginCredentials } from '../../lib/core-exports';

/**
 * Componente de Login que utiliza injeção de dependência
 */
const LoginDI: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Utilizando o DIAuthController em vez do AuthController
    const success = await DIAuthController.login(formData);
    
    if (success) {
      navigate('/dashboard-di');
    }
    
    setIsLoading(false);
  };

  return (
    <AuthLayout 
      title="Entrar (DI)"
      subtitle="Acesse sua conta MEI com DI"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="exemplo@email.com"
          />
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder="senha123"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-800 hover:bg-emerald-700"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>

        <div className="text-center">
          <Link to="/register-di" className="text-sm text-black hover:underline">
            Criar conta
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginDI; 