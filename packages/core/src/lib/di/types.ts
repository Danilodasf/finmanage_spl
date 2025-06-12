/**
 * Interface para representar um token de serviço
 * Permite usar símbolos ou strings como identificadores de serviço
 */
export type ServiceToken = string | symbol;

/**
 * Interface para um provedor de serviço no contexto de Injeção de Dependências (DI)
 *
 * Define como um serviço pode ser registrado no container de DI, permitindo
 * diferentes estratégias: por classe, valor ou factory. Suporta também
 * declaração de dependências e escopo singleton.
 *
 * O uso dessa interface padroniza o registro de serviços e facilita
 * a manutenção e extensão do sistema.
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
 * Interface para um módulo de Injeção de Dependências (DIModule)
 *
 * Permite agrupar múltiplos provedores de serviço relacionados,
 * facilitando a organização modular do sistema e o registro
 * em lote de dependências no container de DI.
 */
export interface DIModule {
  providers: ServiceProvider<any>[];
}