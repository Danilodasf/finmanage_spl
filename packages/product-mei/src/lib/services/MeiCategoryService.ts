import { CategoryService as ICategoryService, Category } from '../core-exports';

/**
 * Implementação do serviço de categorias para o produto MEI
 */
export class MeiCategoryService implements ICategoryService {
  // Chave para armazenamento local
  private storageKey = 'finmanage_mei_categories';
  
  // Categorias padrão
  private defaultCategories: Category[] = [
    { id: '1', name: 'Vendas', type: 'receita' },
    { id: '2', name: 'Serviços', type: 'receita' },
    { id: '3', name: 'Materiais', type: 'despesa' },
    { id: '4', name: 'Aluguel', type: 'despesa' },
    { id: '5', name: 'Impostos', type: 'despesa' },
    { id: '6', name: 'Água/Luz/Internet', type: 'despesa' },
    { id: '7', name: 'Transporte', type: 'despesa' },
    { id: '8', name: 'Alimentação', type: 'despesa' },
    { id: '9', name: 'Pró-labore', type: 'ambos' },
  ];

  /**
   * Inicializa o armazenamento com categorias padrão se estiver vazio
   */
  private initializeStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.defaultCategories));
    }
  }

  /**
   * Busca todas as categorias
   */
  async getAll(): Promise<{ data: Category[] | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const categories = stored ? JSON.parse(stored) : [];
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { data: categories, error: null };
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca uma categoria pelo ID
   * @param id ID da categoria
   */
  async getById(id: string): Promise<{ data: Category | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const categories = stored ? JSON.parse(stored) : [];
      const category = categories.find((c: Category) => c.id === id);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!category) {
        return { data: null, error: new Error(`Categoria com ID ${id} não encontrada`) };
      }
      
      return { data: category, error: null };
    } catch (error) {
      console.error(`Erro ao buscar categoria com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Cria uma nova categoria
   * @param entity Dados da categoria
   */
  async create(entity: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const categories = stored ? JSON.parse(stored) : [];
      
      // Gerar ID único
      const id = Math.random().toString(36).substring(2, 9);
      
      // Criar nova categoria
      const newCategory: Category = {
        ...entity,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Adicionar à lista
      categories.push(newCategory);
      localStorage.setItem(this.storageKey, JSON.stringify(categories));
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { data: newCategory, error: null };
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Atualiza uma categoria existente
   * @param id ID da categoria
   * @param entity Dados para atualização
   */
  async update(id: string, entity: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const categories = stored ? JSON.parse(stored) : [];
      
      // Encontrar índice da categoria
      const index = categories.findIndex((c: Category) => c.id === id);
      
      if (index === -1) {
        return { data: null, error: new Error(`Categoria com ID ${id} não encontrada`) };
      }
      
      // Atualizar categoria
      const updatedCategory = {
        ...categories[index],
        ...entity,
        updated_at: new Date().toISOString()
      };
      
      categories[index] = updatedCategory;
      localStorage.setItem(this.storageKey, JSON.stringify(categories));
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { data: updatedCategory, error: null };
    } catch (error) {
      console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Remove uma categoria
   * @param id ID da categoria
   */
  async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const categories = stored ? JSON.parse(stored) : [];
      
      // Filtrar categoria
      const newCategories = categories.filter((c: Category) => c.id !== id);
      
      if (newCategories.length === categories.length) {
        return { success: false, error: new Error(`Categoria com ID ${id} não encontrada`) };
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(newCategories));
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro ao excluir categoria com ID ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  /**
   * Busca categorias por tipo
   * @param type Tipo da categoria
   */
  async getByType(type: 'receita' | 'despesa' | 'ambos' | 'investimento'): Promise<{ data: Category[] | null; error: Error | null }> {
    try {
      this.initializeStorage();
      const stored = localStorage.getItem(this.storageKey);
      const categories = stored ? JSON.parse(stored) : [];
      
      const filteredCategories = categories.filter((c: Category) => c.type === type);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { data: filteredCategories, error: null };
    } catch (error) {
      console.error(`Erro ao buscar categorias do tipo ${type}:`, error);
      return { data: null, error: error as Error };
    }
  }
} 