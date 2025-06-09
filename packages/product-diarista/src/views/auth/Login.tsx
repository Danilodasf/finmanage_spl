import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AuthLayout } from '../../components/Layout/AuthLayout';
import { useAuthContext } from '../../hooks/useAuth';
import { validateEmail, validateRequired, errorMessages } from '../../utils/validations';

interface LoginCredentials {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: ''
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

    console.log('[Login] Iniciando processo de login com:', { email: formData.email, password: '***' });
    
    try {
      const result = await login(formData.email, formData.password);
      console.log('[Login] Resultado do login:', result);
      
      if (result.success) {
        console.log('[Login] Login bem-sucedido, navegando para dashboard');
        navigate('/dashboard');
      } else {
        console.error('[Login] Falha no login:', result.error);
        alert(result.error || 'Erro no login');
      }
    } catch (error) {
      console.error('[Login] Erro durante o login:', error);
      alert('Erro interno. Tente novamente.');
    }
    
    setIsLoading(false);
  };

  return (
    <AuthLayout 
      title="Entrar"
      subtitle="Acesse sua conta"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="exemplo@email.com"
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
            placeholder="senha123"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-800 hover:bg-emerald-700 text-white"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>

        <div className="text-center">
          <Link to="/register" className="text-sm text-black hover:underline">
            Criar conta
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;