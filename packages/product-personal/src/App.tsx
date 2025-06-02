import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginDI from "./views/auth/LoginDI";
import RegisterDI from "./views/auth/RegisterDI";
import DashboardDI from "./views/DashboardDI";
import Transactions from "./views/Transactions";
import TransactionsDI from "./views/TransactionsDI";
import CategoriesDI from "./views/CategoriesDI";
import Goals from "./views/Goals";
import Budgets from "./views/Budgets";
import Investments from "./views/Investments";
import ReportsDI from "./views/ReportsDI";
import SettingsDI from "./views/SettingsDI";
import NotFound from "./pages/NotFound";
import { AuthProvider, ProtectedRoute } from "./lib/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Redirecionamentos para páginas de auth com DI */}
            <Route path="/" element={<Navigate to="/login-di" replace />} />
            <Route path="/login" element={<Navigate to="/login-di" replace />} />
            <Route path="/register" element={<Navigate to="/register-di" replace />} />
            
            {/* Páginas de auth com DI */}
            <Route path="/login-di" element={<LoginDI />} />
            <Route path="/register-di" element={<RegisterDI />} />
            
            {/* Redirecionamentos para páginas DI */}
            <Route path="/dashboard" element={<Navigate to="/dashboard-di" replace />} />
            <Route path="/dashboard-di" element={<ProtectedRoute><DashboardDI /></ProtectedRoute>} />
            
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/transactions-di" element={<ProtectedRoute><TransactionsDI /></ProtectedRoute>} />
            
            <Route path="/categories" element={<Navigate to="/categories-di" replace />} />
            <Route path="/categories-di" element={<ProtectedRoute><CategoriesDI /></ProtectedRoute>} />
            
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
            <Route path="/investments" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
            
            <Route path="/reports" element={<Navigate to="/reports-di" replace />} />
            <Route path="/reports-di" element={<ProtectedRoute><ReportsDI /></ProtectedRoute>} />
            
            <Route path="/settings" element={<Navigate to="/settings-di" replace />} />
            <Route path="/settings-di" element={<ProtectedRoute><SettingsDI /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App; 