// Exportar utilitários existentes
export * from './utils';

// Exporta o sistema de DI do core
export * as di from './di';
export * from './di/container';
export * from './di/tokens';

// Exportar interfaces de serviços
export * from './services';
export * from './services/category';
export * from './services/base';

// Exportar hooks
export * from '../hooks/use-toast';