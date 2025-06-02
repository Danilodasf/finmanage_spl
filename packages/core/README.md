# FinManage

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4.1-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.11-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn--ui-%23?logo=shadcn" alt="shadcn-ui" />
</p>

## ✨ Sobre o projeto
O **FinManage** é um sistema de gestão financeira pessoal, focado em simplicidade, segurança e facilidade de uso. Permite controlar receitas, despesas, visualizar relatórios e gerenciar suas finanças de forma intuitiva.

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
src/
├── components/
│   ├── Layout/           # Layouts reutilizáveis
│   └── ui/               # Componentes de interface (botão, input, etc)
├── controllers/
│   └── AuthController.ts # Lógica de autenticação
├── hooks/                # Hooks customizados
├── lib/                  # Bibliotecas/utilitários
├── models/
│   └── User.ts           # Modelos e validações de usuário
├── pages/
│   ├── Index.tsx         # Página inicial
│   └── NotFound.tsx      # Página 404
├── views/
│   └── auth/
│       ├── Login.tsx     # Tela de login
│       └── Register.tsx  # Tela de cadastro
└── App.tsx, main.tsx     # Entradas principais do app
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

### Passos
```sh
# Instale as dependências
yarn install # ou npm install

# Rode o projeto em modo desenvolvimento
yarn dev     # ou npm run dev

# Acesse: http://localhost:8080
```

### Scripts úteis
- `dev`: inicia o servidor de desenvolvimento
- `build`: gera a build de produção
- `preview`: visualiza a build localmente
- `lint`: executa o linter

---

## 📦 Versões das principais dependências
- React: 18.3.1
- TypeScript: 5.5.3
- Vite: 5.4.1
- Tailwind CSS: 3.4.11
- shadcn/ui: última

---

## 💡 Sugestões de melhoria
- Adicionar testes automatizados (unitários e e2e)
- Configurar CI/CD
- Documentar API (se aplicável)
- Adicionar exemplos de uso para componentes customizados

---

<p align="center">
  <b>FinManage</b> &copy; 2024 — Sistema de gestão financeira pessoal
</p>
