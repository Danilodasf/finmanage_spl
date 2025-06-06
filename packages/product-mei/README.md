# 📊 FinManage MEI - Sistema de Gestão Financeira para Microempreendedores

<div align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow" alt="Status">
  <img src="https://img.shields.io/badge/Versão-0.1.0-blue" alt="Versão">
  <img src="https://img.shields.io/badge/Node.js-18+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/React-18+-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5+-blue" alt="TypeScript">
</div>

## 📋 Sumário

- [📱 Visão Geral](#-visão-geral)
- [🏗️ Arquitetura e Injeção de Dependências](#️-arquitetura-e-injeção-de-dependências)
- [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [🚀 Funcionalidades](#-funcionalidades)
- [📱 Telas do Sistema](#-telas-do-sistema)
- [🔧 Instalação e Configuração](#-instalação-e-configuração)
- [💻 Scripts Disponíveis](#-scripts-disponíveis)
- [🧪 Testes](#-testes)
- [📦 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔄 Integração com o Core](#-integração-com-o-core)
- [📚 Documentação Técnica](#-documentação-técnica)
- [🤝 Contribuição](#-contribuição)

## 📱 Visão Geral

O **FinManage MEI** é uma solução especializada para gestão financeira de Microempreendedores Individuais (MEI), desenvolvida com foco em:

- ✅ **Controle de Faturamento**: Monitoramento do limite anual de R$ 81.000
- ✅ **Gestão de Clientes**: Cadastro completo com histórico de vendas
- ✅ **Controle de Vendas**: Registro detalhado de todas as transações
- ✅ **Obrigações Fiscais**: Controle automático do DAS (Documento de Arrecadação do Simples)
- ✅ **Relatórios Fiscais**: Geração de relatórios para contabilidade
- ✅ **Separação Financeira**: Divisão clara entre finanças pessoais e empresariais

## 🏗️ Arquitetura e Injeção de Dependências

### Container de DI Personalizado

O projeto implementa um sistema robusto de **Injeção de Dependências (DI)** através de um container personalizado:

```typescript
// src/di/DIContainer.ts
export class DIContainer {
  private dependencies: Map<string, () => any>;
  
  register<T>(name: string, factory: () => T): void
  resolve<T>(name: string): T
  has(name: string): boolean
}
```

### Bootstrap do Sistema

O sistema é inicializado através do arquivo `bootstrap.ts` que registra todos os serviços:

```typescript
// Serviços registrados automaticamente:
- CATEGORY_SERVICE: SupabaseMeiCategoryService
- AUTH_SERVICE: MeiAuthService  
- REPORT_SERVICE: MeiReportService
- TRANSACTION_SERVICE: SupabaseMeiTransactionService
- VENDA_SERVICE: SupabaseMeiVendaService
- CLIENTE_SERVICE: SupabaseMeiClienteService
```

### Vantagens da Arquitetura DI

- 🔧 **Baixo Acoplamento**: Componentes independentes e testáveis
- 🔄 **Fácil Manutenção**: Troca de implementações sem alterar código cliente
- 🧪 **Testabilidade**: Mocks e stubs facilmente injetáveis
- 📈 **Escalabilidade**: Adição de novos serviços sem impacto

## 🗄️ Banco de Dados

### Tecnologia: Supabase (PostgreSQL)

O sistema utiliza **Supabase** como backend, oferecendo:
- 🔐 **Autenticação integrada** com Row Level Security (RLS)
- 🚀 **API REST automática** gerada a partir do schema
- 📊 **Real-time subscriptions** para atualizações em tempo real
- 🔒 **Políticas de segurança** a nível de linha


## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18+** - Biblioteca principal
- **TypeScript 5+** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento SPA
- **TanStack Query** - Gerenciamento de estado servidor

### UI/UX
- **Radix UI** - Componentes acessíveis
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones
- **Recharts** - Gráficos e visualizações
- **React Hook Form** - Gerenciamento de formulários

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security** - Segurança a nível de linha

### Desenvolvimento & Testes
- **Vitest** - Framework de testes
- **ESLint** - Linting de código
- **PostCSS** - Processamento CSS

### Dependências Principais
```json
{
  "@finmanage/core": "*",
  "@supabase/supabase-js": "^2.49.10",
  "@tanstack/react-query": "^5.56.2",
  "react": "^18.3.1",
  "typescript": "~5.6.2"
}
```

## 🚀 Funcionalidades

### 📊 Dashboard Inteligente
- **Resumo Financeiro**: Receitas, despesas e saldo atual
- **Gráficos Interativos**: Visualização de dados com Recharts
- **Filtros Temporais**: Análise mensal e anual
- **Indicadores MEI**: Acompanhamento do limite de faturamento

### 👥 Gestão de Clientes
- **Cadastro Completo**: Nome, email, telefone, CPF/CNPJ
- **Histórico de Vendas**: Todas as transações por cliente
- **Busca e Filtros**: Localização rápida de clientes
- **Exportação de Dados**: Relatórios em diversos formatos

### 💰 Controle de Vendas
- **Registro Detalhado**: Data, valor, descrição, forma de pagamento
- **Vinculação com Clientes**: Associação automática
- **Categorização**: Organização por tipo de serviço/produto
- **Integração Financeira**: Criação automática de transações

### 📋 Gestão do DAS
- **Cálculo Automático**: Baseado no faturamento mensal
- **Lembretes de Vencimento**: Notificações automáticas
- **Controle de Pagamentos**: Status e comprovantes
- **Histórico Completo**: Todos os DAS pagos e pendentes

### 📈 Relatórios e Analytics
- **Relatórios Fiscais**: Preparados para contabilidade
- **Análise de Faturamento**: Acompanhamento do limite MEI
- **Fluxo de Caixa**: Entradas e saídas detalhadas
- **Exportação**: PDF, Excel, CSV

## 📱 Telas do Sistema

### 🔐 Autenticação
- **Login**: Acesso seguro com email/senha
- **Registro**: Criação de nova conta MEI
- **Recuperação**: Reset de senha via email

### 📊 Dashboard Principal
- **Cards de Resumo**: Receitas, despesas, saldo
- **Gráfico de Pizza**: Distribuição por categorias
- **Gráfico de Linha**: Evolução temporal
- **Filtros**: Período de análise

### 💼 Gestão de Vendas
- **Lista de Vendas**: Tabela com todas as vendas
- **Formulário de Cadastro**: Modal para nova venda
- **Detalhes da Venda**: Informações completas
- **Ações**: Editar, excluir, visualizar

### 👥 Cadastro de Clientes
- **Lista de Clientes**: Tabela com busca
- **Formulário de Cliente**: Dados completos
- **Histórico**: Vendas por cliente
- **Estatísticas**: Valor total por cliente

### 📋 Controle DAS
- **Calendário de Vencimentos**: Visualização mensal
- **Lista de Pagamentos**: Status e valores
- **Formulário de Pagamento**: Registro de DAS
- **Relatórios**: Histórico fiscal

## 🔧 Instalação e Configuração

### Pré-requisitos
- **Node.js** >= 18.x
- **npm** >= 9.x
- **Conta Supabase** (para banco de dados)

### 1. Instalação das Dependências
```bash
# Na raiz do monorepo
npm run install:all

# Ou especificamente para o MEI
cd packages/product-mei
npm install
```

### 2. Configuração do Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Configurar variáveis do Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Configuração do Banco de Dados
```bash
# Executar migrações no Supabase
# As migrações estão em src/lib/migrations/
- create_profiles_table.sql
- create_das_payments_table.sql
- create_categories_table.sql
- create_transaction_deletion_triggers.sql
```

### 4. Execução do Projeto
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview
```

## 💻 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento (porta 3002)

# Build e Deploy
npm run build            # Gera build de produção
npm run preview          # Visualiza build localmente

# Qualidade de Código
npm run lint             # Executa ESLint
npm run lint:fix         # Corrige problemas automaticamente

# Testes
npm test                 # Executa todos os testes
npm run test:watch       # Testes em modo watch
npm run test:coverage    # Relatório de cobertura

# Utilitários
npm run clean            # Limpa cache e node_modules
npm run type-check       # Verificação de tipos TypeScript
```

## 🧪 Testes

### Framework: Vitest

O projeto utiliza **Vitest** para testes unitários, oferecendo:
- ⚡ **Performance**: Execução rápida com Vite
- 🔧 **Compatibilidade**: API similar ao Jest
- 📊 **Coverage**: Relatórios de cobertura integrados
- 🔄 **Watch Mode**: Reexecução automática

### Estrutura dos Testes

```
src/test/
├── controllers.test.ts    # Testes dos controladores DI
├── dasDateUtils.test.ts   # Utilitários de cálculo DAS
├── models.test.ts         # Validação de modelos de dados
├── services.test.ts       # Lógica de negócio e integrações
├── validation.test.ts     # Formatação e validação de dados
└── setup.ts              # Configuração global dos testes
```

### Cobertura de Testes

- **Modelos de Dados**: Validação de interfaces e tipos
- **Utilitários de Validação**: CPF, CNPJ, formatação
- **Cálculos DAS**: Datas de vencimento e valores
- **Controladores**: Lógica de controle com DI
- **Serviços**: Regras de negócio e integrações

### Comandos de Teste

```bash
# Executar todos os testes
npm test

# Modo watch (reexecuta quando arquivos mudam)
npm run test:watch

# Relatório de cobertura
npm run test:coverage

# Testes específicos
npm test -- validation.test.ts

# Debug de testes
npm test -- --reporter=verbose
```

### Exemplo de Teste

```typescript
// src/test/validation.test.ts
import { describe, it, expect } from 'vitest';
import { formatCPF, formatCNPJ } from '../utils/validation';

describe('Validation Utils', () => {
  it('should format CPF correctly', () => {
    const result = formatCPF('12345678900');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
```

## 📦 Estrutura do Projeto

```
packages/product-mei/
├── src/
│   ├── adapters/              # Adaptadores de dados
│   │   ├── ClienteAdapter.ts
│   │   ├── ClienteFormAdapter.ts
│   │   └── VendaAdapter.ts
│   ├── components/            # Componentes React
│   │   ├── Layout/           # Layouts da aplicação
│   │   ├── clientes/         # Componentes de clientes
│   │   ├── ui/              # Componentes de UI reutilizáveis
│   │   └── vendas/          # Componentes de vendas
│   ├── controllers/          # Controladores com DI
│   │   ├── ClienteController.ts
│   │   ├── DIAuthController.ts
│   │   ├── DICategoryController.ts
│   │   ├── DIDASController.ts
│   │   ├── DIReportController.ts
│   │   ├── DITransactionController.ts
│   │   └── VendaController.ts
│   ├── di/                   # Sistema de Injeção de Dependências
│   │   └── DIContainer.ts
│   ├── hooks/                # React Hooks customizados
│   │   └── use-toast.ts
│   ├── lib/                  # Bibliotecas e utilitários
│   │   ├── di/              # Bootstrap do DI
│   │   ├── migrations/      # Migrações do banco
│   │   ├── services/        # Serviços de negócio
│   │   ├── AuthContext.tsx  # Contexto de autenticação
│   │   ├── core-exports.ts  # Exportações do core
│   │   └── supabase.ts     # Configuração Supabase
│   ├── models/              # Modelos de dados
│   │   ├── Category.ts
│   │   ├── Cliente.ts
│   │   ├── Transaction.ts
│   │   ├── User.ts
│   │   └── Venda.ts
│   ├── pages/               # Páginas especiais
│   │   ├── NotFound.tsx
│   │   └── NotificationsPage.tsx
│   ├── test/                # Testes unitários
│   │   ├── controllers.test.ts
│   │   ├── dasDateUtils.test.ts
│   │   ├── models.test.ts
│   │   ├── services.test.ts
│   │   ├── setup.ts
│   │   └── validation.test.ts
│   ├── utils/               # Utilitários gerais
│   │   ├── dasDateUtils.ts
│   │   ├── eventBus.ts
│   │   └── validation.ts
│   ├── views/               # Views/Páginas principais
│   │   ├── auth/           # Páginas de autenticação
│   │   ├── AdminSetup.tsx
│   │   ├── Categories.tsx
│   │   ├── DashboardDI.tsx
│   │   ├── ImpostoDAS.tsx
│   │   ├── ReportsDI.tsx
│   │   ├── Settings.tsx
│   │   ├── TransactionsDI.tsx
│   │   └── Vendas.tsx
│   ├── App.tsx              # Componente principal
│   ├── index.css           # Estilos globais
│   └── main.tsx            # Ponto de entrada
├── docs/                    # Documentação
├── supabase/               # Configurações Supabase
├── .env.example            # Exemplo de variáveis de ambiente
├── package.json            # Dependências e scripts
├── tailwind.config.ts      # Configuração Tailwind
├── vite.config.ts          # Configuração Vite
└── vitest.config.ts        # Configuração Vitest
```

## 🔄 Integração com o Core

### Importações do Core

O projeto MEI reutiliza componentes e funcionalidades do core:

```typescript
// src/lib/core-exports.ts
import { DIContainer } from '../../../core/src/lib/di/container';
import { CATEGORY_SERVICE, AUTH_SERVICE } from '../../../core/src/lib/di/tokens';
import { toast, useToast } from '../../../core/src/hooks/use-toast';
import { BaseEntityService } from '../../../core/src/lib/services/base';
```

### Serviços Compartilhados

- **DIContainer**: Sistema de injeção de dependências
- **BaseEntityService**: Classe base para serviços
- **Hooks de UI**: Toast, notificações
- **Tokens de DI**: Identificadores de serviços

### Extensões Específicas do MEI

- **MeiAuthService**: Autenticação específica para MEI
- **SupabaseMeiServices**: Implementações com Supabase
- **DAS Controllers**: Controle específico de impostos MEI
- **Validações MEI**: CPF, CNPJ, limites de faturamento

## 📚 Documentação Técnica

### Padrões de Código

- **TypeScript**: Tipagem forte em todo o projeto
- **ESLint**: Regras de qualidade de código
- **Prettier**: Formatação consistente
- **Conventional Commits**: Padronização de commits

### Arquitetura de Componentes

```typescript
// Exemplo de componente com DI
const DashboardDI: React.FC = () => {
  const [summary, setSummary] = useState();
  
  useEffect(() => {
    const fetchData = async () => {
      // Utilizando DI para obter dados
      const data = await DITransactionController.getFinancialSummary();
      setSummary(data);
    };
    fetchData();
  }, []);
  
  return <MainLayout>{/* conteúdo */}</MainLayout>;
};
```

### Gerenciamento de Estado

- **React Query**: Cache e sincronização com servidor
- **React Context**: Estado global de autenticação
- **Local State**: Estado local dos componentes
- **Event Bus**: Comunicação entre componentes

### Segurança

- **Row Level Security**: Isolamento de dados por usuário
- **Autenticação JWT**: Tokens seguros do Supabase
- **Validação de Entrada**: Sanitização de dados
- **HTTPS**: Comunicação criptografada
