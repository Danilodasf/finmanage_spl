import { DIContainer, CATEGORY_SERVICE, AUTH_SERVICE, REPORT_SERVICE, TRANSACTION_SERVICE } from '../core-exports';
import { SupabaseMeiCategoryService } from '../services/SupabaseMeiCategoryService';
import { MeiAuthService } from '../services/MeiAuthService';
import { MeiReportService } from '../services/MeiReportService';
import { SupabaseMeiTransactionService } from '../services/SupabaseMeiTransactionService';
import { SupabaseMeiVendaService } from '../services/SupabaseMeiVendaService';
import { SupabaseMeiClienteService } from '../services/SupabaseMeiClienteService';

// Tokens para serviços específicos do MEI
export const VENDA_SERVICE = 'venda-service';
export const CLIENTE_SERVICE = 'cliente-service';

/**
 * Inicializa o container de DI para o produto MEI
 * Registra todos os serviços específicos do produto
 */
export function bootstrapMeiDI(): void {
  console.log('Iniciando bootstrap do container de DI do MEI...');
  
  try {
    // Registrar serviços como singletons
    DIContainer.registerSingleton(CATEGORY_SERVICE, new SupabaseMeiCategoryService());
    console.log(`Serviço ${CATEGORY_SERVICE} registrado com sucesso`);
    
    DIContainer.registerSingleton(AUTH_SERVICE, new MeiAuthService());
    console.log(`Serviço ${AUTH_SERVICE} registrado com sucesso`);
    
    DIContainer.registerSingleton(REPORT_SERVICE, new MeiReportService());
    console.log(`Serviço ${REPORT_SERVICE} registrado com sucesso`);
    
    DIContainer.registerSingleton(TRANSACTION_SERVICE, new SupabaseMeiTransactionService());
    console.log(`Serviço ${TRANSACTION_SERVICE} registrado com sucesso (usando Supabase)`);
    
    DIContainer.registerSingleton(VENDA_SERVICE, new SupabaseMeiVendaService());
    console.log(`Serviço ${VENDA_SERVICE} registrado com sucesso (usando Supabase)`);
    
    DIContainer.registerSingleton(CLIENTE_SERVICE, new SupabaseMeiClienteService());
    console.log(`Serviço ${CLIENTE_SERVICE} registrado com sucesso (usando Supabase)`);
    
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