/**
 * Interface para representar um token de serviço
 * Permite usar símbolos ou strings como identificadores de serviço
 */
export type ServiceToken = string | symbol;

/**
 * Interface para um provedor de serviço
 * Usado para registrar serviços no container de DI
 */
export interface ServiceProvider<T> {
  token: ServiceToken;
  useClass?: new (...args: any[]) => T;
  useValue?: T;
  useFactory?: (...args: any[]) => T;
  deps?: ServiceToken[];
  singleton?: boolean;
}

/**
 * Interface para um módulo de DI
 * Usado para agrupar provedores relacionados
 */
export interface DIModule {
  providers: ServiceProvider<any>[];
} 