# FinManage Core

## Descrição Geral

O pacote `core` é o coração da Linha de Produtos de Software (SPL) FinManage. Ele é projetado para fornecer todas as funcionalidades centrais e componentes de UI compartilhados que são utilizados pelos diversos produtos da linha (FinManage Pessoal, FinManage MEI, FinManage Diarista). O objetivo do `core` é simplificar a organização financeira, o desenvolvimento de novos produtos e garantir consistência, centralizando a lógica de negócios comum, o acesso a dados, a autenticação e os elementos visuais básicos. Cada produto da linha usará essas funções do core para realizar suas operações específicas, adaptando-as e estendendo-as conforme necessário.

## Responsabilidades Principais

O `core` é responsável por:

* **Gestão de Usuários:** Controlar o cadastro, login, atualização de perfil pessoal com dados básicos e alteração de senha dos usuários.
* **Autenticação:** Proteger o acesso ao sistema, incluindo validação de credenciais, gerenciamento de sessões e autenticação via JWT.
* **Gerenciamento de Transações Financeiras:** Permitir o cadastro de gastos e recebimentos (por tipo, data, valor, descrição), e o gerenciamento (edição, exclusão) de transações anteriores.
* **Categorização:** Habilitar o cadastro de novas categorias e o gerenciamento de categorias já registradas para classificar as transações financeiras.
* **Geração de Relatórios e Visualizações:** Fornecer ferramentas para criar um painel com resumo financeiro por período, exibir gráficos de receitas vs. despesas, gerar relatórios personalizáveis por período/tipo e exportar dados em formatos como PDF ou CSV.
* **Manutenção de Histórico:** Guardar e apresentar o histórico de transações realizadas, com opções de editar e apagar transações.
* **Validação de Dados:** Assegurar a integridade dos dados inseridos no sistema, como a validação de dados de transações.
* **Acesso ao Banco de Dados:** Gerenciar a comunicação com o banco de dados para persistir e recuperar informações financeiras.
* **Componentes de UI Reutilizáveis:** Oferecer um conjunto de componentes visuais (ex: layouts, painéis, gráficos, formulários) para manter a consistência visual e funcionalidade entre os produtos.
* **Utilitários:** Disponibilizar funções auxiliares através da pasta `lib/`.

## Principais Módulos e Funcionalidades (Conceitual)

O `core` organiza suas funcionalidades, com base nos Requisitos Funcionais e Diagramas de Classe, em módulos que podem ser conceitualmente descritos da seguinte forma. Os nomes das funções são representativos e derivados dos diagramas:

* **`AuthModule`**:
    * `cadastrarUsuario(userData)`: Cadastra um novo usuário.
    * `fazerLogin(credentials)`: Autentica um usuário existente.
    * `atualizarPerfil(userId, profileData)`: Atualiza os dados do perfil do usuário.
    * `alterarSenha(userId, passwordData)`: Altera a senha do usuário.
* **`TransactionModule`**:
    * `criarTransacao(transactionData)`: Registra uma nova receita ou despesa.
    * `visualizarHistorico(filters)`: Retorna o histórico de transações.
    * `editarTransacao(transactionId, data)`: Edita uma transação existente do histórico.
    * `apagarTransacao(transactionId)`: Remove uma transação do histórico.
    * `gerenciarTransacao(transactionId, data)`: Gerencia transações anteriores.
* **`CategoryModule`**:
    * `criarCategoria(categoryData)`: Cadastra uma nova categoria.
    * `gerenciarCategoria(categoryId, data)`: Gerencia (lista, edita, exclui) categorias já registradas.
* **`ReportModule`**:
    * `gerarResumo(period)`: Gera um resumo financeiro para um determinado período.
    * `gerarGraficoReceitaVsDespesa(period)`: Prepara dados para gráficos de receitas vs. despesas.
    * `gerarRelatorioPersonalizado(period, type)`: Gera relatórios personalizáveis por período e tipo.
    * `exportarParaPdf(reportData)`: Exporta relatórios em formato PDF.

## Estrutura de Diretórios do `core/src`

A estrutura do código fonte (`src/`) do `core` é organizada para suportar o estilo arquitetural MVC (Model-View-Controller) e promover a modularidade e manutenibilidade:

* `auth/`: Contém a lógica específica para autenticação e gerenciamento de sessão de usuários.
* `components/`: Abriga componentes de Interface de Usuário (UI) reutilizáveis.
    * `Layout/`: Define os componentes estruturais principais do layout da aplicação.
    * `ui/`: Contém elementos de interface de usuário menores e mais genéricos.
* `controllers/`: Atuam como intermediários que processam as requisições do usuário, atualizam o Model e retornam respostas à View, contendo lógica de controle.
* `hooks/`: Armazena Hooks React customizados para lógica reutilizável em componentes.
* `lib/`: Contém Utilitários e funções auxiliares.
* `models/`: Responsáveis pela lógica de negócio e pela manipulação dos dados, interagindo com o banco de dados.
* `pages/`: Representam componentes de página genéricos.
* `views/`: Responsáveis pela interface do usuário (UI), apresentando os dados aos usuários através de painéis, gráficos e formulários.

## Integração com Produtos da Linha FinManage

Cada produto da linha FinManage (FinManage Pessoal, FinManage MEI, FinManage Diarista) utiliza as funcionalidades e componentes fornecidos pelo `core`. Isso permite que os produtos específicos se concentrem em implementar seus requisitos funcionais exclusivos, aproveitando uma base sólida e testada para as operações comuns de gerenciamento financeiro. Esta abordagem assegura a flexibilidade, segurança e facilidade de manutenção da linha de produtos.
