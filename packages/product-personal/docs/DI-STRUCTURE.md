# Estrutura de Injeção de Dependências (DI) - FinManage Personal

## Visão Geral

O FinManage Personal implementa o padrão de Injeção de Dependências (DI) para aumentar a modularidade, testabilidade e manutenibilidade do código. A estrutura de DI permite que componentes obtenham suas dependências de uma fonte externa (DIContainer) em vez de criá-las internamente.

## Componentes do Sistema de DI

### 1. Container de DI

O DIContainer é fornecido pelo pacote `@finmanage/core/di` e gerencia os serviços registrados na aplicação. Este container é inicializado durante o bootstrap da aplicação.

### 2. Tokens de Serviço

Os tokens são identificadores únicos para os serviços registrados no container. Os principais tokens disponíveis são:

```typescript
// Importação
import { AUTH_SERVICE, TRANSACTION_SERVICE, CATEGORY_SERVICE, BUDGET_SERVICE, GOAL_SERVICE, INVESTMENT_SERVICE } from '@finmanage/core/di';
```

### 3. Controladores com DI

Os controladores com DI atuam como intermediários entre os componentes de UI e os serviços registrados no DIContainer. Eles encapsulam a lógica de negócios e fornecem métodos para os componentes da UI.

Os principais controladores implementados são:

- **DIAuthController**: Autenticação e gestão de usuários
- **DITransactionController**: Operações relacionadas a transações
- **DICategoryController**: Gerenciamento de categorias
- **DIReportController**: Geração e exportação de relatórios

### 4. Componentes de UI com DI

Os componentes de UI que utilizam DI seguem um padrão de nomenclatura com sufixo "DI" e consomem os controladores DI correspondentes:

- **LoginDI / RegisterDI**: Telas de autenticação
- **DashboardDI**: Dashboard principal
- **TransactionsDI**: Gestão de transações
- **CategoriesDI**: Gestão de categorias
- **ReportsDI**: Relatórios e análises
- **SettingsDI**: Configurações do usuário

## Fluxo de Dados com DI

1. **Inicialização**: O DIContainer é inicializado durante o bootstrap da aplicação
2. **Registro de Serviços**: Serviços são registrados no container com seus respectivos tokens
3. **Componente UI**: Um componente UI chama métodos do controlador DI
4. **Controlador DI**: O controlador obtém o serviço necessário do DIContainer
5. **Serviço**: O serviço executa operações e retorna resultados
6. **Resposta**: Os dados fluem de volta para a UI seguindo o caminho inverso

## Exemplo de Uso

```tsx
// Componente UI
const TransactionsDI: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const loadTransactions = async () => {
      const data = await DITransactionController.getTransactions();
      setTransactions(data);
    };
    
    loadTransactions();
  }, []);
  
  // Restante do componente...
};

// Controlador DI
export class DITransactionController {
  private static getTransactionService(): TransactionService {
    return DIContainer.get<TransactionService>(TRANSACTION_SERVICE);
  }
  
  static async getTransactions(): Promise<Transaction[]> {
    const service = this.getTransactionService();
    const { data, error } = await service.getAll();
    
    // Tratamento de erros e retorno de dados...
    return data || [];
  }
  
  // Outros métodos...
}
```

## Benefícios da Estrutura DI

1. **Desacoplamento**: Componentes UI não dependem diretamente da implementação dos serviços
2. **Testabilidade**: Facilita a criação de mocks para testes unitários
3. **Flexibilidade**: Permite trocar implementações de serviços sem afetar os componentes UI
4. **Manutenibilidade**: Centraliza a lógica de acesso a serviços nos controladores
5. **Consistência**: Estabelece um padrão consistente para toda a aplicação

## Limitações e Considerações

- O sistema de DI é dependente do `DIContainer` do core
- Os serviços precisam ser registrados antes de serem utilizados
- Apenas funcionalidades compatíveis com o core devem utilizar este padrão (auth, transactions, categories, reports, settings)
- Funcionalidades específicas do produto personal devem seguir padrões próprios de implementação 