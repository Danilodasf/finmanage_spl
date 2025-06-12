import { supabase } from '../supabase';
import { getCurrentUserId } from '../supabase';

/**
 * Dados mockados para desenvolvimento e testes
 * 
 * IMPORTANTE: Estes dados devem ser removidos quando a integração
 * com o Supabase estiver completa e funcionando corretamente.
 * 
 * Contém categorias padrão para receitas e despesas com cores
 * pré-definidas para facilitar o desenvolvimento da interface.
 */
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
 * Interface que representa uma categoria de transação
 * 
 * Define a estrutura de dados para categorias que podem ser
 * utilizadas para classificar receitas, despesas ou ambos.
 */
export interface Category {
  /** Identificador único da categoria */
  id: string;
  /** ID do usuário proprietário da categoria */
  user_id: string;
  /** Nome descritivo da categoria */
  name: string;
  /** Tipo da categoria: receita, despesa ou ambos */
  type: 'receita' | 'despesa' | 'ambos';
  /** Cor em hexadecimal para identificação visual (opcional) */
  color: string | null;
  /** Data de criação da categoria */
  created_at?: string;
  /** Data da última atualização */
  updated_at?: string;
}

/**
 * DTO para criação de uma nova categoria
 * 
 * Contém apenas os campos obrigatórios e opcionais
 * necessários para criar uma categoria.
 */
export interface CreateCategoryDTO {
  /** Nome da categoria (obrigatório) */
  name: string;
  /** Tipo da categoria (obrigatório) */
  type: 'receita' | 'despesa' | 'ambos';
  /** Cor em hexadecimal (opcional, padrão será aplicado) */
  color?: string;
}

/**
 * DTO para atualização de uma categoria existente
 * 
 * Todos os campos são opcionais, permitindo atualizações
 * parciais da categoria.
 */
export interface UpdateCategoryDTO {
  /** Novo nome da categoria (opcional) */
  name?: string;
  /** Novo tipo da categoria (opcional) */
  type?: 'receita' | 'despesa' | 'ambos';
  /** Nova cor da categoria (opcional) */
  color?: string;
}

/**
 * Serviço responsável pelo gerenciamento de categorias de transações
 * 
 * Fornece métodos para operações CRUD (Create, Read, Update, Delete)
 * de categorias, incluindo funcionalidades específicas como busca por tipo,
 * garantia de categorias padrão e filtragem por receitas/despesas.
 * 
 * Atualmente utiliza dados mockados para desenvolvimento, mas está
 * preparado para integração com Supabase quando configurado.
 */
export class CategoryService {
  /**
   * Busca todas as categorias do usuário atual
   * 
   * Retorna uma lista ordenada alfabeticamente de todas as categorias
   * disponíveis para o usuário autenticado. Inclui categorias padrão
   * e personalizadas criadas pelo usuário.
   * 
   * @returns Promise<Category[]> Lista de categorias ordenadas por nome
   * @throws Error se o usuário não estiver autenticado (versão Supabase)
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
   * Busca uma categoria específica pelo seu identificador único
   * 
   * Localiza e retorna uma categoria baseada no ID fornecido,
   * garantindo que pertença ao usuário autenticado atual.
   * 
   * @param id - Identificador único da categoria a ser buscada
   * @returns Promise<Category | null> A categoria encontrada ou null se não existir
   * @throws Error se o usuário não estiver autenticado (versão Supabase)
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
   * Cria uma nova categoria para o usuário atual
   * 
   * Adiciona uma nova categoria ao sistema com os dados fornecidos.
   * Se a cor não for especificada, uma cor padrão será aplicada.
   * A categoria será associada automaticamente ao usuário autenticado.
   * 
   * @param category - Dados da categoria a ser criada (nome, tipo e cor opcional)
   * @returns Promise<Category | null> A categoria criada ou null em caso de erro
   * @throws Error se o usuário não estiver autenticado (versão Supabase)
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
   * Atualiza uma categoria existente do usuário
   * 
   * Modifica os dados de uma categoria específica com as informações
   * fornecidas. Apenas os campos especificados serão atualizados,
   * mantendo os demais valores inalterados.
   * 
   * @param id - Identificador único da categoria a ser atualizada
   * @param category - Dados parciais para atualização (nome, tipo ou cor)
   * @returns Promise<Category | null> A categoria atualizada ou null se não encontrada
   * @throws Error se o usuário não estiver autenticado (versão Supabase)
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
   * Remove uma categoria do usuário
   * 
   * Exclui permanentemente uma categoria específica do sistema.
   * ATENÇÃO: Esta operação é irreversível e pode afetar transações
   * que utilizam esta categoria.
   * 
   * @param id - Identificador único da categoria a ser removida
   * @returns Promise<boolean> true se removida com sucesso, false caso contrário
   * @throws Error se o usuário não estiver autenticado (versão Supabase)
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
   * Busca categorias filtradas por tipo específico
   * 
   * Retorna apenas as categorias que correspondem ao tipo especificado
   * (receita, despesa ou ambos), útil para filtrar opções em formulários
   * de transações.
   * 
   * @param type - Tipo de categoria a ser filtrado ('receita', 'despesa' ou 'ambos')
   * @returns Promise<Category[]> Lista de categorias do tipo especificado
   * @throws Error se o usuário não estiver autenticado
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
   * Busca todas as categorias aplicáveis a receitas
   * 
   * Retorna categorias com tipo 'receita' ou 'ambos', ordenadas
   * alfabeticamente. Útil para popular dropdowns em formulários
   * de criação/edição de receitas.
   * 
   * @returns Promise<Category[]> Lista de categorias para receitas
   * @throws Error se o usuário não estiver autenticado (versão Supabase)
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
   * Busca todas as categorias aplicáveis a despesas
   * 
   * Retorna categorias com tipo 'despesa' ou 'ambos', ordenadas
   * alfabeticamente. Útil para popular dropdowns em formulários
   * de criação/edição de despesas.
   * 
   * @returns Promise<Category[]> Lista de categorias para despesas
   * @throws Error se o usuário não estiver autenticado (versão Supabase)
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
   * 
   * Verifica se o usuário possui categorias cadastradas e, caso não tenha,
   * cria automaticamente um conjunto de categorias padrão para receitas
   * e despesas. Este método é útil para novos usuários que precisam de
   * categorias básicas para começar a usar o sistema.
   * 
   * Categorias padrão incluem:
   * - Receitas: Vendas, Serviços, Outros
   * - Despesas: Impostos, Aluguel, Materiais, Transporte, Alimentação, Outros
   * 
   * @returns Promise<void> Não retorna valor, apenas garante a criação
   * @throws Error se o usuário não estiver autenticado (versão Supabase)
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