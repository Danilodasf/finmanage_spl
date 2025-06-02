import { DIContainer, TRANSACTION_SERVICE, CATEGORY_SERVICE, BUDGET_SERVICE, GOAL_SERVICE, INVESTMENT_SERVICE, AUTH_SERVICE } from '@finmanage/core/di';
import { PersonalTransactionService } from '../services/PersonalTransactionService';
import { PersonalCategoryService } from '../services/PersonalCategoryService';
import { PersonalBudgetService } from '../services/PersonalBudgetService';
import { PersonalGoalService } from '../services/PersonalGoalService';
import { PersonalInvestmentService } from '../services/PersonalInvestmentService';
import { PersonalAuthService } from '../services/PersonalAuthService';

/**
 * Inicializa o container de DI para o produto Personal
 * Registra todos os serviços específicos do produto
 */
export function bootstrapPersonalDI(): void {
  console.log('Iniciando bootstrap do container de DI do Personal...');
  
  try {
    // Registrar serviços como singletons
    DIContainer.registerSingleton(TRANSACTION_SERVICE, new PersonalTransactionService());
    console.log(`Serviço ${TRANSACTION_SERVICE} registrado com sucesso`);
    
    DIContainer.registerSingleton(CATEGORY_SERVICE, new PersonalCategoryService());
    console.log(`Serviço ${CATEGORY_SERVICE} registrado com sucesso`);
    
    DIContainer.registerSingleton(BUDGET_SERVICE, new PersonalBudgetService());
    console.log(`Serviço ${BUDGET_SERVICE} registrado com sucesso`);
    
    DIContainer.registerSingleton(GOAL_SERVICE, new PersonalGoalService());
    console.log(`Serviço ${GOAL_SERVICE} registrado com sucesso`);
    
    DIContainer.registerSingleton(INVESTMENT_SERVICE, new PersonalInvestmentService());
    console.log(`Serviço ${INVESTMENT_SERVICE} registrado com sucesso`);
    
    DIContainer.registerSingleton(AUTH_SERVICE, new PersonalAuthService());
    console.log(`Serviço ${AUTH_SERVICE} registrado com sucesso`);
    
    // Verificar se o container foi inicializado corretamente
    if (DIContainer.isInitialized()) {
      console.log('Container de DI do Personal inicializado com sucesso!');
    } else {
      console.error('Falha ao inicializar o container de DI do Personal');
    }
  } catch (error) {
    console.error('Erro durante o bootstrap do container de DI:', error);
  }
} 