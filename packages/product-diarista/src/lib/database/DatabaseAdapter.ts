/**
 * Abstração para adaptador de banco de dados
 * Permite trocar facilmente entre diferentes implementações (mock, Supabase, etc.)
 */

export interface DatabaseResult<T> {
  data: T | null;
  error: Error | null;
}

export interface DatabaseListResult<T> {
  data: T[] | null;
  error: Error | null;
}

/**
 * Interface genérica para operações de banco de dados
 */
export interface DatabaseAdapter {
  // Operações básicas CRUD
  create<T>(table: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<T>>;
  getById<T>(table: string, id: string): Promise<DatabaseResult<T>>;
  getAll<T>(table: string, filters?: Record<string, any>): Promise<DatabaseListResult<T>>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<DatabaseResult<T>>;
  delete(table: string, id: string): Promise<DatabaseResult<boolean>>;
  
  // Operações específicas com filtros
  findWhere<T>(table: string, filters: Record<string, any>): Promise<DatabaseListResult<T>>;
  findOne<T>(table: string, filters: Record<string, any>): Promise<DatabaseResult<T>>;
  
  // Operações de usuário
  getCurrentUserId(): Promise<string | null>;
}

/**
 * Implementação mock para desenvolvimento
 * Simula operações de banco de dados em memória
 */
export class MockDatabaseAdapter implements DatabaseAdapter {
  private data: Map<string, Map<string, any>> = new Map();
  private currentUserId: string = 'mock-user-id';

  constructor() {
    // Inicializar tabelas vazias
    this.data.set('transactions', new Map());
    this.data.set('categories', new Map());
    this.data.set('clientes', new Map());
    this.data.set('agendamentos', new Map());
    this.data.set('users', new Map());
    this.data.set('sessions', new Map());
    
    // Criar usuário de teste padrão
    this.createTestUser();
  }
  
  private createTestUser() {
    const usersTable = this.getTable('users');
    // Hash da senha 'senha123' usando o mesmo método do DiaristaAuthService
    const hashedPassword = btoa('senha123' + 'salt_diarista');
    
    const testUser = {
      id: this.currentUserId,
      email: 'teste@diarista.com',
      password: hashedPassword, // Senha hasheada
      name: 'Usuário Teste',
      phone: '(11) 99999-9999',
      address: 'Rua Teste, 123',
      specialties: ['Limpeza Residencial', 'Limpeza Comercial'],
      hourly_rate: 25.0,
      availability: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      rating: 4.8,
      total_services: 150,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    usersTable.set(this.currentUserId, testUser);
    console.log('👤 Usuário de teste criado:', testUser.email, 'senha: senha123');
  }

  async getCurrentUserId(): Promise<string | null> {
    return this.currentUserId;
  }

  private generateId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTable(tableName: string): Map<string, any> {
    if (!this.data.has(tableName)) {
      this.data.set(tableName, new Map());
    }
    return this.data.get(tableName)!;
  }

  async create<T>(table: string, data: any): Promise<DatabaseResult<T>> {
    try {
      const tableData = this.getTable(table);
      const id = this.generateId();
      const now = new Date().toISOString();
      
      const newRecord = {
        ...data,
        id,
        user_id: this.currentUserId,
        created_at: now,
        updated_at: now
      };
      
      tableData.set(id, newRecord);
      return { data: newRecord as T, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getById<T>(table: string, id: string): Promise<DatabaseResult<T>> {
    try {
      const tableData = this.getTable(table);
      const record = tableData.get(id);
      
      if (!record) {
        return { data: null, error: new Error(`Registro com ID ${id} não encontrado`) };
      }
      
      return { data: record as T, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getAll<T>(table: string, filters?: Record<string, any>): Promise<DatabaseListResult<T>> {
    try {
      const tableData = this.getTable(table);
      let records = Array.from(tableData.values());
      
      // Filtrar por user_id se não especificado
      if (!filters?.user_id) {
        records = records.filter(record => record.user_id === this.currentUserId);
      }
      
      // Aplicar filtros adicionais
      if (filters) {
        records = records.filter(record => {
          return Object.entries(filters).every(([key, value]) => {
            return record[key] === value;
          });
        });
      }
      
      // Ordenar por data de criação (mais recente primeiro)
      records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return { data: records as T[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<DatabaseResult<T>> {
    try {
      const tableData = this.getTable(table);
      const existingRecord = tableData.get(id);
      
      if (!existingRecord) {
        return { data: null, error: new Error(`Registro com ID ${id} não encontrado`) };
      }
      
      const updatedRecord = {
        ...existingRecord,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      tableData.set(id, updatedRecord);
      return { data: updatedRecord as T, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async delete(table: string, id: string): Promise<DatabaseResult<boolean>> {
    try {
      const tableData = this.getTable(table);
      const deleted = tableData.delete(id);
      
      if (!deleted) {
        return { data: false, error: new Error(`Registro com ID ${id} não encontrado`) };
      }
      
      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: error as Error };
    }
  }

  async findWhere<T>(table: string, filters: Record<string, any>): Promise<DatabaseListResult<T>> {
    return this.getAll<T>(table, filters);
  }

  async findOne<T>(table: string, filters: Record<string, any>): Promise<DatabaseResult<T>> {
    try {
      const result = await this.findWhere<T>(table, filters);
      
      if (result.error) {
        return { data: null, error: result.error };
      }
      
      const records = result.data || [];
      return { data: records.length > 0 ? records[0] : null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

// Instância global do adaptador (será substituída por Supabase no futuro)
export const databaseAdapter: DatabaseAdapter = new MockDatabaseAdapter();