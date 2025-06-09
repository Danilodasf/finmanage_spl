import { Cliente, CreateClienteDTO, UpdateClienteDTO } from '../models/DiaristaModels';
import { databaseAdapter } from '../lib/database/DatabaseAdapter';

export interface ClienteResult<T> {
  data?: T;
  error?: string;
}

/**
 * Controlador DI para gerenciamento de clientes
 */
export class DIClienteController {
  private readonly tableName = 'clientes';

  constructor() {
    // Usando o databaseAdapter do Supabase
  }

  /**
   * Obtém todos os clientes
   */
  async getAllClientes(): Promise<ClienteResult<Cliente[]>> {
    try {
      const result = await databaseAdapter.getAll<Cliente>(this.tableName);
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data || [] };
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return { error: 'Erro ao buscar clientes' };
    }
  }

  /**
   * Cria um novo cliente
   */
  async createCliente(clienteData: CreateClienteDTO): Promise<ClienteResult<Cliente>> {
    try {
      // Validação básica
      if (!clienteData.nome || !clienteData.email) {
        return { error: 'Nome e email são obrigatórios' };
      }

      // Verificar se já existe um cliente com o mesmo email
      const existingResult = await databaseAdapter.findOne<Cliente>(this.tableName, {
        email: clienteData.email
      });
      
      if (existingResult.data) {
        return { error: 'Já existe um cliente com este email' };
      }

      const result = await databaseAdapter.create<Cliente>(this.tableName, clienteData);
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return { error: 'Erro ao criar cliente' };
    }
  }

  /**
   * Atualiza um cliente existente
   */
  async updateCliente(id: string, clienteData: UpdateClienteDTO): Promise<ClienteResult<Cliente>> {
    try {
      // Verificar se o cliente existe
      const existingResult = await databaseAdapter.getById<Cliente>(this.tableName, id);
      
      if (existingResult.error || !existingResult.data) {
        return { error: 'Cliente não encontrado' };
      }

      // Verificar se o email já está sendo usado por outro cliente
      if (clienteData.email) {
        const emailCheckResult = await databaseAdapter.findWhere<Cliente>(this.tableName, {
          email: clienteData.email
        });
        
        const existingWithEmail = emailCheckResult.data?.find(c => c.id !== id);
        if (existingWithEmail) {
          return { error: 'Já existe um cliente com este email' };
        }
      }

      const result = await databaseAdapter.update<Cliente>(this.tableName, id, clienteData);
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data };
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return { error: 'Erro ao atualizar cliente' };
    }
  }

  /**
   * Exclui um cliente
   */
  async deleteCliente(id: string): Promise<ClienteResult<boolean>> {
    try {
      const result = await databaseAdapter.delete(this.tableName, id);
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: true };
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      return { error: 'Erro ao excluir cliente' };
    }
  }

  /**
   * Obtém um cliente por ID
   */
  async getClienteById(id: string): Promise<ClienteResult<Cliente>> {
    try {
      const result = await databaseAdapter.getById<Cliente>(this.tableName, id);
      
      if (result.error) {
        return { error: result.error };
      }

      if (!result.data) {
        return { error: 'Cliente não encontrado' };
      }

      return { data: result.data };
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return { error: 'Erro ao buscar cliente' };
    }
  }
}