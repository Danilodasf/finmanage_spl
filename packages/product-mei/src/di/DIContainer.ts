/**
 * Container de Injeção de Dependências (DI)
 * 
 * Esta classe implementa um container simples para gerenciar dependências
 * no padrão de Injeção de Dependências.
 */
export class DIContainer {
  private dependencies: Map<string, () => any>;

  constructor() {
    this.dependencies = new Map();
  }

  /**
   * Registra uma dependência no container
   * 
   * @param name Nome da dependência
   * @param factory Função factory que cria a instância da dependência
   */
  register<T>(name: string, factory: () => T): void {
    this.dependencies.set(name, factory);
  }

  /**
   * Resolve uma dependência registrada no container
   * 
   * @param name Nome da dependência a ser resolvida
   * @returns Instância da dependência
   * @throws Error se a dependência não estiver registrada
   */
  resolve<T>(name: string): T {
    const factory = this.dependencies.get(name);
    
    if (!factory) {
      throw new Error(`Dependência "${name}" não encontrada no container`);
    }
    
    return factory() as T;
  }

  /**
   * Verifica se uma dependência está registrada no container
   * 
   * @param name Nome da dependência
   * @returns true se a dependência estiver registrada, false caso contrário
   */
  has(name: string): boolean {
    return this.dependencies.has(name);
  }

  /**
   * Remove uma dependência do container
   * 
   * @param name Nome da dependência a ser removida
   * @returns true se a dependência foi removida, false se não existia
   */
  remove(name: string): boolean {
    return this.dependencies.delete(name);
  }

  /**
   * Remove todas as dependências do container
   */
  clear(): void {
    this.dependencies.clear();
  }
} 