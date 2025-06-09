/**
 * Interfaces de serviço
 * Versão simplificada baseada no @finmanage/core
 */

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  user: User;
  token: string;
  expires_at: Date;
}

export interface AuthService {
  login(email: string, password: string): Promise<ServiceResult<Session>>;
  register(email: string, password: string, name: string): Promise<ServiceResult<Session>>;
  logout(): Promise<ServiceResult<void>>;
  getCurrentUser(): Promise<ServiceResult<User>>;
  updateProfile(data: Partial<User>): Promise<ServiceResult<User>>;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryDTO {
  name: string;
  type: CategoryType;
}

export interface UpdateCategoryDTO {
  name?: string;
  type?: CategoryType;
}

export interface CategoryService {
  getAll(): Promise<{ data: Category[] | null; error: Error | null }>;
  getById(id: string): Promise<{ data: Category | null; error: Error | null }>;
  create(data: CreateCategoryDTO): Promise<{ data: Category | null; error: Error | null }>;
  update(id: string, data: UpdateCategoryDTO): Promise<{ data: Category | null; error: Error | null }>;
  delete(id: string): Promise<{ data: boolean | null; error: Error | null }>;
  getByUserId(userId: string): Promise<{ data: Category[] | null; error: Error | null }>;
  getByType(type: 'income' | 'expense'): Promise<{ data: Category[] | null; error: Error | null }>;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category_id: string;
  description: string;
  value: number;
  date: Date;
  payment_method?: string;
  created_at: Date;
  updated_at: Date;
  servico_id?: string;
  gasto_servico_id?: string;
  is_auto_generated?: boolean;
}

export interface CreateTransactionDTO {
  user_id: string;
  type: 'income' | 'expense';
  category_id: string;
  description: string;
  value: number;
  date: Date;
  payment_method?: string;
}

export interface UpdateTransactionDTO {
  type?: 'income' | 'expense';
  category_id?: string;
  description?: string;
  value?: number;
  date?: Date;
  payment_method?: string;
}

export interface TransactionService {
  getAll(): Promise<{ data: Transaction[] | null; error: Error | null }>;
  getById(id: string): Promise<{ data: Transaction | null; error: Error | null }>;
  create(data: CreateTransactionDTO): Promise<{ data: Transaction | null; error: Error | null }>;
  update(id: string, data: UpdateTransactionDTO): Promise<{ data: Transaction | null; error: Error | null }>;
  delete(id: string): Promise<{ data: boolean | null; error: Error | null }>;
  getByUserId(userId: string): Promise<{ data: Transaction[] | null; error: Error | null }>;
  getByCategory(categoryId: string): Promise<{ data: Transaction[] | null; error: Error | null }>;
  getByDateRange(startDate: Date, endDate: Date): Promise<{ data: Transaction[] | null; error: Error | null }>;
}

export interface StorageService {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface ApiService {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: any): Promise<T>;
  put<T>(endpoint: string, data: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

export interface HttpClient {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
}