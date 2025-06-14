# FinManage SPL


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

[FinManage-Personal](https://finmanage-spl-product-personal.vercel.app/)

## 2. FinManage Diarista
Uma solução customizada para profissionais autônomos da área de limpeza. O produto simplifica a gestão financeira do dia a dia, permitindo um controle preciso sobre os ganhos e despesas do negócio.

Funcionalidades Exclusivas:

Cadastro de Clientes: Mantenha um registro organizado de todos os seus clientes.
Lançamento de Serviços: Registre cada serviço prestado, associando-o a um cliente e definindo o valor cobrado.
Controle de Gastos Operacionais: Adicione despesas relacionadas ao trabalho, como a compra de produtos de limpeza e custos de transporte.
Cálculo de Lucratividade por Serviço: Visualize de forma clara o lucro obtido em cada serviço, subtraindo os gastos associados do valor recebido.

[FinManage-Diarista](https://finmanage-diarista.vercel.app/)

## 3. FinManage MEI
Desenvolvido para atender às necessidades do Microempreendedor Individual (MEI) no Brasil. Além das funcionalidades financeiras do core, o produto oferece recursos essenciais para a gestão do negócio e o cumprimento das obrigações fiscais.

Funcionalidades Exclusivas:

Gestão de Clientes: Cadastre e gerencie as informações dos seus clientes de forma centralizada.
Controle de Vendas: Registre todas as vendas de produtos ou serviços, facilitando o acompanhamento do faturamento mensal.
Cálculo e Controle do Imposto DAS: O sistema calcula automaticamente o valor do Documento de Arrecadação do Simples Nacional (DAS) com base nas vendas e permite registrar os pagamentos para manter as obrigações fiscais em dia.

[FinManage-MEI](https://finmanage-mei.vercel.app/)
## Telas
Abaixo estão algumas telas que demonstram a interface e a experiência de usuário da versão atual do core.

### Telas do Core

#### Telas de Login e Cadastro
![login](https://github.com/user-attachments/assets/effa1648-41ae-43a6-a28a-d5c32409b38d)
![cadastro](https://github.com/user-attachments/assets/57561d6f-76b0-437d-874f-1719f3fe7030)

#### Dashboard Principal
![dashboard](https://github.com/user-attachments/assets/3ec20d5a-27dd-4b68-aa03-5804d3e17a90)

#### Tela de Transações
![transações](https://github.com/user-attachments/assets/35e3282b-7fba-49ac-ac8e-611ab0b547cf)

#### Tela de Categorias
![categorias](https://github.com/user-attachments/assets/77c2b4c7-1cca-483e-b908-bbeffec28989)

#### Tela de Relatórios
![relatorios](https://github.com/user-attachments/assets/fc5c1f97-7571-4f92-a4e9-d85e9f108619)

#### Tela de Configurações
![configurações](https://github.com/user-attachments/assets/5014780a-fab9-4295-8bc7-24c25e1953e9)

---

### Telas Exclusivas dos Produtos

#### FinManage Personal

Tela de Investimentos
![investimentos_personal](https://github.com/user-attachments/assets/f12e7c84-a8ed-43d1-ac59-3f18b74fb287)

Tela de Cadastro de Rendimentos
![redimentos_personal](https://github.com/user-attachments/assets/6ea23cba-d08b-4038-af8f-5dbffccfd222)

Tela de Objetivos Financeiros
![objetivos_personal](https://github.com/user-attachments/assets/7ceed6c0-8842-4ab7-8f7a-69f98a9c3318)

Tela de Orçamentos
![orcamentos_personal](https://github.com/user-attachments/assets/c40e11f6-7053-431a-9e3f-a189c2ef2e1c)

#### FinManage Diarista

Tela de Cadastro de Clientes
![clientes_diarista](https://github.com/user-attachments/assets/992a7845-be6c-42bc-aa4a-6291b0914c1e)

Tela de Cadastro de Serviços
![servicos_diarista](https://github.com/user-attachments/assets/db385522-f8af-47f8-82c0-e333877be95b)

Tela de Cadastro de Gasto Adicional por Serviço
![cadastrodegastoadicional_diarista](https://github.com/user-attachments/assets/17a3a400-7241-4c21-8cd9-7c49b0d424ff)

Tela de Detalhamento de Lucro por Serviço
![lucro_servico-diarista](https://github.com/user-attachments/assets/46d9fe72-f447-4398-b44f-912eb11d606c)

#### FinManage MEI
Tela de Cadastro de Clientes
![clientes](https://github.com/user-attachments/assets/efecf170-9d9c-4468-8719-50a4cc1d158f)

Tela de Cadastro de Vendas
![venda](https://github.com/user-attachments/assets/467eb230-e420-42f4-aab7-b38c8a98a1c4)

Tela da Calculadora de Imposto DAS
![calculadora das](https://github.com/user-attachments/assets/05b8eb3e-ec9a-4992-9231-135055e5c062)

Tela de Cadastro de Novo Imposto DAS
![registro de das](https://github.com/user-attachments/assets/5551d184-fc10-411f-b1a8-81cea32af0c2)

## Diferenças dos Produtos em Relação ao Core

Cada produto da linha FinManage estende as funcionalidades básicas do core com recursos específicos.

### FinManage Personal
O **FinManage Personal** adiciona funcionalidades voltadas para o planejamento financeiro pessoal que não estão presentes no core:
- **Telas de Investimentos**: Acompanhamento e gestão de carteira de investimentos
- **Cadastro de Rendimentos**: Registro de rendimentos de investimentos e outras fontes passivas
- **Orçamentos (Budgets)**: Criação e controle de orçamentos mensais por categoria
- **Objetivos Financeiros (Goals)**: Definição e acompanhamento de metas de economia para objetivos específicos

### FinManage Diarista
O **FinManage Diarista** incorpora funcionalidades específicas para profissionais autônomos da área de limpeza:
- **Gestão de Clientes**: Cadastro e controle detalhado de clientes
- **Lançamento de Serviços**: Registro de serviços prestados com associação a clientes
- **Controle de Gastos Operacionais**: Gestão de despesas específicas do trabalho (produtos de limpeza, transporte)
- **Cálculo de Lucratividade por Serviço**: Análise de rentabilidade individual de cada serviço prestado

### FinManage MEI
O **FinManage MEI** oferece recursos essenciais para Microempreendedores Individuais:
- **Gestão Avançada de Clientes**: Cadastro empresarial de clientes com dados fiscais
- **Controle de Vendas**: Registro detalhado de vendas de produtos e serviços
- **Gestão do DAS**: Cálculo automático e controle de pagamento do Documento de Arrecadação do Simples Nacional (DAS).

