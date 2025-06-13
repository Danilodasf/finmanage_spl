# FinManage Diarista

> Sistema de gestão financeira especializado para profissionais diaristas e prestadores de serviços domésticos.

## 📋 Visão Geral

O FinManage Diarista é uma aplicação web desenvolvida em React que oferece ferramentas específicas para gestão financeira de diaristas, incluindo controle de serviços, transações, categorias e relatórios financeiros. O sistema utiliza arquitetura de injeção de dependências (DI) para maior modularidade e testabilidade.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React** `^18.3.1` - Biblioteca para construção de interfaces
- **TypeScript** `^5.2.2` - Superset do JavaScript com tipagem estática
- **Vite** `^6.3.5` - Build tool e dev server
- **React Router DOM** `^6.30.1` - Roteamento para aplicações React
- **React Query** `^4.32.6` - Gerenciamento de estado e cache de dados

### UI/UX
- **Tailwind CSS** `^3.4.4` - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e customizáveis
  - `@radix-ui/react-label` `^2.1.7`
  - `@radix-ui/react-popover` `^1.1.14`
  - `@radix-ui/react-select` `^2.2.5`
  - `@radix-ui/react-slot` `^1.1.0`
- **Lucide React** `^0.263.1` - Biblioteca de ícones
- **Class Variance Authority** `^0.7.1` - Utilitário para variantes de classes CSS
- **clsx** `^2.1.1` - Utilitário para concatenação de classes CSS
- **tailwind-merge** `^1.14.0` - Merge inteligente de classes Tailwind

### Backend/Database
- **Supabase** `^2.38.4` - Backend as a Service (BaaS)
- **@finmanage/core** - Pacote interno com interfaces e lógica compartilhada

### Utilitários
- **date-fns** `^2.30.0` - Biblioteca para manipulação de datas
- **jsPDF** `^3.0.1` - Geração de documentos PDF
- **Recharts** `^2.15.3` - Biblioteca de gráficos para React
- **React Day Picker** `^8.10.1` - Componente de seleção de datas

### Desenvolvimento
- **ESLint** `^8.57.0` - Linter para JavaScript/TypeScript
- **PostCSS** `^8.4.38` - Processador de CSS
- **Autoprefixer** `^10.4.19` - Plugin PostCSS para prefixos CSS

## 📁 Estrutura de Pastas

```
src/
├── components/              # Componentes React reutilizáveis
│   ├── Layout/              # Componentes de layout
│   │   └── AuthLayout.tsx   # Layout para páginas de autenticação
│   ├── examples/            # Componentes de exemplo
│   │   └── DIExample.tsx    # Exemplo de uso da DI
│   ├── ui/                  # Componentes de interface básicos
│   │   ├── button.tsx       # Componente de botão
│   │   ├── input.tsx        # Componente de input
│   │   └── label.tsx        # Componente de label
│   ├── AddExpenseModal.tsx  # Modal para adicionar despesas
│   └── Layout.tsx           # Layout principal
├── controllers/             # Controladores com lógica de negócio
│   ├── DIAuthController.ts          # Controlador de autenticação (DI)
│   ├── DICategoryController.ts      # Controlador de categorias (DI)
│   ├── DISettingsController.ts      # Controlador de configurações (DI)
│   ├── DITransactionController.ts   # Controlador de transações (DI)
│   ├── DiaristaController.ts        # Controlador específico para diaristas
│   └── ServicoController.ts         # Controlador de serviços
├── hooks/                   # React Hooks customizados
│   ├── useAuth.tsx          # Hook para autenticação
│   ├── useCategories.ts     # Hook para categorias
│   └── useTransactions.ts   # Hook para transações
├── lib/                     # Bibliotecas e utilitários
│   ├── core/                # Interfaces e tipos do core
│   │   ├── di/              # Sistema de injeção de dependências
│   │   └── services/        # Interfaces de serviços
│   ├── database/            # Adaptadores de banco de dados
│   │   └── DatabaseAdapter.ts
│   ├── di/                  # Configuração da DI
│   │   └── bootstrap.ts     # Inicialização do container DI
│   └── utils.ts             # Funções utilitárias
├── models/                  # Modelos de dados
│   ├── Diarista.ts          # Modelo de diarista
│   ├── DiaristaModels.ts    # Modelos específicos do domínio
│   └── Servico.ts           # Modelo de serviço
├── routes/                  # Configuração de rotas
│   └── index.tsx            # Definição das rotas
├── services/                # Implementações de serviços
│   ├── DiaristaAuthService.ts       # Serviço de autenticação
│   ├── DiaristaCategoryService.ts   # Serviço de categorias
│   └── DiaristaTransactionService.ts # Serviço de transações
├── views/                   # Páginas/Views da aplicação
│   ├── auth/                # Páginas de autenticação
│   │   ├── Login.tsx        # Página de login
│   │   └── Register.tsx     # Página de registro
│   ├── Categories.tsx       # Página de categorias
│   ├── Dashboard.tsx        # Dashboard principal
│   ├── Reports.tsx          # Página de relatórios
│   ├── ServiceProfits.tsx   # Página de lucros por serviço
│   ├── Services.tsx         # Página de serviços
│   ├── Settings.tsx         # Página de configurações
│   └── Transactions.tsx     # Página de transações
├── App.tsx                  # Componente principal da aplicação
├── main.tsx                 # Ponto de entrada da aplicação
├── App.css                  # Estilos globais da aplicação
└── index.css                # Estilos base
```

## 🏗️ Arquitetura

### Sistema de Injeção de Dependências (DI)

O projeto utiliza um sistema de injeção de dependências personalizado que permite:

- **Desacoplamento**: Separação clara entre interfaces e implementações
- **Testabilidade**: Facilita a criação de mocks para testes
- **Flexibilidade**: Permite trocar implementações facilmente
- **Reutilização**: Aproveita interfaces do `@finmanage/core`

#### Fluxo da DI

1. **Interfaces** definidas no `@finmanage/core`
2. **Implementações** específicas nos serviços (`DiaristaAuthService`, etc.)
3. **Registro** no container via `bootstrap.ts`
4. **Injeção** nos controladores
5. **Uso** nas views através dos controladores

### Padrões Arquiteturais

- **MVC**: Model-View-Controller para organização do código
- **Repository Pattern**: Abstração da camada de dados
- **Service Layer**: Lógica de negócio encapsulada em serviços
- **Dependency Injection**: Inversão de controle para dependências

## ⚙️ Configurações

### TypeScript
- **Target**: ES2020
- **Configuração modular** com `tsconfig.app.json` e `tsconfig.node.json`
- **Strict mode** habilitado para maior segurança de tipos

### Vite
- **Target**: ES2020
- **Plugin React** para suporte ao JSX
- **Build otimizado** com tree-shaking
- **Hot Module Replacement (HMR)** para desenvolvimento

### Tailwind CSS
- **JIT Mode** para compilação sob demanda
- **Purge** automático de CSS não utilizado
- **Configuração customizada** para o design system

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Supabase** (configuração de banco de dados)

### Instalação

1. **Clone o repositório** (se ainda não foi feito):
   ```bash
   git clone <url-do-repositorio>
   cd finmanage_spl
   ```

2. **Instale as dependências** do workspace:
   ```bash
   npm install
   ```

3. **Navegue para o diretório do produto**:
   ```bash
   cd packages/product-diarista
   ```

4. **Configure as variáveis de ambiente**:
   - Copie o arquivo `.env.example` (se existir) para `.env`
   - Configure as credenciais do Supabase

### Desenvolvimento

```bash
# Executar em modo de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000` (ou outra porta disponível).

### Build

```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

### Linting

```bash
# Executar linter
npm run lint
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter ESLint

## 📦 Dependências Principais

### Produção

| Pacote | Versão | Descrição |
|--------|--------|----------|
| @finmanage/core | file:../core | Pacote interno com interfaces compartilhadas |
| react | ^18.3.1 | Biblioteca para interfaces de usuário |
| react-dom | ^18.3.1 | Renderização DOM para React |
| typescript | ^5.2.2 | Superset tipado do JavaScript |
| @supabase/supabase-js | ^2.38.4 | Cliente JavaScript para Supabase |
| @tanstack/react-query | ^4.32.6 | Gerenciamento de estado e cache |
| react-router-dom | ^6.30.1 | Roteamento para React |
| tailwindcss | ^3.4.4 | Framework CSS utilitário |
| lucide-react | ^0.263.1 | Biblioteca de ícones |
| recharts | ^2.15.3 | Biblioteca de gráficos |
| date-fns | ^2.30.0 | Utilitários para datas |
| jspdf | ^3.0.1 | Geração de PDFs |

### Desenvolvimento

| Pacote | Versão | Descrição |
|--------|--------|----------|
| vite | ^6.3.5 | Build tool e dev server |
| @vitejs/plugin-react | ^4.5.1 | Plugin React para Vite |
| eslint | ^8.57.0 | Linter para JavaScript/TypeScript |
| @typescript-eslint/eslint-plugin | ^7.2.0 | Plugin ESLint para TypeScript |
| autoprefixer | ^10.4.19 | Plugin PostCSS para prefixos |
| postcss | ^8.4.38 | Processador de CSS |

##  Funcionalidades

### Gestão de Serviços
- Cadastro e controle de serviços prestados
- Cálculo automático de lucros por serviço
- Histórico detalhado de atendimentos

### Controle Financeiro
- Registro de receitas e despesas
- Categorização automática de transações
- Relatórios financeiros detalhados
- Gráficos e visualizações

### Sistema de Autenticação
- Login e registro de usuários
- Gestão de perfil
- Controle de sessão

### Relatórios e Analytics
- **Relatórios Financeiros**: Receitas, despesas e lucro
- **Análise de Performance**: Métricas de produtividade
- **Exportação**: PDF, Excel, CSV
- **Dashboards Visuais**: Gráficos e métricas em tempo real
- **Histórico de Trabalhos**: Acompanhamento completo de serviços

## Como Usar o Sistema

### Primeiros Passos

1. **Acesse o Sistema**
   - Abra o navegador e acesse a aplicação
   - Faça login com suas credenciais ou registre-se

2. **Configure seu Perfil**
   - Vá em "Configurações" no menu lateral
   - Preencha seus dados pessoais e profissionais
   - Configure suas preferências de trabalho e notificações

### Gestão de Clientes

1. **Cadastrar Novo Cliente**
   - Acesse "Clientes" no menu
   - Clique em "Novo Cliente"
   - Preencha: Nome, Endereço, Telefone, Email
   - Adicione observações especiais sobre a casa/apartamento
   - Salve as informações

2. **Gerenciar Clientes Existentes**
   - Use a barra de pesquisa para localizar clientes
   - Visualize histórico de trabalhos realizados
   - Edite informações e preferências do cliente
   - Marque clientes como favoritos ou inativos

### Agendamento de Trabalhos

1. **Criar Novo Agendamento**
   - Acesse "Agenda" no menu
   - Clique em "Novo Trabalho"
   - Selecione o cliente e tipo de serviço
   - Defina data, horário e duração estimada
   - Adicione observações específicas

2. **Gerenciar Agenda**
   - Visualize trabalhos por dia, semana ou mês
   - Reagende trabalhos quando necessário
   - Marque trabalhos como concluídos
   - Acompanhe status de pagamento

### Controle Financeiro

1. **Registrar Receitas**
   - Registre pagamentos recebidos por trabalho
   - Categorize por tipo de serviço
   - Acompanhe formas de pagamento (dinheiro, PIX, cartão)
   - Controle trabalhos em aberto

2. **Controlar Despesas**
   - Registre gastos com materiais de limpeza
   - Controle custos de transporte
   - Categorize despesas profissionais
   - Mantenha comprovantes organizados

### Gestão de Serviços

1. **Tipos de Serviço**
   - Configure diferentes tipos de limpeza
   - Defina preços por tipo de serviço
   - Estabeleça tempo estimado para cada tipo
   - Crie pacotes promocionais

2. **Histórico de Trabalhos**
   - Acompanhe todos os serviços realizados
   - Avalie satisfação do cliente
   - Identifique serviços mais rentáveis
   - Analise produtividade por período

### Relatórios e Análises

1. **Relatórios Financeiros**
   - Acesse "Relatórios" no menu
   - Visualize receitas e despesas por período
   - Acompanhe evolução do faturamento
   - Exporte dados para contabilidade

2. **Análise de Performance**
   - Monitore quantidade de trabalhos por mês
   - Identifique clientes mais frequentes
   - Analise sazonalidade do negócio
   - Acompanhe crescimento da carteira de clientes