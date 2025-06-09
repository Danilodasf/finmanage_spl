import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AuthLayout } from '../../components/Layout/AuthLayout';
import { useAuthContext } from '../../hooks/useAuth';
import { validateEmail, validateRequired, errorMessages } from '../../utils/validations';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthContext();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    try {
      console.log('[Register] =================================');
      console.log('[Register] Iniciando processo de registro');
      console.log('[Register] Dados do formulário:', { 
        name: formData.name, 
        email: formData.email, 
        passwordLength: formData.password.length,
        confirmPasswordLength: formData.confirmPassword.length
      });
      
      // Validação de confirmação de senha
      if (formData.password !== formData.confirmPassword) {
        console.error('[Register] Senhas não coincidem');
        alert('As senhas não coincidem');
        setIsLoading(false);
        return;
      }

      console.log('[Register] Validações básicas passaram');
      console.log('[Register] Chamando register do hook...');
      
      const result = await register(
        formData.email,
        formData.password,
        formData.name
      );
      
      console.log('[Register] Resultado completo do registro:', {
        success: result.success,
        error: result.error,
        hasUser: !!result.user,
        userId: result.user?.id
      });
      
      if (result.success) {
        console.log('[Register] ✅ Registro bem-sucedido!');
        console.log('[Register] Usuário criado:', result.user);
        alert('Usuário criado com sucesso! Redirecionando para login...');
        navigate('/login');
      } else {
        console.error('[Register] ❌ Falha no registro:', result.error);
        alert(result.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('[Register] ❌ Erro crítico no registro:', error);
      console.error('[Register] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      alert('Erro interno. Tente novamente.');
    }
    
    console.log('[Register] Finalizando processo de registro');
    console.log('[Register] =================================');
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
            onChange={(e) => {
              handleInputChange(e);
              // Limpa erro quando usuário digita
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: '' }));
              }
            }}
            onBlur={() => {
              if (!validateRequired(formData.name)) {
                setErrors(prev => ({ ...prev, name: errorMessages.required }));
              }
            }}
            className={errors.name ? 'border-red-500' : ''}
            required
            placeholder="Ex: João Silva"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              handleInputChange(e);
              // Limpa erro quando usuário digita
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: '' }));
              }
            }}
            onBlur={() => {
              if (!validateRequired(formData.email)) {
                setErrors(prev => ({ ...prev, email: errorMessages.required }));
              } else if (!validateEmail(formData.email)) {
                setErrors(prev => ({ ...prev, email: errorMessages.email }));
              }
            }}
            className={errors.email ? 'border-red-500' : ''}
            required
            placeholder="Ex: joao.silva@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
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