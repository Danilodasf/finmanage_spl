import React from 'react';
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/auth/Login";
import LoginDI from "./views/auth/LoginDI";
import Register from "./views/auth/Register";
import RegisterDI from "./views/auth/RegisterDI";
import DashboardDI from "./views/DashboardDI";
import Transactions from "./views/Transactions";
import TransactionsDI from "./views/TransactionsDI";
import ImpostoDAS from "./views/ImpostoDAS";
import Categories from "./views/Categories";
import Reports from "./views/Reports";
import ReportsDI from "./views/ReportsDI";
import Settings from "./views/Settings";
import NotFound from "./pages/NotFound";
import Vendas from "./views/Vendas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-di" element={<LoginDI />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-di" element={<RegisterDI />} />
          <Route path="/dashboard" element={<Navigate to="/dashboard-di" replace />} />
          <Route path="/dashboard-di" element={<DashboardDI />} />
          <Route path="/transactions" element={<TransactionsDI />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/imposto-das" element={<ImpostoDAS />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/reports" element={<ReportsDI />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App; 