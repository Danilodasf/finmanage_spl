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

Claro! Aqui está o conteúdo completo e consolidado para o seu README.md, unindo todas as seções que criamos.

## Primeira Versão Funcional do Core
A primeira versão funcional do core do FinManage concentra-se em estabelecer a base sólida para a nossa linha de produtos financeiros.

## Core
O core é o coração do FinManage e foi desenvolvido para ser robusto, escalável e reutilizável. Nesta primeira versão, as seguintes funcionalidades estão implementadas e prontas para uso:

Gestão de Usuários: Sistema de login e registro de usuários.
Dashboard Intuitivo: Uma visão geral e centralizada das finanças do usuário, com acesso rápido às principais funcionalidades.
Gestão de Transações: Interface para adicionar, visualizar e excluir transações financeiras (receitas e despesas).
Controle de Categorias: Funcionalidade para criar e gerenciar categorias personalizadas, permitindo uma organização financeira mais detalhada.
Relatórios Financeiros: Geração de relatórios básicos para que o usuário possa visualizar e entender seus padrões de gastos e receitas.
Produtos
A partir do core, a linha de produtos FinManage se ramifica em três soluções especializadas, cada uma projetada para atender às necessidades de um público específico.

## 1. FinManage Personal
Uma ferramenta completa para o usuário individual que deseja ter um controle claro e eficiente de suas finanças pessoais. Ideal para gerenciar o orçamento, controlar despesas e alcançar objetivos financeiros.

Funcionalidades Exclusivas:

Gestão de Orçamentos (Budgets): Crie orçamentos mensais por categoria para acompanhar seus gastos e garantir que você não ultrapasse seus limites.
Metas Financeiras (Goals): Defina metas de economia para objetivos específicos, como uma viagem ou a compra de um bem, e acompanhe seu progresso ao longo do tempo.
Acompanhamento de Investimentos (Investments): Monitore o desempenho de seus investimentos, permitindo uma visão consolidada de seu patrimônio e sua evolução.

## 2. FinManage Diarista
Uma solução customizada para profissionais autônomos da área de limpeza. O produto simplifica a gestão financeira do dia a dia, permitindo um controle preciso sobre os ganhos e despesas do negócio.

Funcionalidades Exclusivas:

Cadastro de Clientes: Mantenha um registro organizado de todos os seus clientes.
Lançamento de Serviços: Registre cada serviço prestado, associando-o a um cliente e definindo o valor cobrado.
Controle de Gastos Operacionais: Adicione despesas relacionadas ao trabalho, como a compra de produtos de limpeza e custos de transporte.
Cálculo de Lucratividade por Serviço: Visualize de forma clara o lucro obtido em cada serviço, subtraindo os gastos associados do valor recebido.

## 3. FinManage MEI
Desenvolvido para atender às necessidades do Microempreendedor Individual (MEI) no Brasil. Além das funcionalidades financeiras do core, o produto oferece recursos essenciais para a gestão do negócio e o cumprimento das obrigações fiscais.

Funcionalidades Exclusivas:

Gestão de Clientes: Cadastre e gerencie as informações dos seus clientes de forma centralizada.
Controle de Vendas: Registre todas as vendas de produtos ou serviços, facilitando o acompanhamento do faturamento mensal.
Cálculo e Controle do Imposto DAS: O sistema calcula automaticamente o valor do Documento de Arrecadação do Simples Nacional (DAS) com base nas vendas e permite registrar os pagamentos para manter as obrigações fiscais em dia.

## Telas
Abaixo estão algumas telas que demonstram a interface e a experiência de usuário da versão atual do core.

Tela de Login e Cadastro
![login](https://github.com/user-attachments/assets/effa1648-41ae-43a6-a28a-d5c32409b38d)
![cadastro](https://github.com/user-attachments/assets/57561d6f-76b0-437d-874f-1719f3fe7030)


Dashboard Principal
![dashboard](https://github.com/user-attachments/assets/3ec20d5a-27dd-4b68-aa03-5804d3e17a90)


Tela de Transações
![transações](https://github.com/user-attachments/assets/35e3282b-7fba-49ac-ac8e-611ab0b547cf)


Tela de Categorias
![categorias](https://github.com/user-attachments/assets/77c2b4c7-1cca-483e-b908-bbeffec28989)

Tela de Relatórios
![relatorios](https://github.com/user-attachments/assets/fc5c1f97-7571-4f92-a4e9-d85e9f108619)


Tela de Configurações
![configurações](https://github.com/user-attachments/assets/5014780a-fab9-4295-8bc7-24c25e1953e9)


