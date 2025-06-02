# FinManage

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4.1-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.11-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn--ui-%23?logo=shadcn" alt="shadcn-ui" />
</p>

## ✨ Sobre o projeto
O **FinManage** é um sistema de gestão financeira modular com um core compartilhado e diferentes produtos direcionados a públicos específicos:

- **Personal**: Gestão financeira pessoal
- **Diarista**: Gestão financeira para profissionais de limpeza e diaristas
- **MEI**: Gestão financeira para Microempreendedores Individuais

Cada produto compartilha componentes e funcionalidades do core, mas possui interfaces e regras de negócio específicas para seu público-alvo.

---

## 🚀 Funcionalidades Principais
- **Controle de Gastos:** Monitore despesas e receitas em tempo real.
- **Relatórios Detalhados:** Visualize gráficos e relatórios sobre sua situação financeira.
- **Segurança:** Dados protegidos com criptografia (simulada no momento).
- **Interface Intuitiva:** Navegação simples para todos os perfis de usuário.
- **Autenticação:** Cadastro e login de usuários com validação de dados.

---

## 🗂️ Estrutura do Projeto
```
finmanage/
├── packages/
│   ├── core/                # Componentes e lógicas compartilhadas
│   ├── product-personal/    # Produto de gestão financeira pessoal
│   ├── product-diarista/    # Produto para diaristas e profissionais de limpeza
│   └── product-mei/         # Produto para Microempreendedores Individuais
└── package.json             # Configuração do monorepo
```

---

## 🛠️ Tecnologias Utilizadas
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Router DOM](https://reactrouter.com/)
- [Zod](https://zod.dev/) (validação)
- [React Hook Form](https://react-hook-form.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Recharts](https://recharts.org/)

---

## ⚙️ Como rodar o projeto localmente

### Pré-requisitos
- Node.js >= 18.x
- npm >= 9.x

### Instalação inicial
```sh
# Clone o repositório
git clone [url-do-repositorio]
cd finmanage

# Instale todas as dependências (raiz e pacotes)
npm run install:all
```

### Executando os produtos

#### Core (componentes compartilhados)
```sh
npm run dev:core
# Acesse: http://localhost:3000
```

#### FinManage Personal
```sh
npm run dev:personal
# Acesse: http://localhost:3002
```

#### FinManage Diarista
```sh
npm run dev:diarista
# Acesse: http://localhost:3003
```

#### FinManage MEI
```sh
npm run dev:mei
# Acesse: http://localhost:3004
```

### Scripts disponíveis
- `install:all`: Instala todas as dependências em todos os pacotes
- `dev:core`: Inicia o servidor de desenvolvimento do core
- `build:core`: Gera a build de produção do core
- `dev:personal`: Inicia o servidor de desenvolvimento do produto Personal
- `build:personal`: Gera a build de produção do produto Personal
- `dev:diarista`: Inicia o servidor de desenvolvimento do produto Diarista
- `build:diarista`: Gera a build de produção do produto Diarista
- `dev:mei`: Inicia o servidor de desenvolvimento do produto MEI
- `build:mei`: Gera a build de produção do produto MEI

---

## 📦 Versões das principais dependências
- React: 18.3.1
- TypeScript: 5.5.3
- Vite: 5.4.1
- Tailwind CSS: 3.4.11
- shadcn/ui: última
