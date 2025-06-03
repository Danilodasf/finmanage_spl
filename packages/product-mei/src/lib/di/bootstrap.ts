import { DIContainer, CATEGORY_SERVICE, AUTH_SERVICE, REPORT_SERVICE } from '../core-exports';
import { MeiCategoryService } from '../services/MeiCategoryService';
import { MeiAuthService } from '../services/MeiAuthService';
import { MeiReportService } from '../services/MeiReportService';

/**
 * Inicializa o container de DI para o produto MEI
 * Registra todos os serviços específicos do produto
 */
export function bootstrapMeiDI(): void {
  console.log('Iniciando bootstrap do container de DI do MEI...');
  
  try {
    // Registrar serviços como singletons
    DIContainer.registerSingleton(CATEGORY_SERVICE, new MeiCategoryService());
    console.log(`Serviço ${CATEGORY_SERVICE} registrado com sucesso`);
    
    DIContainer.registerSingleton(AUTH_SERVICE, new MeiAuthService());
    console.log(`Serviço ${AUTH_SERVICE} registrado com sucesso`);
    
    DIContainer.registerSingleton(REPORT_SERVICE, new MeiReportService());
    console.log(`Serviço ${REPORT_SERVICE} registrado com sucesso`);
    
    // Verificar se o container foi inicializado corretamente
    if (DIContainer.isInitialized()) {
      console.log('Container de DI do MEI inicializado com sucesso!');
    } else {
      console.error('Falha ao inicializar o container de DI do MEI');
    }
  } catch (error) {
    console.error('Erro durante o bootstrap do container de DI:', error);
  }
} 