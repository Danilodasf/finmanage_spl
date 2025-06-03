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

// Definir a interface Transaction
export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  date: string;
  value: number;
  description: string;
  categoryId: string;
  created_at?: string;
  updated_at?: string;
}

// Definir interface ReportData
export interface ReportData {
  transactions: Transaction[];
  categories: Category[];
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
}

// Definir tokens para serviços
export const REPORT_SERVICE = 'report-service';

// Definir a interface CategoryService localmente
export interface CategoryService extends BaseEntityService<Category> {
  getByType(type: 'receita' | 'despesa' | 'ambos' | 'investimento'): Promise<{ data: Category[] | null; error: Error | null }>;
}

// Definir a interface ReportService
export interface ReportService {
  generateReport(filters: {
    startDate: Date;
    endDate: Date;
    categoryId?: string;
    type?: 'receita' | 'despesa' | 'ambos';
  }): Promise<{ data: ReportData | null; error: Error | null }>;
  
  exportToPDF(reportData: ReportData): Promise<{ success: boolean; error: Error | null }>;
  
  getFinancialSummary(period: 'month' | 'quarter' | 'year'): Promise<{
    receitas: number;
    despesas: number;
    saldo: number;
    transactions: Transaction[];
  }>;
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