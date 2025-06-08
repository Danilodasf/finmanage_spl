/**
 * Hook para gerenciar categorias usando injeção de dependências
 * Fornece estado e operações para categorias de diaristas
 */

import { useState, useEffect, useCallback } from 'react';
import { DICategoryController } from '../controllers/DICategoryController';
import { CategoriaDiarista, CreateCategoriaDTO, UpdateCategoriaDTO, TipoServicoDiarista } from '../models/DiaristaModels';
import { TransactionType } from '../lib/core/services';

interface UseCategoriesState {
  categories: CategoriaDiarista[];
  loading: boolean;
  error: string | null;
}

interface UseCategoriesActions {
  // Operações CRUD
  loadCategories: () => Promise<void>;
  createCategory: (data: CreateCategoriaDTO) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (id: string, data: UpdateCategoriaDTO) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Operações específicas
  loadCategoriesByType: (type: TransactionType) => Promise<void>;
  loadCategoriesByServiceType: (serviceType: TipoServicoDiarista) => Promise<void>;
  createDefaultCategories: () => Promise<{ success: boolean; error?: string }>;
  
  // Utilitários
  refreshCategories: () => Promise<void>;
  clearError: () => void;
}

interface UseCategoriesReturn extends UseCategoriesState, UseCategoriesActions {
  // Categorias filtradas por conveniência
  incomeCategories: CategoriaDiarista[];
  expenseCategories: CategoriaDiarista[];
}

export function useCategories(): UseCategoriesReturn {
  const [state, setState] = useState<UseCategoriesState>({
    categories: [],
    loading: false,
    error: null
  });

  const [controller] = useState(() => new DICategoryController());

  // Função para atualizar estado
  const updateState = useCallback((updates: Partial<UseCategoriesState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Carrega todas as categorias
  const loadCategories = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.getAllCategories();
      
      if (result.success && result.data) {
        updateState({
          categories: result.data,
          loading: false
        });
      } else {
        updateState({
          error: result.error || 'Erro ao carregar categorias',
          loading: false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      updateState({
        error: 'Erro interno ao carregar categorias',
        loading: false
      });
    }
  }, [controller, updateState]);

  // Cria nova categoria
  const createCategory = useCallback(async (data: CreateCategoriaDTO) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.createCategory(data);
      
      if (result.success) {
        // Recarrega as categorias após criar
        await loadCategories();
        return { success: true };
      } else {
        updateState({ 
          error: result.error || 'Erro ao criar categoria',
          loading: false 
        });
        return { 
          success: false, 
          error: result.error || 'Erro ao criar categoria' 
        };
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      const errorMessage = 'Erro interno ao criar categoria';
      updateState({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }, [controller, loadCategories, updateState]);

  // Atualiza categoria existente
  const updateCategory = useCallback(async (id: string, data: UpdateCategoriaDTO) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.updateCategory(id, data);
      
      if (result.success) {
        // Recarrega as categorias após atualizar
        await loadCategories();
        return { success: true };
      } else {
        updateState({ 
          error: result.error || 'Erro ao atualizar categoria',
          loading: false 
        });
        return { 
          success: false, 
          error: result.error || 'Erro ao atualizar categoria' 
        };
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      const errorMessage = 'Erro interno ao atualizar categoria';
      updateState({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }, [controller, loadCategories, updateState]);

  // Deleta categoria
  const deleteCategory = useCallback(async (id: string) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.deleteCategory(id);
      
      if (result.success) {
        // Recarrega as categorias após deletar
        await loadCategories();
        return { success: true };
      } else {
        updateState({ 
          error: result.error || 'Erro ao deletar categoria',
          loading: false 
        });
        return { 
          success: false, 
          error: result.error || 'Erro ao deletar categoria' 
        };
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      const errorMessage = 'Erro interno ao deletar categoria';
      updateState({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }, [controller, loadCategories, updateState]);

  // Carrega categorias por tipo
  const loadCategoriesByType = useCallback(async (type: TransactionType) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.getCategoriesByType(type);
      
      if (result.success && result.data) {
        updateState({
          categories: result.data,
          loading: false
        });
      } else {
        updateState({
          error: result.error || 'Erro ao carregar categorias por tipo',
          loading: false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar categorias por tipo:', error);
      updateState({
        error: 'Erro interno ao carregar categorias por tipo',
        loading: false
      });
    }
  }, [controller, updateState]);

  // Carrega categorias por tipo de serviço
  const loadCategoriesByServiceType = useCallback(async (serviceType: TipoServicoDiarista) => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.getCategoriesByServiceType(serviceType);
      
      if (result.success && result.data) {
        updateState({
          categories: result.data,
          loading: false
        });
      } else {
        updateState({
          error: result.error || 'Erro ao carregar categorias por tipo de serviço',
          loading: false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar categorias por tipo de serviço:', error);
      updateState({
        error: 'Erro interno ao carregar categorias por tipo de serviço',
        loading: false
      });
    }
  }, [controller, updateState]);

  // Cria categorias padrão
  const createDefaultCategories = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      const result = await controller.createDefaultCategories();
      
      if (result.success) {
        // Recarrega as categorias após criar as padrão
        await loadCategories();
        return { success: true };
      } else {
        updateState({ 
          error: result.error || 'Erro ao criar categorias padrão',
          loading: false 
        });
        return { 
          success: false, 
          error: result.error || 'Erro ao criar categorias padrão' 
        };
      }
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
      const errorMessage = 'Erro interno ao criar categorias padrão';
      updateState({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }, [controller, loadCategories, updateState]);

  // Recarrega categorias
  const refreshCategories = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  // Limpa erro
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Carrega categorias iniciais
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Categorias filtradas por tipo
  const incomeCategories = state.categories.filter(cat => cat.type === 'income');
  const expenseCategories = state.categories.filter(cat => cat.type === 'expense');

  return {
    // Estado
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    
    // Categorias filtradas
    incomeCategories,
    expenseCategories,
    
    // Ações
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    loadCategoriesByType,
    loadCategoriesByServiceType,
    createDefaultCategories,
    refreshCategories,
    clearError
  };
}

// Hook para estatísticas de categorias
export function useCategoryStats() {
  const [stats, setStats] = useState<{
    mostUsed: CategoriaDiarista[];
    categoryStats: Array<{
      category: CategoriaDiarista;
      transactionCount: number;
      totalAmount: number;
    }>;
    loading: boolean;
    error: string | null;
  }>({
    mostUsed: [],
    categoryStats: [],
    loading: false,
    error: null
  });

  const [controller] = useState(() => new DICategoryController());

  const loadStats = useCallback(async (limit: number = 5) => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Carrega categorias mais utilizadas
      const mostUsedResult = await controller.getMostUsedCategories(limit);
      
      // Carrega estatísticas das categorias
      const statsResult = await controller.getCategoryStats();
      
      if (mostUsedResult.success && statsResult.success) {
        setStats({
          mostUsed: mostUsedResult.data || [],
          categoryStats: statsResult.data || [],
          loading: false,
          error: null
        });
      } else {
        setStats(prev => ({
          ...prev,
          error: mostUsedResult.error || statsResult.error || 'Erro ao carregar estatísticas',
          loading: false
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas de categorias:', error);
      setStats(prev => ({
        ...prev,
        error: 'Erro interno ao carregar estatísticas',
        loading: false
      }));
    }
  }, [controller]);

  // Carrega estatísticas iniciais
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    ...stats,
    loadStats,
    refreshStats: () => loadStats()
  };
}

// Hook para seleção de categorias em formulários
export function useCategoriesForSelect(type?: TransactionType) {
  const [categories, setCategories] = useState<Array<{
    value: string;
    label: string;
    serviceType?: TipoServicoDiarista;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [controller] = useState(() => new DICategoryController());

  const loadCategoriesForSelect = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await controller.getCategoriesForSelect(type);
      
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setError(result.error || 'Erro ao carregar categorias para seleção');
      }
    } catch (error) {
      console.error('Erro ao carregar categorias para seleção:', error);
      setError('Erro interno ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [controller, type]);

  // Carrega categorias quando o tipo muda
  useEffect(() => {
    loadCategoriesForSelect();
  }, [loadCategoriesForSelect]);

  return {
    categories,
    loading,
    error,
    refreshCategories: loadCategoriesForSelect
  };
}