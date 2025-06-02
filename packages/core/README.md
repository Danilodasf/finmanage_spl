# FinManage Core

## 📚 Visão Geral
O **FinManage Core** é o pacote central que contém os componentes compartilhados, hooks, utilitários e lógicas de negócio reutilizáveis em todos os produtos do ecossistema FinManage. Este pacote fornece a base para uma experiência consistente em todos os produtos derivados.

## 🛠️ Principais Recursos
- **Componentes UI**: Biblioteca completa de componentes reutilizáveis (botões, inputs, tabelas, etc.)
- **Hooks Personalizados**: Hooks para gerenciamento de estado, autenticação e outras funcionalidades comuns
- **Utilitários**: Funções auxiliares para formatação, validação e manipulação de dados
- **Temas**: Sistema de temas compartilhado baseado em Tailwind CSS
- **Controladores Base**: Classes e funções base para implementação de lógicas de negócio

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

## ⚠️ Diretrizes Importantes
- **Não adicione lógicas específicas de produto** no core
- Mantenha os componentes **altamente customizáveis** através de props
- Siga os **padrões de design** estabelecidos
- Garanta que as alterações no core não afetem negativamente os produtos existentes

## 🧪 Testando Alterações
Para verificar se suas alterações no core funcionam corretamente nos produtos derivados:

```bash
# Construa o core
npm run build:core

# Execute um produto específico para testar
npm run dev:personal
```
