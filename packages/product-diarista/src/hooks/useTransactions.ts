/**
 * Hook para gerenciar transações usando injeção de dependências
 * Fornece estado e operações para transações de diaristas
 */

import { useState, useEffect, useCallback } from 'react';
import { DITransactionController } from '../controllers/DITransactionController';
import { TransacaoDiarista, CreateTransacaoDTO, UpdateTransacaoDTO } from '../models/DiaristaModels';

interface UseTransactionsState {
  transactions: TransacaoDiarista[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

interface UseTransactionsActions {
  // Operações CRUD
  loadTransactions: () => Promise<void>;
  createTransaction: (data: CreateTransacaoDTO) => Promise<{ success: boolean; error?: string }>;
  updateTransaction: (id: string, data: UpdateTransacaoDTO) => Promise<{ success: boolean; error?: string }>;
  deleteTransaction: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Operações específicas
  loadTransactionsByDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  loadTransactionsByPaymentStatus: (isPaid: boolean) => Promise<void>;
  loadRecentTransactions: (limit?: number) => Promise<void>;
  
  // Controle de paginação
  setPage: (page: number) => void;
  
  // Utilitários
  refreshTransactions: () => Promise<void>;
  clearError: () => void;
}

interface UseTransactionsReturn extends UseTransactionsState, UseTransactionsActions {}

const ITEMS_PER_PAGE = 10;

export function useTransactions(): UseTransactionsReturn {
  const [state, setState] = useState<UseTransactionsState>({
    transactions: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 1
  });

  const [controller] = useState(() => new DITransactionController());

  // Função para atualizar estado
  const updateState = useCallback((updates: Partial<UseTransactionsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Carrega todas as transações
  const loadTransactions = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.getAllTransactions();
      
      if (result.success && result.data) {
        const totalPages = Math.ceil(result.data.length / ITEMS_PER_PAGE);
        updateState({
          transactions: result.data,
          totalPages,
          loading: false
        });
      } else {
        updateState({
          error: result.error || 'Erro ao carregar transações',
          loading: false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      updateState({
        error: 'Erro interno ao carregar transações',
        loading: false
      });
    }
  }, [controller, updateState]);

  // Cria nova transação
  const createTransaction = useCallback(async (data: CreateTransacaoDTO) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.createTransaction(data);
      
      if (result.success) {
        // Recarrega as transações após criar
        await loadTransactions();
        return { success: true };
      } else {
        updateState({ 
          error: result.error || 'Erro ao criar transação',
          loading: false 
        });
        return { 
          success: false, 
          error: result.error || 'Erro ao criar transação' 
        };
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      const errorMessage = 'Erro interno ao criar transação';
      updateState({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }, [controller, loadTransactions, updateState]);

  // Atualiza transação existente
  const updateTransaction = useCallback(async (id: string, data: UpdateTransacaoDTO) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.updateTransaction(id, data);
      
      if (result.success) {
        // Recarrega as transações após atualizar
        await loadTransactions();
        return { success: true };
      } else {
        updateState({ 
          error: result.error || 'Erro ao atualizar transação',
          loading: false 
        });
        return { 
          success: false, 
          error: result.error || 'Erro ao atualizar transação' 
        };
      }
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      const errorMessage = 'Erro interno ao atualizar transação';
      updateState({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }, [controller, loadTransactions, updateState]);

  // Deleta transação
  const deleteTransaction = useCallback(async (id: string) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.deleteTransaction(id);
      
      if (result.success) {
        // Recarrega as transações após deletar
        await loadTransactions();
        return { success: true };
      } else {
        updateState({ 
          error: result.error || 'Erro ao deletar transação',
          loading: false 
        });
        return { 
          success: false, 
          error: result.error || 'Erro ao deletar transação' 
        };
      }
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      const errorMessage = 'Erro interno ao deletar transação';
      updateState({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }, [controller, loadTransactions, updateState]);

  // Carrega transações por período
  const loadTransactionsByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.getTransactionsByDateRange(startDate, endDate);
      
      if (result.success && result.data) {
        const totalPages = Math.ceil(result.data.length / ITEMS_PER_PAGE);
        updateState({
          transactions: result.data,
          totalPages,
          currentPage: 1, // Reset para primeira página
          loading: false
        });
      } else {
        updateState({
          error: result.error || 'Erro ao carregar transações por período',
          loading: false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar transações por período:', error);
      updateState({
        error: 'Erro interno ao carregar transações por período',
        loading: false
      });
    }
  }, [controller, updateState]);

  // Carrega transações por status de pagamento
  const loadTransactionsByPaymentStatus = useCallback(async (isPaid: boolean) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.getTransactionsByPaymentStatus(isPaid);
      
      if (result.success && result.data) {
        const totalPages = Math.ceil(result.data.length / ITEMS_PER_PAGE);
        updateState({
          transactions: result.data,
          totalPages,
          currentPage: 1, // Reset para primeira página
          loading: false
        });
      } else {
        updateState({
          error: result.error || 'Erro ao carregar transações por status',
          loading: false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar transações por status:', error);
      updateState({
        error: 'Erro interno ao carregar transações por status',
        loading: false
      });
    }
  }, [controller, updateState]);

  // Carrega transações recentes
  const loadRecentTransactions = useCallback(async (limit: number = 10) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.getRecentTransactions(limit);
      
      if (result.success && result.data) {
        updateState({
          transactions: result.data,
          totalPages: 1, // Transações recentes não precisam paginação
          currentPage: 1,
          loading: false
        });
      } else {
        updateState({
          error: result.error || 'Erro ao carregar transações recentes',
          loading: false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar transações recentes:', error);
      updateState({
        error: 'Erro interno ao carregar transações recentes',
        loading: false
      });
    }
  }, [controller, updateState]);

  // Define página atual
  const setPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages) {
      updateState({ currentPage: page });
    }
  }, [state.totalPages, updateState]);

  // Recarrega transações
  const refreshTransactions = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  // Limpa erro
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Carrega transações iniciais
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Calcula transações da página atual
  const paginatedTransactions = state.transactions.slice(
    (state.currentPage - 1) * ITEMS_PER_PAGE,
    state.currentPage * ITEMS_PER_PAGE
  );

  return {
    // Estado
    transactions: paginatedTransactions,
    loading: state.loading,
    error: state.error,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    
    // Ações
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loadTransactionsByDateRange,
    loadTransactionsByPaymentStatus,
    loadRecentTransactions,
    setPage,
    refreshTransactions,
    clearError
  };
}

// Hook para resumo financeiro
export function useFinancialSummary() {
  const [summary, setSummary] = useState<{
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
    transacoesPendentes: number;
    loading: boolean;
    error: string | null;
  }>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    transacoesPendentes: 0,
    loading: false,
    error: null
  });

  const [controller] = useState(() => new DITransactionController());

  const loadSummary = useCallback(async (startDate?: Date, endDate?: Date) => {
    setSummary(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await controller.getFinancialSummary(startDate, endDate);
      
      if (result.success && result.data) {
        setSummary({
          totalReceitas: result.data.totalReceitas,
          totalDespesas: result.data.totalDespesas,
          saldo: result.data.saldo,
          transacoesPendentes: result.data.transacoesPendentes,
          loading: false,
          error: null
        });
      } else {
        setSummary(prev => ({
          ...prev,
          error: result.error || 'Erro ao carregar resumo financeiro',
          loading: false
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar resumo financeiro:', error);
      setSummary(prev => ({
        ...prev,
        error: 'Erro interno ao carregar resumo financeiro',
        loading: false
      }));
    }
  }, [controller]);

  // Carrega resumo inicial
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    ...summary,
    loadSummary,
    refreshSummary: () => loadSummary()
  };
}