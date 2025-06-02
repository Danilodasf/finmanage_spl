/**
 * Interface base para serviços de entidades
 * Define operações CRUD comuns para todos os serviços
 */
export interface BaseEntityService<T, ID = string> {
  /**
   * Busca todos os registros
   */
  getAll(): Promise<{ data: T[] | null; error: Error | null }>;
  
  /**
   * Busca um registro pelo ID
   * @param id ID do registro
   */
  getById(id: ID): Promise<{ data: T | null; error: Error | null }>;
  
  /**
   * Cria um novo registro
   * @param entity Dados do registro
   */
  create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: T | null; error: Error | null }>;
  
  /**
   * Atualiza um registro existente
   * @param id ID do registro
   * @param entity Dados para atualização
   */
  update(id: ID, entity: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: T | null; error: Error | null }>;
  
  /**
   * Remove um registro
   * @param id ID do registro
   */
  delete(id: ID): Promise<{ success: boolean; error: Error | null }>;
}

/**
 * Interface base para serviços de autenticação
 */
export interface AuthService {
  /**
   * Realiza login de usuário
   * @param email Email do usuário
   * @param password Senha do usuário
   */
  signIn(email: string, password: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Registra um novo usuário
   * @param email Email do usuário
   * @param password Senha do usuário
   * @param name Nome do usuário
   */
  signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Realiza logout do usuário
   */
  signOut(): Promise<void>;
  
  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): Promise<boolean>;
  
  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): Promise<any | null>;
  
  /**
   * Atualiza o perfil do usuário
   * @param name Nome do usuário
   */
  updateProfile(name: string): Promise<{ success: boolean; error?: string }>;
  
  /**
   * Atualiza a senha do usuário
   * @param newPassword Nova senha do usuário
   */
  updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }>;
}

/**
 * Interface base para serviços de armazenamento
 */
export interface StorageService {
  /**
   * Armazena um item
   * @param key Chave do item
   * @param value Valor do item
   */
  setItem(key: string, value: any): Promise<void>;
  
  /**
   * Recupera um item
   * @param key Chave do item
   */
  getItem<T>(key: string): Promise<T | null>;
  
  /**
   * Remove um item
   * @param key Chave do item
   */
  removeItem(key: string): Promise<void>;
  
  /**
   * Limpa todos os itens
   */
  clear(): Promise<void>;
} 