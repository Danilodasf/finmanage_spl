# Estrutura de Injeção de Dependências (DI) - FinManage MEI

## Visão Geral

O FinManage MEI implementa o padrão de Injeção de Dependências (DI) para aumentar a modularidade, testabilidade e manutenibilidade do código. A estrutura de DI permite que componentes obtenham suas dependências de uma fonte externa (DIContainer) em vez de criá-las internamente.

## Componentes do Sistema de DI

### 1. Container de DI

O DIContainer é fornecido pelo pacote `@finmanage/core/di` e gerencia os serviços registrados na aplicação. Este container é inicializado durante o bootstrap da aplicação no arquivo `main.tsx`.

```typescript
// main.tsx
import { bootstrapMeiDI } from './lib/di/bootstrap';

// Inicializa o container de DI
bootstrapMeiDI();
```

### 2. Tokens de Serviço

Os tokens são identificadores únicos para os serviços registrados no container. Os principais tokens disponíveis são:

```typescript
// Importação
import { CATEGORY_SERVICE, AUTH_SERVICE, TRANSACTION_SERVICE } from '@finmanage/core/di';
```

### 3. Serviços

Os serviços são implementações concretas das interfaces definidas no core. Cada serviço é responsável por uma área específica da aplicação:

- **MeiCategoryService**: Gerenciamento de categorias
- **MeiAuthService**: Autenticação e gerenciamento de usuários
- **MeiTransactionService**: Gerenciamento de transações financeiras

Os serviços são registrados no container de DI durante o bootstrap:

```typescript
// bootstrap.ts
import { DIContainer, CATEGORY_SERVICE, AUTH_SERVICE, TRANSACTION_SERVICE } from '@finmanage/core/di';
import { MeiCategoryService } from '../services/MeiCategoryService';
import { MeiAuthService } from '../services/MeiAuthService';
import { MeiTransactionService } from '../services/MeiTransactionService';

export function bootstrapMeiDI(): void {
  // Registrar serviços como singletons
  DIContainer.registerSingleton(CATEGORY_SERVICE, new MeiCategoryService());
  DIContainer.registerSingleton(AUTH_SERVICE, new MeiAuthService());
  DIContainer.registerSingleton(TRANSACTION_SERVICE, new MeiTransactionService());
}
```

### 4. Controladores com DI

Os controladores com DI atuam como intermediários entre os componentes de UI e os serviços registrados no DIContainer. Eles encapsulam a lógica de negócios e fornecem métodos para os componentes da UI.

Os principais controladores implementados são:

- **DICategoryController**: Gerenciamento de categorias
- **DIAuthController**: Autenticação e gerenciamento de usuários
- **DITransactionController**: Gerenciamento de transações financeiras

```typescript
// DICategoryController.ts
import { DIContainer, CATEGORY_SERVICE } from '@finmanage/core/di';
import { CategoryService } from '@finmanage/core/services';

export class DICategoryController {
  private static getCategoryService(): CategoryService {
    return DIContainer.get<CategoryService>(CATEGORY_SERVICE);
  }

  static async getCategories(): Promise<Category[]> {
    const categoryService = this.getCategoryService();
    const { data, error } = await categoryService.getAll();
    // ...
  }
}

// DITransactionController.ts
import { DIContainer, TRANSACTION_SERVICE } from '@finmanage/core/di';
import { TransactionService } from '@finmanage/core/services';

export class DITransactionController {
  private static getTransactionService(): TransactionService {
    return DIContainer.get<TransactionService>(TRANSACTION_SERVICE);
  }

  static async getFinancialSummary(period: 'month' | 'year'): Promise<any> {
    const transactionService = this.getTransactionService();
    return await transactionService.getFinancialSummary(period);
  }

  // Outros métodos...
}
```

### 5. Componentes de UI com DI

Os componentes de UI consomem os controladores DI correspondentes:

- **Categories**: Gestão de categorias
- **Settings**: Configurações de usuário
- **DashboardDI**: Dashboard utilizando injeção de dependência

```typescript
// Categories.tsx
import { DICategoryController } from '@/controllers/DICategoryController';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await DICategoryController.getCategories();
    setCategories(data);
  };
  
  // ...
};

// DashboardDI.tsx
import { DITransactionController } from '@/controllers/DITransactionController';

const DashboardDI: React.FC = () => {
  const [summary, setSummary] = useState({ receitas: 0, despesas: 0, saldo: 0, transactions: [] });
  
  useEffect(() => {
    const fetchData = async () => {
      const data = await DITransactionController.getFinancialSummary(period);
      setSummary(data);
    };
    
    fetchData();
  }, [period]);
  
  // ...
};
```

## Fluxo de Dados com DI

1. **Inicialização**: O container de DI é inicializado durante o bootstrap da aplicação
2. **Registro de Serviços**: Os serviços são registrados no container de DI
3. **Componente UI**: O componente UI utiliza um controlador DI
4. **Controlador DI**: O controlador obtém o serviço apropriado do container de DI
5. **Serviço**: O serviço executa a lógica de negócios e retorna os dados
6. **Controlador DI**: O controlador processa os dados e retorna para o componente UI
7. **Componente UI**: O componente atualiza seu estado e renderiza os dados

## Benefícios da Injeção de Dependências

1. **Desacoplamento**: Componentes são desacoplados de suas dependências
2. **Testabilidade**: Facilita a criação de testes unitários com mocks
3. **Manutenibilidade**: Facilita a substituição de implementações
4. **Reutilização**: Promove a reutilização de código
5. **Extensibilidade**: Facilita a adição de novas funcionalidades

## Estrutura de Arquivos

```
packages/product-mei/
├── src/
│   ├── lib/
│   │   ├── di/
│   │   │   └── bootstrap.ts       # Inicialização do container de DI
│   │   ├── services/
│   │   │   ├── MeiCategoryService.ts  # Implementação do serviço de categorias
│   │   │   ├── MeiAuthService.ts      # Implementação do serviço de autenticação
│   │   │   └── MeiTransactionService.ts # Implementação do serviço de transações
│   │   └── core-exports.ts        # Exportações centralizadas do core
│   ├── controllers/
│   │   ├── DICategoryController.ts  # Controlador de categorias com DI
│   │   ├── DIAuthController.ts      # Controlador de autenticação com DI
│   │   └── DITransactionController.ts # Controlador de transações com DI
│   └── views/
│       ├── Categories.tsx         # Componente UI que usa o controlador de categorias
│       ├── Settings.tsx           # Componente UI que usa o controlador de autenticação
│       └── DashboardDI.tsx        # Componente UI que usa o controlador de transações
└── main.tsx                       # Ponto de entrada que inicializa o DI
```

## Como Implementar um Novo Serviço

Para adicionar um novo serviço com injeção de dependências:

1. **Definir a Interface**: Certifique-se de que a interface do serviço está definida no core
2. **Implementar o Serviço**: Crie uma classe que implementa a interface
3. **Registrar no Container**: Adicione o serviço ao bootstrap do container de DI
4. **Criar o Controlador**: Implemente um controlador que obtém o serviço do container
5. **Usar no Componente UI**: Utilize o controlador no componente UI

```typescript
// 1. A interface já está definida no core
// import { NovoServicoInterface } from '@finmanage/core/services';

// 2. Implementar o serviço
export class MeiNovoServico implements NovoServicoInterface {
  // Implementação dos métodos
}

// 3. Registrar no container
// No arquivo bootstrap.ts
DIContainer.registerSingleton(NOVO_SERVICO, new MeiNovoServico());

// 4. Criar o controlador
export class DINovoController {
  private static getNovoServico(): NovoServicoInterface {
    return DIContainer.get<NovoServicoInterface>(NOVO_SERVICO);
  }
  
  // Métodos do controlador
}

// 5. Usar no componente UI
// No componente React
const dados = await DINovoController.obterDados();
```

## Considerações Finais

A implementação de injeção de dependências no FinManage MEI segue o mesmo padrão do produto Personal, garantindo consistência e facilitando a manutenção em toda a plataforma FinManage. Esta abordagem permite que cada produto tenha suas próprias implementações específicas de serviços, enquanto compartilha interfaces e contratos comuns definidos no core. 