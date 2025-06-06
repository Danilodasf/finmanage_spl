import React from 'react';
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginDI from "./views/auth/LoginDI";
import RegisterDI from "./views/auth/RegisterDI";
import DashboardDI from "./views/DashboardDI";
import TransactionsDI from "./views/TransactionsDI";
import ImpostoDAS from "./views/ImpostoDAS";
import Categories from "./views/Categories";
import AdminSetup from "./views/AdminSetup";
import ReportsDI from "./views/ReportsDI";
import Settings from "./views/Settings";
import NotFound from "./pages/NotFound";
import Vendas from "./views/Vendas";
import NotificationsPage from "./pages/NotificationsPage";
import { AuthProvider, ProtectedRoute } from './lib/AuthContext';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<LoginDI />} />
            <Route path="/login" element={<LoginDI />} />
            <Route path="/login-di" element={<LoginDI />} />
            <Route path="/register" element={<RegisterDI />} />
            <Route path="/register-di" element={<RegisterDI />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardDI /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsDI /></ProtectedRoute>} />
            <Route path="/vendas" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
            <Route path="/imposto-das" element={<ProtectedRoute><ImpostoDAS /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsDI /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/admin-setup" element={<ProtectedRoute><AdminSetup /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;