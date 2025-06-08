/**
 * Container de Injeção de Dependências
 * Versão simplificada baseada no @finmanage/core
 */

export type ServiceFactory<T = any> = () => T;
export type ServiceToken<T = any> = symbol | string;

export class DIContainer {
  private static instance: DIContainer;
  private services = new Map<ServiceToken, ServiceFactory>();
  private singletons = new Map<ServiceToken, any>();

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register<T>(token: ServiceToken<T>, factory: ServiceFactory<T>, singleton = true): void {
    this.services.set(token, factory);
    if (singleton && this.singletons.has(token)) {
      this.singletons.delete(token);
    }
  }

  registerSingleton<T>(token: ServiceToken<T>, factory: ServiceFactory<T> | (new () => T)): void {
    // Se factory é uma classe (constructor), cria uma factory function
    const serviceFactory = typeof factory === 'function' && factory.prototype 
      ? () => new (factory as new () => T)()
      : factory as ServiceFactory<T>;
    
    this.register(token, serviceFactory, true);
  }

  get<T>(token: ServiceToken<T>): T {
    // Verifica se é singleton e já foi criado
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    // Busca a factory
    const factory = this.services.get(token);
    if (!factory) {
      throw new Error(`Service not found for token: ${String(token)}`);
    }

    // Cria a instância
    const instance = factory();
    
    // Armazena como singleton
    this.singletons.set(token, instance);
    
    return instance;
  }

  has(token: ServiceToken): boolean {
    return this.services.has(token);
  }

  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }

  reset(): void {
    this.clear();
  }
}