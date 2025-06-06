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
- **LoginDI**: Tela de login utilizando injeção de dependência
- **RegisterDI**: Tela de cadastro utilizando injeção de dependência

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

// LoginDI.tsx
import { DIAuthController } from '@/controllers/DIAuthController';

const LoginDI: React.FC = () => {
  // ...
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await DIAuthController.login(formData);
    
    if (success) {
      navigate('/dashboard-di');
    }
    
    setIsLoading(false);
  };
  
  // ...
};
```

## Fluxo de Funcionamento

### 1. Inicialização do Sistema

```typescript
// main.tsx
import { bootstrapMeiDI } from '@/lib/di/bootstrap';

// Inicializar o container de DI antes de renderizar a aplicação
bootstrapMeiDI();

// Verificar se os serviços foram registrados corretamente
if (DIContainer.has(TRANSACTION_SERVICE)) {
  console.log('Serviços MEI registrados com sucesso!');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2. Fluxo de Dados

1. **Bootstrap**: O container de DI é inicializado com os serviços específicos do MEI
2. **Registro**: Os serviços MEI são registrados no container usando tokens únicos
3. **Resolução**: Os controladores obtêm instâncias dos serviços através do container
4. **Execução**: Os serviços executam a lógica de negócios específica do MEI
5. **Retorno**: Os dados são processados e retornados para os componentes UI

### 3. Vantagens da Nova Arquitetura

#### Desacoplamento
- Componentes não dependem diretamente de implementações específicas
- Facilita a troca de implementações sem afetar o código cliente
- Permite diferentes implementações para diferentes contextos (MEI vs Personal)

#### Testabilidade
- Facilita a criação de mocks para testes unitários
- Permite testar componentes isoladamente
- Simplifica a configuração de cenários de teste

#### Manutenibilidade
- Código mais organizado e estruturado
- Facilita a identificação e correção de problemas
- Reduz o acoplamento entre módulos

#### Reutilização
- Interfaces comuns permitem reutilização de código
- Componentes podem ser compartilhados entre produtos
- Lógica de negócios centralizada no core

#### Extensibilidade
- Facilita a adição de novas funcionalidades
- Permite extensão sem modificação do código existente
- Suporta diferentes implementações para diferentes produtos

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
│       ├── DashboardDI.tsx        # Componente UI que usa o controlador de transações
│       └── auth/
│           ├── LoginDI.tsx        # Tela de login com DI
│           └── RegisterDI.tsx     # Tela de cadastro com DI
└── main.tsx                       # Ponto de entrada que inicializa o DI
```

## Estado Atual da Migração

### Processo de Migração

A migração para o sistema de injeção de dependências no FinManage MEI segue uma abordagem gradual:

1. Implementar os serviços com DI no produto MEI
2. Criar controladores com DI
3. Migrar páginas existentes para usar o sistema de DI
4. Atualizar rotas para redirecionar para as versões com DI
5. Manter ferramentas de diagnóstico para facilitar a resolução de problemas

### Estado Atual da Migração

| Página | Status | Observações |
|--------|--------|-------------|
| Dashboard | ✅ Concluído | Funcionando sem problemas |
| Transações | ✅ Concluído | Implementação completa e testada |
| Categorias | ✅ Concluído | Funcionando sem problemas |
| Clientes | ✅ Concluído | Funcionando sem problemas |
| Vendas | ✅ Concluído | Funcionando sem problemas |
| DAS | ✅ Concluído | Funcionando sem problemas |
| Relatórios | ✅ Concluído | Funcionando sem problemas |
| Configurações | ✅ Concluído | Funcionando sem problemas |
| Login/Registro | ✅ Concluído | Autenticação com DI implementada |

## Estratégias de Diagnóstico

Durante a migração, foram desenvolvidas estratégias específicas para diagnóstico e resolução de problemas:

### 1. Verificação de Inicialização

Foi adicionado o método `isInitialized()` ao DIContainer para verificar se o container foi inicializado corretamente:

```typescript
// Em DIContainer
isInitialized(): boolean {
  return this._initialized;
}
```

### 2. Logs Detalhados

Foram adicionados logs detalhados no processo de bootstrap e nos controladores:

```typescript
// Em main.tsx
console.log('Inicializando container de DI para MEI...');
bootstrapMeiDI();

if (DIContainer.has(TRANSACTION_SERVICE)) {
  console.log(`Serviço ${TRANSACTION_SERVICE} registrado com sucesso!`);
} else {
  console.error(`ERRO: Serviço ${TRANSACTION_SERVICE} não está registrado!`);
}
```

### 3. Páginas de Diagnóstico

Foram criadas páginas específicas para diagnóstico:

- `TransactionDIDebug.tsx`: Verifica a configuração do DI para transações
- `ClientDIDebug.tsx`: Verifica a configuração do DI para clientes
- `SalesDIDebug.tsx`: Verifica a configuração do DI para vendas

### 4. Testes Manuais

Foi implementada uma função de teste para verificar o funcionamento dos serviços:

```typescript
const testGetTransactions = async () => {
  if (!serviceInstance) return;
  
  try {
    const { data, error } = await serviceInstance.getAll();
    console.log('Resultado de getAll():', { data, error });
    alert(`Resultado de getAll(): ${data ? `${data.length} transações encontradas` : 'Nenhum dado'}, ${error ? `Erro: ${error.message}` : 'Sem erros'}`);
  } catch (err) {
    console.error('Erro ao chamar getAll():', err);
    alert(`Erro ao chamar getAll(): ${err instanceof Error ? err.message : String(err)}`);
  }
};
```

## Resolução de Problemas Comuns

### Tela Branca ao Acessar Páginas com DI

Se ao acessar uma página que utiliza DI você se deparar com uma tela branca, verifique as seguintes possibilidades:

1. **Container não inicializado**: Verifique se a função `bootstrapMeiDI()` está sendo chamada no arquivo `main.tsx` antes da renderização do aplicativo.

2. **Serviço não registrado**: Verifique no console do navegador se há erros indicando que um serviço não foi registrado. Certifique-se de que todos os serviços necessários estão sendo registrados no arquivo `bootstrap.ts`.

3. **Erros no controlador**: Adicione tratamento de erros adequado nos métodos dos controladores para evitar que falhas silenciosas causem telas brancas.

4. **Verificação de inicialização**: Use o método `DIContainer.isInitialized()` para verificar se o container foi inicializado corretamente antes de tentar acessar serviços.

5. **Logs de depuração**: Adicione logs detalhados no processo de bootstrap e nos controladores para identificar onde ocorrem falhas.

6. **Página de diagnóstico**: Acesse as páginas de diagnóstico para verificar detalhadamente o estado do container e dos serviços.

### Serviço Não Registrado

Se um serviço não estiver registrado corretamente:

1. Verifique se o arquivo `bootstrap.ts` está registrando todos os serviços necessários.
2. Certifique-se de que o container está sendo inicializado antes de qualquer acesso aos serviços.
3. Verifique se a importação dos tokens está correta.

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

## Próximos Passos

1. Implementar testes unitários para os serviços e controladores específicos do MEI
2. Remover gradualmente as implementações antigas e páginas de diagnóstico
3. Documentar padrões e melhores práticas para novos desenvolvedores
4. Otimizar performance dos serviços MEI
5. Implementar cache inteligente para dados específicos do MEI

## Exemplo de Uso

### Registrar um serviço

```typescript
// Em bootstrap.ts
import { DIContainer, TRANSACTION_SERVICE } from '@finmanage/core/di';
import { MeiTransactionService } from '../services/MeiTransactionService';

DIContainer.registerSingleton(TRANSACTION_SERVICE, new MeiTransactionService());
```

### Usar um serviço em um controlador

```typescript
// Em DITransactionController.ts
import { DIContainer, TRANSACTION_SERVICE } from '@finmanage/core/di';
import { TransactionService } from '@finmanage/core/services';

export class DITransactionController {
  private static getTransactionService(): TransactionService {
    return DIContainer.get<TransactionService>(TRANSACTION_SERVICE);
  }
  
  static async getTransactions(): Promise<Transaction[]> {
    const transactionService = this.getTransactionService();
    const { data, error } = await transactionService.getAll();
    
    if (error) {
      throw new Error(`Erro ao buscar transações: ${error.message}`);
    }
    
    return data || [];
  }
  
  static async getFinancialSummary(period: string): Promise<FinancialSummary> {
    const transactionService = this.getTransactionService();
    const { data, error } = await transactionService.getFinancialSummary(period);
    
    if (error) {
      throw new Error(`Erro ao buscar resumo financeiro: ${error.message}`);
    }
    
    return data || { receitas: 0, despesas: 0, saldo: 0, transactions: [] };
  }
}
```

### Usar um controlador em um componente

```typescript
// Em um componente React
import { DITransactionController } from '@/controllers/DITransactionController';
import { useState, useEffect } from 'react';

function TransactionsComponent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await DITransactionController.getTransactions();
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    
    loadTransactions();
  }, []);
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return (
    <div>
      <h2>Transações MEI</h2>
      {transactions.map(transaction => (
        <div key={transaction.id}>
          {transaction.description} - R$ {transaction.amount}
        </div>
      ))}
    </div>
  );
}
```

## Considerações Finais

A implementação de injeção de dependências no FinManage MEI segue o mesmo padrão do produto Personal, garantindo consistência e facilitando a manutenção em toda a plataforma FinManage. Esta abordagem permite que cada produto tenha suas próprias implementações específicas de serviços, enquanto compartilha interfaces e contratos comuns definidos no core.

### Principais Benefícios Alcançados

1. **Arquitetura Consistente**: Ambos os produtos (MEI e Personal) seguem o mesmo padrão arquitetural
2. **Facilidade de Manutenção**: Código mais organizado e fácil de manter
3. **Testabilidade Aprimorada**: Facilita a criação de testes unitários e de integração
4. **Reutilização de Código**: Interfaces comuns permitem compartilhamento entre produtos
5. **Extensibilidade**: Facilita a adição de novos produtos à plataforma FinManage

### Considerações Finais

1. **Migração Gradual**: A abordagem gradual permitiu manter a estabilidade durante a transição
2. **Ferramentas de Diagnóstico**: Essenciais para identificar e resolver problemas rapidamente
3. **Logs Detalhados**: Fundamentais para debugging e monitoramento
4. **Testes Manuais**: Importantes para validar o funcionamento antes da migração completa

A nova arquitetura representa um avanço significativo na qualidade e manutenibilidade do código, estabelecendo uma base sólida para o crescimento futuro da plataforma FinManage.