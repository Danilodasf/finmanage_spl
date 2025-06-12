/**
 * Interface base para serviços de entidades do sistema
 * 
 * Define um contrato padrão com operações CRUD (Create, Read, Update, Delete)
 * que deve ser implementado por todos os serviços que gerenciam entidades.
 * Garante consistência na API e facilita a manutenção do código.
 * 
 * @template T Tipo da entidade gerenciada pelo serviço
 * @template ID Tipo do identificador da entidade (padrão: string)
 */
export interface BaseEntityService<T, ID = string> {
  /**
   * Busca todos os registros da entidade
   * 
   * Retorna uma lista completa de todas as entidades do tipo T
   * associadas ao usuário autenticado.
   * 
   * @returns Promise com array de entidades ou erro
   */
  getAll(): Promise<{ data: T[] | null; error: Error | null }>;
  
  /**
   * Busca um registro específico pelo identificador
   * 
   * Localiza e retorna uma única entidade baseada no ID fornecido,
   * garantindo que pertença ao usuário autenticado.
   * 
   * @param id Identificador único do registro
   * @returns Promise com a entidade encontrada ou erro
   */
  getById(id: ID): Promise<{ data: T | null; error: Error | null }>;
  
  /**
   * Cria um novo registro da entidade
   * 
   * Insere uma nova entidade no sistema, excluindo campos
   * gerenciados automaticamente (id, created_at, updated_at).
   * 
   * @param entity Dados da entidade a ser criada
   * @returns Promise com a entidade criada ou erro
   */
  create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: T | null; error: Error | null }>;
  
  /**
   * Atualiza um registro existente
   * 
   * Modifica campos específicos de uma entidade existente,
   * preservando campos não fornecidos e atualizando automaticamente
   * o timestamp de modificação.
   * 
   * @param id Identificador do registro a ser atualizado
   * @param entity Dados parciais para atualização
   * @returns Promise com a entidade atualizada ou erro
   */
  update(id: ID, entity: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: T | null; error: Error | null }>;
  
  /**
   * Remove permanentemente um registro
   * 
   * Exclui definitivamente uma entidade do sistema.
   * Esta operação é irreversível.
   * 
   * @param id Identificador do registro a ser removido
   * @returns Promise com status de sucesso ou erro
   */
  delete(id: ID): Promise<{ success: boolean; error: Error | null }>;
}

/**
 * Interface base para serviços de autenticação do sistema
 * 
 * Define o contrato padrão para operações de autenticação,
 * incluindo login, registro, logout e gerenciamento de perfil.
 * Esta interface garante consistência entre diferentes
 * implementações de autenticação.
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
   * @param currentPassword Senha atual do usuário (opcional)
   */
  updatePassword(newPassword: string, currentPassword?: string): Promise<{ success: boolean; error?: string }>;
}

/**
 * Interface base para serviços de armazenamento local
 * 
 * Define operações padrão para persistência de dados no cliente,
 * como localStorage, sessionStorage ou outras implementações
 * de armazenamento local. Permite abstrair a implementação
 * específica de armazenamento.
 */
export interface StorageService {
  /**
   * Armazena um item no armazenamento local
   * 
   * Persiste um valor associado a uma chave específica.
   * O valor é automaticamente serializado se necessário.
   * 
   * @param key Identificador único do item
   * @param value Valor a ser armazenado (qualquer tipo serializável)
   */
  setItem(key: string, value: any): Promise<void>;
  
  /**
   * Recupera um item do armazenamento local
   * 
   * Busca e deserializa um valor baseado na chave fornecida.
   * Retorna null se o item não existir.
   * 
   * @template T Tipo esperado do valor recuperado
   * @param key Identificador do item a ser recuperado
   * @returns Promise com o valor encontrado ou null
   */
  getItem<T>(key: string): Promise<T | null>;
  
  /**
   * Remove um item específico do armazenamento
   * 
   * Exclui permanentemente o item associado à chave fornecida.
   * 
   * @param key Identificador do item a ser removido
   */
  removeItem(key: string): Promise<void>;
  
  /**
   * Limpa completamente o armazenamento local
   * 
   * Remove todos os itens armazenados. Esta operação
   * é irreversível e deve ser usada com cuidado.
   */
  clear(): Promise<void>;
}