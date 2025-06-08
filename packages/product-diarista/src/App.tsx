import React from 'react';
import AppRoutes from './routes';
import './App.css';

// Componente principal da aplicação
const App: React.FC = () => {
  return (
    <div className="App">
      {/* 
        Sistema de roteamento principal
        Inclui todas as rotas da aplicação:
        - Rotas públicas: /login, /register
        - Rotas protegidas: /dashboard, /transactions, /categories, /reports, /settings
        - Redirecionamentos automáticos baseados no status de autenticação
      */}
      <AppRoutes />
    </div>
  );
};

export default App;

/*
  Estrutura da aplicação FinManage Diarista:
  
  1. AUTENTICAÇÃO:
     - Sistema preparado para integração com Supabase Auth
     - Rotas protegidas com redirecionamento automático
     - Hook useAuth() centralizado para gerenciar estado de autenticação
  
  2. NAVEGAÇÃO:
     - Layout responsivo com sidebar
     - Menu de navegação intuitivo
     - Breadcrumbs e indicadores de página ativa
  
  3. FUNCIONALIDADES:
     - Dashboard: Visão geral das finanças
     - Transações: CRUD completo de receitas e despesas
     - Categorias: Organização e classificação
     - Relatórios: Análises e exportações
     - Configurações: Perfil e preferências
  
  4. INTEGRAÇÃO FUTURA COM SUPABASE:
     - Controllers preparados para substituir localStorage por Supabase
     - Estrutura de dados compatível com PostgreSQL
     - Autenticação pronta para Supabase Auth
     - Preparado para Real-time subscriptions
  
  5. UI/UX:
     - Design responsivo e moderno
     - Tailwind CSS para estilização
     - Componentes reutilizáveis
     - Feedback visual para ações do usuário
*/