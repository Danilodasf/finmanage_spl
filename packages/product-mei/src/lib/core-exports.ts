// Re-exportar os módulos do core necessários para o produto MEI

// Importar diretamente dos arquivos fonte
import { DIContainer } from '../../../core/src/lib/di/container';
import { CATEGORY_SERVICE, AUTH_SERVICE } from '../../../core/src/lib/di/tokens';
import { toast, useToast } from '../../../core/src/hooks/use-toast';
import { BaseEntityService } from '../../../core/src/lib/services/base';

// Definir a interface Category localmente
export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa' | 'ambos' | 'investimento';
  color?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

// Definir a interface CategoryService localmente
export interface CategoryService extends BaseEntityService<Category> {
  getByType(type: 'receita' | 'despesa' | 'ambos' | 'investimento'): Promise<{ data: Category[] | null; error: Error | null }>;
}

// Definir interfaces para autenticação
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Definir a interface AuthService
export interface AuthService {
  login(credentials: LoginCredentials): Promise<{ success: boolean; error: Error | null }>;
  register(userData: RegisterData): Promise<{ success: boolean; error: Error | null }>;
  logout(): Promise<{ success: boolean; error: Error | null }>;
  updateProfile(name: string): Promise<{ success: boolean; error: Error | null }>;
  updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error: Error | null }>;
}

// Re-exportar
export {
  DIContainer,
  CATEGORY_SERVICE,
  AUTH_SERVICE,
  toast,
  useToast
}; 