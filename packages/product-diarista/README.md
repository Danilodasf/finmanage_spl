# FinManage Diarista

## 📱 Visão Geral
O **FinManage Diarista** é uma aplicação especializada para gestão financeira de diaristas e profissionais de limpeza, desenvolvida para auxiliar no controle de agendamentos, pagamentos, despesas e receitas específicas deste segmento profissional.

Este produto faz parte do ecossistema FinManage e compartilha componentes e funcionalidades do core, mas é adaptado especificamente para as necessidades do público diarista.

## 🛠️ Funcionalidades Principais
- **Agenda de Serviços**: Controle de agendamentos de limpeza
- **Registro de Clientes**: Cadastro e histórico de clientes atendidos
- **Controle de Pagamentos**: Registro de valores recebidos por serviço
- **Despesas Profissionais**: Gerenciamento de gastos com materiais e transporte
- **Relatórios Simplificados**: Visualização clara de ganhos e despesas
- **Notas Fiscais**: Auxílio na emissão de recibos para clientes
- **Lembretes**: Notificações de compromissos agendados

## 🎨 Tema e Design
O FinManage Diarista utiliza um tema amigável e intuitivo, com foco na simplicidade e facilidade de uso, considerando o contexto de utilização frequentemente mobile deste público.

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18.x
- npm >= 9.x

### Instalação
```bash
# Na raiz do monorepo (instala todas as dependências)
npm run install:all

# Ou especificamente para o produto diarista
cd packages/product-diarista
npm install
```

### Execução do Ambiente de Desenvolvimento
```bash
# Na raiz do monorepo
npm run dev:diarista

# Ou diretamente no diretório do produto
cd packages/product-diarista
npm run dev
```

O servidor de desenvolvimento será iniciado em `http://localhost:3003`.

## 🧪 Scripts Disponíveis
- `dev`: Inicia o servidor de desenvolvimento
- `build`: Gera a build de produção
- `lint`: Executa o linter
- `preview`: Visualiza a build localmente

## 🔄 Integração com o Core
O FinManage Diarista utiliza os componentes e utilitários do core, adaptando-os conforme necessário para suas necessidades específicas. Ao desenvolver novas funcionalidades, sempre verifique se algo semelhante já existe no core antes de implementar no produto.

## 📚 Documentação
Em desenvolvimento. As funcionalidades específicas para diaristas serão documentadas à medida que forem implementadas.

## 📝 Estado Atual
O FinManage Diarista está atualmente em fase inicial de desenvolvimento. A estrutura básica do projeto está configurada, mas a maioria das funcionalidades específicas para diaristas ainda será implementada. 