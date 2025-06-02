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
- **Investimentos**: Controle de investimentos e seus rendimentos

## 🎨 Tema e Design
O FinManage Personal utiliza um tema verde-esmeralda que transmite equilíbrio, crescimento e estabilidade, elementos-chave para uma boa gestão financeira pessoal.

## 💉 Injeção de Dependências (DI)
O FinManage Personal implementa o padrão de Injeção de Dependências para as funcionalidades principais do sistema, permitindo maior modularidade e testabilidade. 

As principais funcionalidades que utilizam DI são:
- Autenticação (login/registro)
- Dashboard
- Transações
- Categorias
- Relatórios
- Configurações

Para mais detalhes sobre a estrutura de DI, consulte a [documentação específica](./docs/DI-STRUCTURE.md).

## 🗄️ Banco de Dados e Backend
O FinManage Personal utiliza o **Supabase** como plataforma de backend, fornecendo:

- **Autenticação de usuários**: Sistema completo de registro, login e recuperação de senha
- **Banco de dados PostgreSQL**: Armazenamento seguro e escalável dos dados
- **Row Level Security (RLS)**: Políticas de segurança que garantem que cada usuário só acesse seus próprios dados
- **API RESTful**: Endpoints para interação com o banco de dados

### Estrutura do Banco de Dados
O banco de dados consiste nas seguintes tabelas principais:

- **profiles**: Informações do perfil do usuário
- **categories**: Categorias para transações e investimentos
- **transactions**: Registro de receitas e despesas
- **budgets**: Orçamentos definidos pelo usuário
- **goals**: Metas financeiras
- **investments**: Investimentos realizados
- **investment_returns**: Rendimentos dos investimentos

Para mais detalhes sobre a estrutura do banco de dados, consulte o arquivo `supabase/database-schema.sql` na raiz do projeto.

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18.x
- npm >= 9.x
- Conta no Supabase (para desenvolvimento local com backend)

### Instalação
```bash
# Na raiz do monorepo (instala todas as dependências)
npm run install:all

# Ou especificamente para o produto personal
cd packages/product-personal
npm install
```

### Configuração do Supabase
1. Crie uma conta no [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. Execute o script SQL disponível em `supabase/database-schema.sql` no editor SQL do Supabase
4. Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
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
- Os serviços em `/src/lib/services` para a comunicação com o Supabase
- O arquivo `supabase/database-schema.sql` para a estrutura do banco de dados
- A documentação detalhada em `supabase/database-schema.md`
- A documentação de Injeção de Dependências em `docs/DI-STRUCTURE.md` 