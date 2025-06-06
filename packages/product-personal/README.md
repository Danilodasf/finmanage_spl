# 💰 FinManage Personal

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

O **FinManage Personal** é uma solução completa para gestão financeira pessoal, desenvolvida com foco em:

- ✅ **Controle de Gastos**: Monitoramento detalhado de receitas e despesas
- ✅ **Gestão de Orçamentos**: Planejamento e acompanhamento de limites financeiros
- ✅ **Metas Financeiras**: Definição e progresso de objetivos pessoais
- ✅ **Controle de Investimentos**: Acompanhamento de carteira e rendimentos
- ✅ **Relatórios Inteligentes**: Análises e insights sobre padrões financeiros
- ✅ **Dashboard Personalizado**: Visão consolidada da saúde financeira

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
- CATEGORY_SERVICE: PersonalCategoryService
- AUTH_SERVICE: PersonalAuthService  
- TRANSACTION_SERVICE: PersonalTransactionService
- BUDGET_SERVICE: PersonalBudgetService
- GOAL_SERVICE: PersonalGoalService
- INVESTMENT_SERVICE: PersonalInvestmentService
```

### Estado da Migração para DI

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Dashboard | ✅ Concluído | Implementação completa |
| Transações | ✅ Concluído | Implementação completa |
| Categorias | ✅ Concluído | Implementação completa |
| Relatórios | ✅ Concluído | Implementação completa |
| Configurações | ✅ Concluído | Implementação completa |
| Orçamentos | ⏳ Pendente | Implementação original |
| Metas | ⏳ Pendente | Implementação original |
| Investimentos | ⏳ Pendente | Implementação original |

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
- **Indicadores de Saúde**: Acompanhamento de metas e orçamentos

### 💰 Gestão de Transações
- **Registro Completo**: Data, valor, descrição, categoria
- **Categorização Automática**: Sugestões baseadas no histórico
- **Múltiplos Métodos**: PIX, cartão, transferência, dinheiro
- **Busca e Filtros**: Localização rápida de transações

### 🎯 Metas Financeiras
- **Objetivos Personalizados**: Viagem, casa, carro, emergência
- **Acompanhamento Visual**: Progresso em tempo real
- **Prazos Flexíveis**: Metas de curto e longo prazo
- **Notificações**: Lembretes de contribuição

### 📈 Controle de Investimentos
- **Carteira Diversificada**: Ações, fundos, renda fixa
- **Rendimentos Automáticos**: Cálculo de performance
- **Análise de Risco**: Distribuição por categoria
- **Histórico Completo**: Evolução temporal

### 💳 Gestão de Orçamentos
- **Limites por Categoria**: Controle de gastos específicos
- **Alertas Inteligentes**: Notificações de limite
- **Períodos Flexíveis**: Orçamentos mensais e anuais
- **Análise de Desvios**: Comparação planejado vs real

### 📈 Relatórios e Analytics
- **Análise de Padrões**: Identificação de tendências
- **Fluxo de Caixa**: Entradas e saídas detalhadas
- **Comparativos**: Evolução mês a mês
- **Exportação**: PDF, Excel, CSV

## 📱 Telas do Sistema

### 🔐 Autenticação
- **Login**: Acesso seguro com email/senha
- **Registro**: Criação de nova conta pessoal
- **Recuperação**: Reset de senha por email
- **Perfil**: Configurações do usuário

### 📊 Dashboard Principal
- **Cards de Resumo**: Receitas, despesas, saldo
- **Gráfico de Pizza**: Distribuição por categorias
- **Gráfico de Linha**: Evolução temporal
- **Metas em Destaque**: Progresso dos objetivos

### 💰 Gestão de Transações
- **Lista de Transações**: Tabela com filtros
- **Formulário de Cadastro**: Modal para nova transação
- **Detalhes da Transação**: Informações completas
- **Ações**: Editar, excluir, duplicar

### 🎯 Metas Financeiras
- **Lista de Metas**: Cards com progresso visual
- **Formulário de Meta**: Criação de objetivos
- **Detalhes da Meta**: Histórico e contribuições
- **Estatísticas**: Análise de performance

### 📈 Investimentos
- **Carteira**: Visão geral dos investimentos
- **Formulário de Investimento**: Cadastro de aplicações
- **Rendimentos**: Histórico de retornos
- **Performance**: Análise de rentabilidade

### 💳 Orçamentos
- **Lista de Orçamentos**: Status e utilização
- **Formulário de Orçamento**: Definição de limites
- **Acompanhamento**: Progresso em tempo real
- **Alertas**: Notificações de limite

## 🔧 Instalação e Configuração

### Pré-requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Conta Supabase** (gratuita)
- **Git** para controle de versão

### 1. Instalação de Dependências

```bash
# Na raiz do monorepo (recomendado)
npm run install:all

# Ou especificamente para o produto personal
cd packages/product-personal
npm install
```

### 2. Configuração de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Configurações do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Configurações de Desenvolvimento (opcional)
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### 3. Configuração do Banco de Dados

#### 3.1. Criação do Projeto Supabase
1. Acesse [supabase.com](https://supabase.com/)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Configure nome, senha e região

#### 3.2. Execução do Schema
```bash
# Execute o schema principal
psql -h db.xxx.supabase.co -p 5432 -d postgres -U postgres < supabase/database-schema.md

# Ou copie e cole no SQL Editor do Supabase
```

#### 3.3. População de Dados de Teste (Opcional)
```bash
# Execute os dados de teste
psql -h db.xxx.supabase.co -p 5432 -d postgres -U postgres < supabase/test-data-population.md
```

### 4. Execução do Projeto

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview
```

**URLs de Acesso:**
- Desenvolvimento: `http://localhost:3002`
- Preview: `http://localhost:4173`

## 💻 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Servidor de desenvolvimento
npm run dev:host     # Servidor acessível na rede
npm run build        # Build de produção
npm run build:dev    # Build de desenvolvimento
npm run preview      # Preview da build
```

### Qualidade de Código
```bash
npm run lint         # Análise de código
npm run lint:fix     # Correção automática
npm run type-check   # Verificação de tipos
```

### Testes
```bash
npm run test         # Execução dos testes
npm run test:watch   # Testes em modo watch
npm run test:ui      # Interface gráfica dos testes
npm run test:coverage # Relatório de cobertura
```

### Utilitários
```bash
npm run clean        # Limpeza de arquivos temporários
npm run deps:check   # Verificação de dependências
npm run deps:update  # Atualização de dependências
```

## 🧪 Testes

### Framework: Vitest

O projeto utiliza **Vitest** como framework de testes, oferecendo:
- ⚡ **Performance**: Execução rápida com Vite
- 🔄 **Hot Reload**: Testes em tempo real
- 📊 **Coverage**: Relatórios de cobertura integrados
- 🎯 **Mocking**: Sistema avançado de mocks

### Estrutura de Testes

```
test/
├── __mocks__/           # Mocks globais
├── fixtures/            # Dados de teste
├── helpers/             # Utilitários de teste
├── integration/         # Testes de integração
├── unit/               # Testes unitários
│   ├── components/     # Testes de componentes
│   ├── services/       # Testes de serviços
│   ├── models/         # Testes de modelos
│   └── utils/          # Testes de utilitários
└── setup.ts            # Configuração global
```

### Cobertura de Testes

| Módulo | Cobertura | Status |
|--------|-----------|--------|
| Models | 95% | ✅ |
| Services | 85% | ✅ |
| Components | 70% | ⚠️ |
| Utils | 90% | ✅ |
| **Total** | **82%** | ✅ |

### Comandos de Teste

```bash
# Execução básica
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Interface gráfica
npm run test:ui

# Relatório de cobertura
npm run test:coverage

# Testes específicos
npm test -- transaction
npm test -- --grep="Dashboard"
```

### Exemplo de Teste com DI

```typescript
// test/unit/services/TransactionService.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { DIContainer } from '@/di/DIContainer'
import { PersonalTransactionService } from '@/services/PersonalTransactionService'

describe('PersonalTransactionService', () => {
  let container: DIContainer
  let service: PersonalTransactionService

  beforeEach(() => {
    container = new DIContainer()
    // Mock das dependências
    container.register('supabase', () => mockSupabase)
    service = container.resolve('TRANSACTION_SERVICE')
  })

  it('should create transaction', async () => {
    const transaction = await service.create(mockTransaction)
    expect(transaction).toBeDefined()
  })
})
```

## 📦 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (Radix UI)
│   ├── forms/          # Formulários
│   ├── charts/         # Gráficos (Recharts)
│   └── layout/         # Layout e navegação
├── pages/              # Páginas da aplicação
│   ├── auth/           # Autenticação
│   ├── dashboard/      # Dashboard principal
│   ├── transactions/   # Gestão de transações
│   ├── budgets/        # Orçamentos
│   ├── goals/          # Metas financeiras
│   └── investments/    # Investimentos
├── lib/                # Bibliotecas e utilitários
│   ├── services/       # Serviços de negócio
│   ├── di/             # Injeção de dependências
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Funções utilitárias
│   └── supabase.ts     # Cliente Supabase
├── models/             # Modelos de dados
│   ├── Transaction.ts  # Modelo de transação
│   ├── Category.ts     # Modelo de categoria
│   ├── Investment.ts   # Modelo de investimento
│   └── User.ts         # Modelo de usuário
├── types/              # Definições de tipos
├── assets/             # Recursos estáticos
└── main.tsx           # Ponto de entrada
```

## 🔄 Integração com o Core

### Importações do Core

```typescript
// Componentes UI compartilhados
import { Button, Input, Card } from '@finmanage/core/components'

// Utilitários compartilhados
import { formatCurrency, validateCPF } from '@finmanage/core/utils'

// Hooks compartilhados
import { useAuth, useLocalStorage } from '@finmanage/core/hooks'

// Tipos compartilhados
import type { User, Transaction } from '@finmanage/core/types'
```

### Serviços Compartilhados

O core fornece interfaces que são implementadas no produto:

```typescript
// Core: Interface
export interface ITransactionService {
  create(transaction: Transaction): Promise<Transaction>
  findByUser(userId: string): Promise<Transaction[]>
  update(id: string, data: Partial<Transaction>): Promise<Transaction>
  delete(id: string): Promise<void>
}

// Personal: Implementação
export class PersonalTransactionService implements ITransactionService {
  // Implementação específica para finanças pessoais
}
```

### Extensões Específicas do Personal

- **PersonalDashboard**: Dashboard adaptado para finanças pessoais
- **PersonalBudgetService**: Gestão de orçamentos pessoais
- **PersonalGoalService**: Controle de metas financeiras
- **PersonalInvestmentService**: Gestão de carteira de investimentos

## 📚 Documentação Técnica

### Padrões de Código

- **ESLint**: Configuração rigorosa para qualidade
- **Prettier**: Formatação automática de código
- **TypeScript**: Tipagem estática obrigatória
- **Conventional Commits**: Padrão de commits semânticos
  
### Segurança

- **Row Level Security**: Isolamento de dados por usuário
- **JWT Tokens**: Autenticação segura
- **HTTPS**: Comunicação criptografada
- **Sanitização**: Prevenção de XSS e SQL Injection
