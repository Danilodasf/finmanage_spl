# Implementação de Injeção de Dependências - Product Diarista

Este documento descreve a implementação completa da injeção de dependências no produto Diarista, seguindo os padrões estabelecidos no `@finmanage/core`.

## 📋 Visão Geral

A implementação da injeção de dependências (DI) no product-diarista permite:

- **Desacoplamento**: Separação clara entre lógica de negócio e implementação
- **Testabilidade**: Facilita a criação de testes unitários com mocks
- **Flexibilidade**: Permite trocar implementações facilmente
- **Reutilização**: Aproveita interfaces do core para consistência
- **Manutenibilidade**: Código mais organizado e fácil de manter

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
src/
├── controllers/           # Controladores que usam DI
│   ├── DIAuthController.ts
│   ├── DICategoryController.ts
│   └── DITransactionController.ts
├── hooks/                 # React hooks que usam os controladores
│   ├── useAuth.ts
│   ├── useCategories.ts
│   └── useTransactions.ts
├── lib/
│   ├── database/          # Adaptadores de banco de dados
│   │   └── DatabaseAdapter.ts
│   └── di/                # Configuração da DI
│       └── bootstrap.ts
├── models/                # Modelos específicos do produto
│   └── DiaristaModels.ts
├── services/              # Implementações dos serviços
│   ├── DiaristaAuthService.ts
│   ├── DiaristaCategoryService.ts
│   └── DiaristaTransactionService.ts
└── components/
    └── examples/          # Componentes de exemplo
        └── DIExample.tsx
```

### Fluxo de Dependências

```
Bootstrap (main.tsx)
    ↓
DI Container Setup (bootstrap.ts)
    ↓
Service Registration
    ↓
Controllers (DI*Controller.ts)
    ↓
React Hooks (use*.ts)
    ↓
Components (*.tsx)
```

## 🔧 Componentes Principais

### 1. Bootstrap (`lib/di/bootstrap.ts`)

**Responsabilidade**: Configurar e inicializar o container de DI

```typescript
// Registra todos os serviços no container
export async function bootstrapDiaristaDI(config?: DiaristaBootstrapConfig): Promise<void>

// Valida se todos os serviços foram registrados corretamente
export function validateDiaristaDI(): void

// Reseta o container (útil para testes)
export function resetDiaristaDI(): void
```

**Serviços Registrados**:
- `DiaristaTransactionService` → `TRANSACTION_SERVICE`
- `DiaristaCategoryService` → `CATEGORY_SERVICE`
- `DiaristaAuthService` → `AUTH_SERVICE`
- `LocalStorageService` → `STORAGE_SERVICE`
- `MockApiService` → `API_SERVICE`
- `SimpleHttpClient` → `HTTP_CLIENT`

### 2. Modelos (`models/DiaristaModels.ts`)

**Responsabilidade**: Definir tipos específicos para diaristas

```typescript
// Tipos de serviço específicos
export type TipoServicoDiarista = 
  | 'limpeza_residencial'
  | 'limpeza_comercial'
  | 'limpeza_pos_obra'
  | 'organizacao'
  | 'passadoria'
  | 'cuidados_especiais';

// Extensões dos modelos do core
export interface CategoriaDiarista extends Category {
  service_type?: TipoServicoDiarista;
}

export interface TransacaoDiarista extends Transaction {
  cliente?: string;
  endereco?: string;
  horas_trabalhadas?: number;
  status_pagamento?: 'pendente' | 'pago' | 'atrasado';
  agendamento_id?: string;
}
```

### 3. Serviços (`services/`)

**Responsabilidade**: Implementar as interfaces do core com lógica específica

#### DiaristaTransactionService
- Implementa `TransactionService` do core
- Adiciona funcionalidades específicas para diaristas
- Gerencia transações com dados de cliente e endereço

#### DiaristaCategoryService
- Implementa `CategoryService` do core
- Suporte a tipos de serviço específicos
- Criação de categorias padrão para diaristas

#### DiaristaAuthService
- Implementa `AuthService` do core
- Gerencia perfil de diarista com especialidades
- Sistema de avaliações

### 4. Controladores (`controllers/`)

**Responsabilidade**: Orquestrar operações usando serviços do container DI

```typescript
export class DITransactionController {
  private transactionService: DiaristaTransactionService;
  private authService: DiaristaAuthService;

  constructor() {
    const container = DIContainer.getInstance();
    this.transactionService = container.get(TRANSACTION_SERVICE);
    this.authService = container.get(AUTH_SERVICE);
  }

  // Métodos que combinam múltiplos serviços
  async createTransaction(data: CreateTransacaoDTO): Promise<ServiceResult<TransacaoDiarista>>
  async getFinancialSummary(): Promise<ServiceResult<FinancialSummary>>
}
```

### 5. Hooks React (`hooks/`)

**Responsabilidade**: Fornecer interface React para os controladores

```typescript
// Hook principal para transações
export function useTransactions(): UseTransactionsReturn {
  const [controller] = useState(() => new DITransactionController());
  
  // Estado reativo
  const [state, setState] = useState<UseTransactionsState>({
    transactions: [],
    loading: false,
    error: null
  });
  
  // Operações assíncronas
  const createTransaction = useCallback(async (data) => {
    const result = await controller.createTransaction(data);
    // Atualiza estado baseado no resultado
  }, [controller]);
  
  return { ...state, createTransaction, /* outras ações */ };
}
```

## 🚀 Como Usar

### 1. Inicialização

No `main.tsx`, a DI é inicializada antes da renderização:

```typescript
import { bootstrapDiaristaDI, validateDiaristaDI } from './lib/di/bootstrap';

async function initializeApp() {
  try {
    await bootstrapDiaristaDI();
    validateDiaristaDI();
    
    // Renderiza a aplicação
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Erro na inicialização:', error);
    // Renderiza tela de erro
  }
}

initializeApp();
```

### 2. Em Componentes React

```typescript
import { useTransactions, useCategories, useAuth } from '../hooks';

function MeuComponente() {
  // Hooks fornecem estado e ações
  const { transactions, createTransaction, loading } = useTransactions();
  const { categories } = useCategories();
  const { user, isAuthenticated } = useAuth();
  
  const handleSubmit = async (data) => {
    const result = await createTransaction(data);
    if (result.success) {
      // Sucesso
    } else {
      // Erro: result.error
    }
  };
  
  return (
    <div>
      {/* UI que usa o estado dos hooks */}
    </div>
  );
}
```

### 3. Testando com DI

```typescript
import { DIContainer } from '@finmanage/core/di';
import { TRANSACTION_SERVICE } from '../lib/di/bootstrap';
import { MockTransactionService } from '../__mocks__';

describe('DITransactionController', () => {
  beforeEach(() => {
    // Substitui serviço real por mock
    const container = DIContainer.getInstance();
    container.register(TRANSACTION_SERVICE, () => new MockTransactionService());
  });
  
  it('deve criar transação', async () => {
    const controller = new DITransactionController();
    const result = await controller.createTransaction(mockData);
    expect(result.success).toBe(true);
  });
});
```

## 🔄 Padrões de Uso

### 1. Tratamento de Erros

Todos os métodos retornam `ServiceResult<T>`:

```typescript
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 2. Loading States

Os hooks gerenciam estados de carregamento automaticamente:

```typescript
const { loading, error, data } = useTransactions();

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <DataComponent data={data} />;
```

### 3. Validações

Validações são feitas nos controladores antes de chamar os serviços:

```typescript
async createTransaction(data: CreateTransacaoDTO) {
  // Validação de autenticação
  const authResult = await this.authService.getCurrentUser();
  if (!authResult.user) {
    return { success: false, error: 'Usuário não autenticado' };
  }
  
  // Validações de dados
  if (!data.description?.trim()) {
    return { success: false, error: 'Descrição é obrigatória' };
  }
  
  // Chama o serviço
  return await this.transactionService.create(data);
}
```

## 🧪 Testabilidade

### Vantagens da DI para Testes

1. **Mocks Fáceis**: Substitua serviços reais por mocks
2. **Isolamento**: Teste cada camada independentemente
3. **Configuração Flexível**: Configure diferentes cenários facilmente

### Exemplo de Teste

```typescript
// Mock do serviço
class MockTransactionService implements TransactionService {
  async create(data: any) {
    return { success: true, data: { id: '1', ...data } };
  }
}

// Teste do hook
renderHook(() => useTransactions(), {
  wrapper: ({ children }) => (
    <TestDIProvider mocks={{ [TRANSACTION_SERVICE]: MockTransactionService }}>
      {children}
    </TestDIProvider>
  )
});
```

## 📈 Benefícios Alcançados

### 1. **Manutenibilidade**
- Código organizado em camadas claras
- Responsabilidades bem definidas
- Fácil localização de bugs

### 2. **Testabilidade**
- Testes unitários isolados
- Mocks simples e efetivos
- Cobertura de teste melhorada

### 3. **Flexibilidade**
- Troca de implementações sem quebrar código
- Configurações diferentes para dev/prod/test
- Extensibilidade para novos recursos

### 4. **Reutilização**
- Interfaces do core reutilizadas
- Padrões consistentes entre produtos
- Menos duplicação de código

### 5. **Performance**
- Singletons evitam recriação desnecessária
- Lazy loading de serviços
- Otimizações centralizadas

## 🔮 Próximos Passos

1. **Integração com Supabase**: Substituir `MockDatabaseAdapter` por implementação real
2. **Cache**: Implementar cache inteligente nos serviços
3. **Offline**: Suporte a operações offline com sincronização
4. **Métricas**: Adicionar logging e métricas de performance
5. **Validações**: Implementar validações mais robustas com schemas

## 📚 Referências

- [Documentação do Core](../core/README.md)
- [Padrões de DI](../core/docs/dependency-injection.md)
- [Guia de Testes](../core/docs/testing.md)
- [Arquitetura SPL](../../docs/architecture.md)