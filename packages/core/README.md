# FinManage Core

## 📚 Visão Geral
O **FinManage Core** é o pacote central que contém os componentes compartilhados, hooks, utilitários e lógicas de negócio reutilizáveis em todos os produtos do ecossistema FinManage. Este pacote fornece a base para uma experiência consistente em todos os produtos derivados.

## 🛠️ Principais Recursos
- **Componentes UI**: Biblioteca completa de componentes reutilizáveis (botões, inputs, tabelas, etc.)
- **Hooks Personalizados**: Hooks para gerenciamento de estado, autenticação e outras funcionalidades comuns
- **Utilitários**: Funções auxiliares para formatação, validação e manipulação de dados
- **Temas**: Sistema de temas compartilhado baseado em Tailwind CSS
- **Controladores Base**: Classes e funções base para implementação de lógicas de negócio
- **Sistema de Injeção de Dependências**: Estrutura para implementação de DI nos produtos específicos

## 💉 Injeção de Dependências (DI)
O FinManage Core implementa um sistema de injeção de dependências que permite aos produtos específicos:

- Implementar interfaces de serviços definidas no core
- Registrar implementações específicas em um container central
- Acessar serviços de forma desacoplada em toda a aplicação

Este sistema facilita:
- **Testabilidade**: Serviços podem ser facilmente substituídos por mocks em testes
- **Manutenibilidade**: Alterações em implementações não afetam o código cliente
- **Flexibilidade**: Cada produto pode ter suas próprias implementações dos serviços

### Componentes Principais do Sistema de DI:
- `DIContainer`: Container central para registro e recuperação de serviços
- Interfaces de serviço (em `/src/lib/di/types.ts`)
- Tokens para identificação de serviços (em `/src/lib/di/tokens.ts`)

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18.x
- npm >= 9.x

### Instalação
```bash
# Na raiz do monorepo
npm install

# Ou especificamente para o core
cd packages/core
npm install
```

### Execução do Ambiente de Desenvolvimento
```bash
# Na raiz do monorepo
npm run dev:core

# Ou diretamente no diretório do core
cd packages/core
npm run dev
```

O servidor de desenvolvimento será iniciado em `http://localhost:3000`.

## 🧪 Testes
O FinManage Core inclui testes unitários utilizando Vitest. Para executar os testes:

```bash
# Na raiz do monorepo
npm run test:core

# Ou diretamente no diretório do core
cd packages/core
npm test
```

### Estrutura de Testes
Os testes estão organizados na pasta `/test` com uma estrutura que espelha a estrutura de `/src`:
- `/test/models`: Testes para interfaces e modelos de dados
- `/test/lib`: Testes para utilitários e funções auxiliares
- `/test/setup.test.ts`: Testes básicos para verificar o ambiente de testes

## 📝 Documentação de Componentes
A documentação dos componentes é essencial para a reutilização eficiente do core. Cada componente deve ser adequadamente documentado com:

- Descrição e propósito
- Props e suas descrições
- Exemplos de uso
- Variações de estilo

## 🔄 Fluxo de Trabalho
1. Desenvolva componentes no core para reutilização
2. Exporte os componentes através de barris (index.ts)
3. Importe nos produtos específicos conforme necessário
4. Implemente interfaces de serviço em produtos específicos usando o sistema de DI

## ⚠️ Diretrizes Importantes
- **Não adicione lógicas específicas de produto** no core
- Mantenha os componentes **altamente customizáveis** através de props
- Siga os **padrões de design** estabelecidos
- Garanta que as alterações no core não afetem negativamente os produtos existentes
- Escreva testes para todos os novos componentes e funcionalidades
- Mantenha as interfaces de serviço genéricas o suficiente para acomodar diferentes implementações

## 🧪 Testando Alterações
Para verificar se suas alterações no core funcionam corretamente nos produtos derivados:

```bash
# Construa o core
npm run build:core

# Execute os testes para garantir que tudo continua funcionando
npm run test:core

# Execute um produto específico para testar a integração
npm run dev:personal
```
