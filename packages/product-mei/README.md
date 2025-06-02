# FinManage MEI

## 📱 Visão Geral
O **FinManage MEI** é uma solução especializada para gestão financeira de Microempreendedores Individuais (MEI), focada em facilitar o controle financeiro, a emissão de notas fiscais e o acompanhamento de obrigações fiscais, permitindo que o empreendedor se concentre no crescimento do seu negócio.

Este produto faz parte do ecossistema FinManage e compartilha componentes e funcionalidades do core, mas é adaptado especificamente para as necessidades dos Microempreendedores Individuais.

## 🛠️ Funcionalidades Principais
- **Controle de Faturamento**: Monitoramento do limite de faturamento MEI
- **Gerenciamento de Clientes**: Cadastro e histórico de clientes
- **Emissão de Notas**: Integração com sistemas de emissão de NFS-e
- **Controle de Despesas**: Categorização específica para despesas empresariais
- **Obrigações Fiscais**: Lembretes de DAS e declaração anual
- **Relatórios Fiscais**: Geração de relatórios para contabilidade
- **Separação de Finanças**: Divisão clara entre despesas pessoais e do negócio

## 🎨 Tema e Design
O FinManage MEI utiliza um tema profissional, mas acessível, projetado para atender empreendedores com diferentes níveis de familiaridade com gestão financeira e ferramentas digitais.

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18.x
- npm >= 9.x

### Instalação
```bash
# Na raiz do monorepo (instala todas as dependências)
npm run install:all

# Ou especificamente para o produto MEI
cd packages/product-mei
npm install
```

### Execução do Ambiente de Desenvolvimento
```bash
# Na raiz do monorepo
npm run dev:mei

# Ou diretamente no diretório do produto
cd packages/product-mei
npm run dev
```

O servidor de desenvolvimento será iniciado em `http://localhost:3004`.

## 🧪 Scripts Disponíveis
- `dev`: Inicia o servidor de desenvolvimento
- `build`: Gera a build de produção
- `lint`: Executa o linter
- `preview`: Visualiza a build localmente

## 🔄 Integração com o Core
O FinManage MEI utiliza os componentes e utilitários do core, adaptando-os e estendendo-os conforme necessário para atender às necessidades específicas de um Microempreendedor Individual. Sempre verifique a disponibilidade de funcionalidades no core antes de implementar soluções específicas.

## 📚 Documentação
Em desenvolvimento. As funcionalidades específicas para MEI serão documentadas à medida que forem implementadas.

## 📝 Estado Atual
O FinManage MEI está atualmente em fase inicial de desenvolvimento. A estrutura básica do projeto está configurada, mas a maioria das funcionalidades específicas para Microempreendedores Individuais ainda será implementada. 