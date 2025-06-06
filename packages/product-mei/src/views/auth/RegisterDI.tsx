import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AuthLayout } from '../../components/Layout/AuthLayout';
import { DIAuthController } from '../../controllers/DIAuthController';
import { RegisterData } from '../../lib/core-exports';

/**
 * Componente de Registro que utiliza injeção de dependência
 */
const RegisterDI: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    const success = await DIAuthController.register(formData);
    
    if (success) {
      navigate('/login-di');
    }
    
    setIsLoading(false);
  };

  return (
    <AuthLayout 
      title="Criar Conta"
      subtitle="Registre-se para acessar o FinManage MEI"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Seu nome completo"
          />
        </div>

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
            placeholder="Mínimo de 6 caracteres"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            placeholder="Repita sua senha"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-800 hover:bg-emerald-700"
        >
          {isLoading ? 'Registrando...' : 'Registrar'}
        </Button>

        <div className="text-center">
          <Link to="/login-di" className="text-sm text-black hover:underline">
            Já tem uma conta? Entrar
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterDI;