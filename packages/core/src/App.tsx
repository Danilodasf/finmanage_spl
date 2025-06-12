import { Toaster } from "@/components/ui/toaster";
// Importações de componentes de UI e bibliotecas externas
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importações das páginas da aplicação
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import Dashboard from "./views/Dashboard";
import Transactions from "./views/Transactions";
import Categories from "./views/Categories";
import Reports from "./views/Reports";
import Settings from "./views/Settings";
import NotFound from "./pages/NotFound";

// Configuração do cliente React Query para gerenciamento de estado do servidor
const queryClient = new QueryClient();

/**
 * Componente principal da aplicação FinManage Core
 * 
 * Responsabilidades:
 * - Configurar provedores globais (React Query, Tooltips, Toasters)
 * - Definir sistema de roteamento da aplicação
 * - Gerenciar navegação entre páginas
 * 
 * Estrutura de rotas:
 * - Rota raiz ("/") redireciona para login
 * - Rotas de autenticação: /login, /register
 * - Rotas principais: /dashboard, /transactions, /categories, /reports, /settings
 * - Rota 404 para páginas não encontradas
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Componentes de notificação global */}
      <Toaster />
      <Sonner />
      
      {/* Sistema de roteamento da aplicação */}
      <BrowserRouter>
        <Routes>
          {/* Rotas de autenticação */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas principais da aplicação */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Rota para páginas não encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
