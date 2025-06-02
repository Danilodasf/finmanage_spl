/**
 * Container de Injeção de Dependências
 * 
 * Este container permite registrar e recuperar serviços em toda a aplicação,
 * facilitando a injeção de dependências e desacoplando os componentes.
 */
export class DIContainer {
  private static services: Map<string, any> = new Map();
  private static singletons: Map<string, any> = new Map();
  private static initialized: boolean = false;

  /**
   * Registra um serviço no container
   * @param token Identificador único do serviço
   * @param implementation Implementação do serviço
   */
  static register<T>(token: string, implementation: T): void {
    this.services.set(token, implementation);
    this.initialized = true;
  }

  /**
   * Registra uma classe como um serviço no container
   * @param token Identificador único do serviço
   * @param ServiceClass Classe do serviço
   * @param args Argumentos para o construtor do serviço
   */
  static registerClass<T>(token: string, ServiceClass: new (...args: any[]) => T, ...args: any[]): void {
    this.services.set(token, ServiceClass);
    this.services.set(`${token}:args`, args);
    this.initialized = true;
  }

  /**
   * Registra um singleton no container
   * @param token Identificador único do serviço
   * @param implementation Implementação do serviço ou classe construtora
   * @param args Argumentos para o construtor (se implementation for uma classe)
   */
  static registerSingleton<T>(token: string, implementation: T | (new (...args: any[]) => T), ...args: any[]): void {
    if (typeof implementation === 'function' && implementation.prototype && implementation.prototype.constructor) {
      // É uma classe, instanciar
      const instance = new (implementation as new (...args: any[]) => T)(...args);
      this.singletons.set(token, instance);
    } else {
      // É uma instância
      this.singletons.set(token, implementation);
    }
    this.initialized = true;
  }

  /**
   * Recupera um serviço do container
   * @param token Identificador único do serviço
   * @returns Instância do serviço
   */
  static get<T>(token: string): T {
    // Verificar primeiro se é um singleton
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    const service = this.services.get(token);
    if (!service) {
      throw new Error(`Serviço não registrado: ${token}`);
    }

    // Se for uma classe, instanciar
    if (typeof service === 'function' && service.prototype && service.prototype.constructor) {
      const args = this.services.get(`${token}:args`) || [];
      return new service(...args) as T;
    }

    return service as T;
  }

  /**
   * Verifica se um serviço está registrado no container
   * @param token Identificador único do serviço
   * @returns true se o serviço estiver registrado
   */
  static has(token: string): boolean {
    return this.services.has(token) || this.singletons.has(token);
  }

  /**
   * Remove um serviço do container
   * @param token Identificador único do serviço
   */
  static remove(token: string): void {
    this.services.delete(token);
    this.services.delete(`${token}:args`);
    this.singletons.delete(token);
  }

  /**
   * Limpa todos os serviços registrados
   */
  static clear(): void {
    this.services.clear();
    this.singletons.clear();
    this.initialized = false;
  }
  
  /**
   * Verifica se o container foi inicializado
   * @returns true se pelo menos um serviço foi registrado
   */
  static isInitialized(): boolean {
    return this.initialized || this.services.size > 0 || this.singletons.size > 0;
  }
} 