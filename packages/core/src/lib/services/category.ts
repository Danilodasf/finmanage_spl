import { supabase } from '../supabase';
import { getCurrentUserId } from '../supabase';

// TODO: Remover quando o Supabase estiver configurado
// Dados mock para desenvolvimento sem banco de dados
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    user_id: 'mock-user-id',
    name: 'Alimentação',
    type: 'despesa',
    color: '#FF6B6B',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-2',
    user_id: 'mock-user-id',
    name: 'Transporte',
    type: 'despesa',
    color: '#4ECDC4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-3',
    user_id: 'mock-user-id',
    name: 'Salário',
    type: 'receita',
    color: '#45B7D1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-4',
    user_id: 'mock-user-id',
    name: 'Freelance',
    type: 'receita',
    color: '#96CEB4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-5',
    user_id: 'mock-user-id',
    name: 'Moradia',
    type: 'despesa',
    color: '#FFEAA7',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-6',
    user_id: 'mock-user-id',
    name: 'Saúde',
    type: 'despesa',
    color: '#DDA0DD',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let mockCategoryIdCounter = 7;

/**
 * Interface para representar uma categoria
 */
export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'receita' | 'despesa' | 'ambos';
  color: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para criar uma nova categoria
 */
export interface CreateCategoryDTO {
  name: string;
  type: 'receita' | 'despesa' | 'ambos';
  color?: string;
}

/**
 * Interface para atualizar uma categoria existente
 */
export interface UpdateCategoryDTO {
  name?: string;
  type?: 'receita' | 'despesa' | 'ambos';
  color?: string;
}

/**
 * Implementação do serviço de categorias usando Supabase
 */
export class CategoryService {
  /**
   * Busca todas as categorias do usuário atual
   */
  static async getAll(): Promise<Category[]> {
    try {
      // Mock: retorna categorias fictícias para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 100)); // Simula delay
      return [...mockCategories].sort((a, b) => a.name.localeCompare(b.name));
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');
        
      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
      }
      
      return data as Category[];
      */
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }
  
  /**
   * Busca uma categoria pelo ID
   * @param id ID da categoria
   */
  static async getById(id: string): Promise<Category | null> {
    try {
      // Mock: busca categoria fictícia por ID
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockCategories.find(cat => cat.id === id) || null;
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar categoria:', error);
        return null;
      }
      
      return data as Category;
      */
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return null;
    }
  }
  
  /**
   * Cria uma nova categoria
   * @param category Dados da categoria
   */
  static async create(category: CreateCategoryDTO): Promise<Category | null> {
    try {
      // Mock: cria categoria fictícia
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const newCategory: Category = {
        id: `cat-${mockCategoryIdCounter++}`,
        user_id: 'mock-user-id',
        name: category.name,
        type: category.type,
        color: category.color || '#6B7280',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockCategories.push(newCategory);
      return newCategory;
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: userId,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao criar categoria:', error);
        return null;
      }
      
      return data as Category;
      */
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return null;
    }
  }
  
  /**
   * Atualiza uma categoria existente
   * @param id ID da categoria
   * @param category Dados para atualização
   */
  static async update(id: string, category: UpdateCategoryDTO): Promise<Category | null> {
    try {
      // Mock: atualiza categoria fictícia
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
      if (categoryIndex === -1) {
        return null;
      }
      
      const updatedCategory = {
        ...mockCategories[categoryIndex],
        ...category,
        updated_at: new Date().toISOString()
      };
      
      mockCategories[categoryIndex] = updatedCategory;
      return updatedCategory;
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar categoria:', error);
        return null;
      }
      
      return data as Category;
      */
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return null;
    }
  }
  
  /**
   * Remove uma categoria
   * @param id ID da categoria
   */
  static async delete(id: string): Promise<boolean> {
    try {
      // Mock: remove categoria fictícia
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
      if (categoryIndex === -1) {
        return false;
      }
      
      mockCategories.splice(categoryIndex, 1);
      return true;
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao excluir categoria:', error);
        return false;
      }
      
      return true;
      */
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      return false;
    }
  }
  
  /**
   * Busca categorias filtradas por tipo
   * @param type Tipo da categoria
   */
  static async getByType(type: 'receita' | 'despesa' | 'ambos'): Promise<Category[]> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('name');
        
      if (error) {
        console.error('Erro ao buscar categorias por tipo:', error);
        return [];
      }
      
      return data as Category[];
    } catch (error) {
      console.error('Erro ao buscar categorias por tipo:', error);
      return [];
    }
  }
  
  /**
   * Busca categorias de receita (type = 'receita' ou 'ambos')
   */
  static async getIncomeCategories(): Promise<Category[]> {
    try {
      // Mock: filtrar categorias de receita
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return mockCategories
        .filter(cat => cat.type === 'receita' || cat.type === 'ambos')
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .or('type.eq.receita,type.eq.ambos')
        .order('name');
        
      if (error) {
        console.error('Erro ao buscar categorias de receita:', error);
        return [];
      }
      
      return data as Category[];
      */
    } catch (error) {
      console.error('Erro ao buscar categorias de receita:', error);
      return [];
    }
  }
  
  /**
   * Busca categorias de despesa (type = 'despesa' ou 'ambos')
   */
  static async getExpenseCategories(): Promise<Category[]> {
    try {
      // Mock: filtrar categorias de despesa
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return mockCategories
        .filter(cat => cat.type === 'despesa' || cat.type === 'ambos')
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .or('type.eq.despesa,type.eq.ambos')
        .order('name');
        
      if (error) {
        console.error('Erro ao buscar categorias de despesa:', error);
        return [];
      }
      
      return data as Category[];
      */
    } catch (error) {
      console.error('Erro ao buscar categorias de despesa:', error);
      return [];
    }
  }
  
  /**
   * Garante que as categorias padrão existam para o usuário atual
   */
  static async ensureDefaultCategories(): Promise<void> {
    try {
      // Mock: categorias padrão já estão definidas no mockCategories
      // Não precisa fazer nada para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 100));
      return;
      
      // Versão original (descomentada quando o Supabase estiver configurado):
      /*
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se já existem categorias para o usuário
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao verificar categorias existentes:', error);
        return;
      }
      
      // Se já existirem categorias, não precisa criar as padrão
      if (data && data.length > 0) {
        return;
      }
      
      // Categorias padrão para receitas
      const incomeCategories = [
        { name: 'Vendas', type: 'receita', color: '#4CAF50' },
        { name: 'Serviços', type: 'receita', color: '#2196F3' },
        { name: 'Outros', type: 'receita', color: '#9C27B0' },
      ];
      
      // Categorias padrão para despesas
      const expenseCategories = [
        { name: 'Impostos', type: 'despesa', color: '#F44336' },
        { name: 'Aluguel', type: 'despesa', color: '#FF9800' },
        { name: 'Materiais', type: 'despesa', color: '#795548' },
        { name: 'Transporte', type: 'despesa', color: '#607D8B' },
        { name: 'Alimentação', type: 'despesa', color: '#FFC107' },
        { name: 'Outros', type: 'despesa', color: '#9E9E9E' },
      ];
      
      // Criar as categorias padrão
      const allCategories = [...incomeCategories, ...expenseCategories].map(cat => ({
        ...cat,
        user_id: userId,
      }));
      
      const { error: insertError } = await supabase
        .from('categories')
        .insert(allCategories);
        
      if (insertError) {
        console.error('Erro ao criar categorias padrão:', insertError);
      }
      */
    } catch (error) {
      console.error('Erro ao garantir categorias padrão:', error);
    }
  }
}