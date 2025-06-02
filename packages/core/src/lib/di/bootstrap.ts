import { DIContainer } from './container';
import { ServiceProvider } from './types';

/**
 * Inicializa o container de DI com os provedores fornecidos
 * @param providers Lista de provedores de serviços
 */
export function bootstrapDI(providers: ServiceProvider<any>[]): void {
  // Limpar o container antes de inicializar
  DIContainer.clear();
  
  // Registrar cada provedor
  for (const provider of providers) {
    const { token, useClass, useValue, useFactory, deps = [], singleton = false } = provider;
    
    if (useValue !== undefined) {
      // Registrar um valor
      if (singleton) {
        DIContainer.registerSingleton(token.toString(), useValue);
      } else {
        DIContainer.register(token.toString(), useValue);
      }
    } else if (useClass) {
      // Registrar uma classe
      if (singleton) {
        DIContainer.registerSingleton(token.toString(), useClass);
      } else {
        DIContainer.registerClass(token.toString(), useClass);
      }
    } else if (useFactory) {
      // Registrar uma factory
      const dependencies = deps.map(dep => DIContainer.get(dep.toString()));
      const instance = useFactory(...dependencies);
      
      if (singleton) {
        DIContainer.registerSingleton(token.toString(), instance);
      } else {
        DIContainer.register(token.toString(), instance);
      }
    }
  }
}

/**
 * Registra um módulo de DI no container
 * @param module Módulo de DI
 */
export function registerModule(module: { providers: ServiceProvider<any>[] }): void {
  bootstrapDI(module.providers);
} 