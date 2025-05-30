# FinManage

## Sobre o projeto

O **FinManage** é um sistema de gestão financeira pessoal, focado em simplicidade, segurança e facilidade de uso. Permite controlar receitas, despesas, visualizar relatórios e gerenciar suas finanças de forma intuitiva.

## Funcionalidades Principais

- **Controle de Gastos:** Monitore despesas e receitas em tempo real.
- **Relatórios Detalhados:** Visualize gráficos e relatórios sobre sua situação financeira.
- **Segurança:** Dados protegidos com criptografia (simulada no momento).
- **Interface Intuitiva:** Navegação simples para todos os perfis de usuário.
- **Autenticação:** Cadastro e login de usuários com validação de dados.

## Estrutura do Projeto

- **src/pages/Index.tsx:** Página inicial com apresentação do sistema e navegação para login/cadastro.
- **src/views/auth/Login.tsx:** Tela de login com validação de email e senha.
- **src/views/auth/Register.tsx:** Tela de cadastro com validação de nome, email, senha e confirmação de senha.
- **src/controllers/AuthController.ts:** Lógica de autenticação (login/cadastro) e validação de dados.
- **src/models/User.ts:** Modelos e validações de usuário.
- **src/components/ui:** Componentes reutilizáveis de interface (botão, input, label, etc).

## Tecnologias Utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui
- React Router DOM

## Como rodar o projeto localmente

```sh
npm install
npm run dev
```
