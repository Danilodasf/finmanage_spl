# FinManage Personal

## 📱 Visão Geral
O **FinManage Personal** é um aplicativo de gestão financeira pessoal desenvolvido para ajudar indivíduos a controlar suas finanças, monitorar despesas, estabelecer metas financeiras e visualizar relatórios detalhados sobre seus hábitos financeiros.

Este produto faz parte do ecossistema FinManage e compartilha componentes e funcionalidades do core, mas é adaptado especificamente para as necessidades de gestão financeira pessoal.

## 🛠️ Funcionalidades Principais
- **Dashboard Personalizado**: Visualização rápida da saúde financeira
- **Controle de Despesas**: Registro e categorização de gastos
- **Gestão de Receitas**: Controle de fontes de renda
- **Categorização**: Organização de transações por categorias
- **Metas Financeiras**: Definição e acompanhamento de objetivos
- **Relatórios Analíticos**: Gráficos e análises de padrões de gasto
- **Perfil de Usuário**: Personalização de preferências

## 🎨 Tema e Design
O FinManage Personal utiliza um tema verde-esmeralda que transmite equilíbrio, crescimento e estabilidade, elementos-chave para uma boa gestão financeira pessoal.

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18.x
- npm >= 9.x

### Instalação
```bash
# Na raiz do monorepo (instala todas as dependências)
npm run install:all

# Ou especificamente para o produto personal
cd packages/product-personal
npm install
```

### Execução do Ambiente de Desenvolvimento
```bash
# Na raiz do monorepo
npm run dev:personal

# Ou diretamente no diretório do produto
cd packages/product-personal
npm run dev
```

O servidor de desenvolvimento será iniciado em `http://localhost:3002`.

## 🧪 Scripts Disponíveis
- `dev`: Inicia o servidor de desenvolvimento
- `build`: Gera a build de produção
- `build:dev`: Gera a build para ambiente de desenvolvimento
- `lint`: Executa o linter
- `preview`: Visualiza a build localmente

## 🔄 Integração com o Core
O FinManage Personal utiliza os componentes e utilitários do core, adaptando-os conforme necessário para suas necessidades específicas. Recomenda-se sempre verificar se uma funcionalidade já existe no core antes de implementá-la novamente no produto.

## 📚 Documentação
Para entender melhor as funcionalidades disponíveis no FinManage Personal, consulte:

- A documentação do core para componentes e utilitários compartilhados
- Os arquivos de modelo em `/src/models` para entender as estruturas de dados
- Os controladores em `/src/controllers` para a lógica de negócio 