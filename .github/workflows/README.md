# GitHub Actions Workflows

Este diretório contém o workflow simplificado do GitHub Actions para automatizar testes do projeto FinManage.

##  Workflow Disponível

### CI - Testes Automatizados (`ci.yml`)
**Trigger**: Push e Pull Request para `main` e `develop`

**Funcionalidades**:
- Executa testes unitários de todos os packages
- Executa testes de integração de todos os packages
- Bloqueia merge se os testes falharem
- Permite merge automaticamente se os testes passarem

**Jobs**:
- `tests`: Executa todos os testes unitários e de integração
- `merge-gate`: Verifica se os testes passaram e controla o merge

## Como Usar

### Funcionamento Automático
O workflow executa automaticamente quando:
- Você faz push para as branches `main` ou `develop`
- Você abre um Pull Request para essas branches

### Execução Manual
Você pode executar o workflow manualmente:
1. Vá para a aba "Actions" do repositório
2. Selecione "CI - Testes Automatizados"
3. Clique em "Run workflow"

## Proteção de Branch

Para garantir que apenas código testado seja merged:
1. Vá em Settings > Branches no GitHub
2. Adicione uma regra para `main` e `develop`
3. Marque "Require status checks to pass before merging"
4. Selecione "merge-gate" como check obrigatório

## Status do Workflow

Adicione este badge ao README principal:

```markdown
![CI](https://github.com/seu-usuario/finmanage-spl/workflows/CI%20-%20Testes%20Automatizados/badge.svg)
```

### Executar Testes Localmente

Antes de fazer push, você pode executar os mesmos comandos que os workflows:

```bash
# Instalar dependências
npm run install:all

# Build do core
npm run build:core

# Executar todos os testes
npm run test:all

# Executar testes específicos
npm run test:core
npm run test:personal
npm run test:diarista
npm run test:mei

# Executar linting
cd packages/core && npm run lint
cd packages/product-personal && npm run lint
cd packages/product-diarista && npm run lint
cd packages/product-mei && npm run lint
```