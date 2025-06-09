/**
 * Bootstrap da injeção de dependências para o produto Diarista
 * Configura e registra todos os serviços específicos do produto
 */

import { DIContainer } from '../core/di';
import {
  TRANSACTION_SERVICE,
  CATEGORY_SERVICE,
  AUTH_SERVICE,
  STORAGE_SERVICE,
  API_SERVICE,
  HTTP_CLIENT_SERVICE
} from '../core/di';

// Importa os serviços específicos do produto
import { DiaristaTransactionService } from '../../services/DiaristaTransactionService';
import { DiaristaCategoryService } from '../../services/DiaristaCategoryService';
import { DiaristaAuthService } from '../../services/DiaristaAuthService';

// Importa adaptadores e utilitários
import { databaseAdapter } from '../database/DatabaseAdapter';

/**
 * Interface para configuração do bootstrap
 */
interface DiaristaBootstrapConfig {
  enableMockData?: boolean;
  enableLogging?: boolean;
  autoCreateDefaultCategories?: boolean;
}

/**
 * Serviço simples de armazenamento local
 */
class LocalStorageService {
  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }
}

/**
 * Serviço simples de API (mock)
 */
class MockApiService {
  private baseUrl = 'http://localhost:3000/api';

  async get(endpoint: string): Promise<any> {
    console.log(`[MockAPI] GET ${this.baseUrl}${endpoint}`);
    // Simula uma resposta de API
    return { success: true, data: null };
  }

  async post(endpoint: string, data: any): Promise<any> {
    console.log(`[MockAPI] POST ${this.baseUrl}${endpoint}`, data);
    return { success: true, data: data };
  }

  async put(endpoint: string, data: any): Promise<any> {
    console.log(`[MockAPI] PUT ${this.baseUrl}${endpoint}`, data);
    return { success: true, data: data };
  }

  async delete(endpoint: string): Promise<any> {
    console.log(`[MockAPI] DELETE ${this.baseUrl}${endpoint}`);
    return { success: true };
  }
}

/**
 * Cliente HTTP simples
 */
class SimpleHttpClient {
  async request(config: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    headers?: Record<string, string>;
  }): Promise<any> {
    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: config.data ? JSON.stringify(config.data) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição HTTP:', error);
      throw error;
    }
  }
}

/**
 * Inicializa dados mock para desenvolvimento
 */
async function initializeMockData(): Promise<void> {
  try {
    console.log('[Bootstrap] Inicializando dados mock...');
    console.log('[Bootstrap] MockDatabase inicializado sem dados pré-criados');
  } catch (error) {
    console.error('[Bootstrap] Erro ao inicializar dados mock:', error);
  }
}

/**
 * Cria categorias padrão para o usuário
 */
async function createDefaultCategories(userId: string): Promise<void> {
  try {
    const categoryService = DIContainer.getInstance().get(CATEGORY_SERVICE) as DiaristaCategoryService;
    if (categoryService && categoryService.createDefaultCategories) {
      await categoryService.createDefaultCategories(userId);
      console.log('[Bootstrap] Categorias padrão criadas');
    }
  } catch (error) {
    console.error('[Bootstrap] Erro ao criar categorias padrão:', error);
  }
}

/**
 * Configura logging para desenvolvimento
 */
function setupLogging(): void {
  if (import.meta.env.MODE === 'development') {
    console.log('[Bootstrap] Logging habilitado para desenvolvimento');
    
    // Intercepta erros globais
    window.addEventListener('error', (event) => {
      console.error('[Global Error]', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Unhandled Promise Rejection]', event.reason);
    });
  }
}

/**
 * Função principal de bootstrap do produto Diarista
 */
export async function bootstrapDiaristaDI(config: DiaristaBootstrapConfig = {}): Promise<void> {
  try {
    console.log('[Bootstrap] Iniciando configuração DI para produto Diarista...');

    const container = DIContainer.getInstance();

    // Registra os serviços principais como singletons
    container.registerSingleton(TRANSACTION_SERVICE, DiaristaTransactionService);
    container.registerSingleton(CATEGORY_SERVICE, DiaristaCategoryService);
    container.registerSingleton(AUTH_SERVICE, DiaristaAuthService);

    // Registra serviços auxiliares
    container.registerSingleton(STORAGE_SERVICE, LocalStorageService);
    container.registerSingleton(API_SERVICE, MockApiService);
    container.registerSingleton(HTTP_CLIENT_SERVICE, SimpleHttpClient);

    console.log('[Bootstrap] Serviços registrados no container DI');

    // Configurações opcionais
    if (config.enableLogging !== false) {
      setupLogging();
    }

    if (config.enableMockData) {
      await initializeMockData();
    }

    // Verifica se há um usuário logado para criar categorias padrão
    if (config.autoCreateDefaultCategories !== false) {
      try {
        const authService = container.get(AUTH_SERVICE) as DiaristaAuthService;
        const currentUserResult = await authService.getCurrentUser();
        
        if (currentUserResult.user) {
          await createDefaultCategories(currentUserResult.user.id);
        }
      } catch (error) {
        console.log('[Bootstrap] Usuário não logado, categorias padrão serão criadas no primeiro login');
      }
    }

    console.log('[Bootstrap] Configuração DI concluída com sucesso!');

  } catch (error) {
    console.error('[Bootstrap] Erro durante a configuração DI:', error);
    throw error;
  }
}

/**
 * Função para limpar e reinicializar o container (útil para testes)
 */
export function resetDiaristaDI(): void {
  try {
    const container = DIContainer.getInstance();
    
    // Remove todos os serviços registrados
    container.clear?.();
    
    console.log('[Bootstrap] Container DI resetado');
  } catch (error) {
    console.error('[Bootstrap] Erro ao resetar container DI:', error);
  }
}

/**
 * Função para verificar se o DI está configurado corretamente
 */
export function validateDiaristaDI(): boolean {
  try {
    const container = DIContainer.getInstance();
    
    const requiredServices = [
      TRANSACTION_SERVICE,
      CATEGORY_SERVICE,
      AUTH_SERVICE,
      STORAGE_SERVICE,
      API_SERVICE,
      HTTP_CLIENT_SERVICE
    ];

    for (const serviceToken of requiredServices) {
      const service = container.get(serviceToken);
      if (!service) {
        console.error(`[Bootstrap] Serviço ${serviceToken.toString()} não encontrado`);
        return false;
      }
    }

    console.log('[Bootstrap] Validação DI passou - todos os serviços estão registrados');
    return true;
  } catch (error) {
    console.error('[Bootstrap] Erro na validação DI:', error);
    return false;
  }
}

/**
 * Exporta configurações padrão
 */
export const defaultDiaristaConfig: DiaristaBootstrapConfig = {
  enableMockData: import.meta.env.MODE === 'development',
    enableLogging: import.meta.env.MODE === 'development',
  autoCreateDefaultCategories: true
};

/**
 * Exporta tokens de serviço para uso em componentes
 */
export {
  TRANSACTION_SERVICE,
  CATEGORY_SERVICE,
  AUTH_SERVICE,
  STORAGE_SERVICE,
  API_SERVICE,
  HTTP_CLIENT_SERVICE
} from '../core/di';