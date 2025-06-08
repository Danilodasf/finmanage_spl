import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AuthLayout } from '../../components/Layout/AuthLayout';
import { DIAuthController } from '../../controllers/DIAuthController';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
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

    const { confirmPassword, ...registerData } = formData;
    const result = await DIAuthController.register(registerData);
    
    if (result.success) {
      navigate('/login');
    }
    
    setIsLoading(false);
  };

  return (
    <AuthLayout 
      title="Criar Conta"
      subtitle="Cadastre-se no sistema"
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
            placeholder="Ex: João Silva"
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
            placeholder="Ex: joao.silva@email.com"
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
            placeholder="Ex: Senha@123"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            placeholder="Ex: Senha@123"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-800 hover:bg-emerald-700 text-white"
        >
          {isLoading ? 'Criando conta...' : 'Criar conta'}
        </Button>

        <div className="text-center">
          <Link to="/login" className="text-sm text-black hover:underline">
            Já tem conta? Entrar
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;