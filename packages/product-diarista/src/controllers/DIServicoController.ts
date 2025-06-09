import { Servico, CreateServicoDTO } from '../models/DiaristaModels';
import { databaseAdapter } from '../lib/database/DatabaseAdapter';

export interface ServicoResult<T> {
  data?: T;
  error?: string;
}

/**
 * Controlador DI para gerenciamento de serviços
 */
export class DIServicoController {
  private readonly tableName = 'servicos';

  constructor() {
    // Usando o databaseAdapter do Supabase
  }

  /**
   * Obtém todos os serviços
   */
  async getAllServicos(): Promise<ServicoResult<Servico[]>> {
    try {
      const result = await databaseAdapter.getAll<Servico>(this.tableName);
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data || [] };
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return { error: 'Erro ao buscar serviços' };
    }
  }

  /**
   * Cria um novo serviço
   */
  async createServico(servicoData: CreateServicoDTO): Promise<ServicoResult<Servico>> {
    try {
      // Validações
      if (!servicoData.data) {
        return { error: 'Data é obrigatória' };
      }

      if (!servicoData.valor || parseFloat(servicoData.valor.toString()) <= 0) {
        return { error: 'Valor deve ser maior que zero' };
      }

      if (!servicoData.cliente_id) {
        return { error: 'Cliente é obrigatório' };
      }

      // Preparar dados para criação
      const servicoToCreate = {
        ...servicoData,
        valor: parseFloat(servicoData.valor.toString()),
        status: servicoData.status || 'AGENDADO'
      };

      const result = await databaseAdapter.create<Servico>(this.tableName, servicoToCreate);
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data };
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      return { error: 'Erro ao criar serviço' };
    }
  }

  /**
   * Atualiza um serviço existente
   */
  async updateServico(id: string, servicoData: Partial<CreateServicoDTO>): Promise<ServicoResult<Servico>> {
    try {
      // Verificar se o serviço existe
      const existingResult = await databaseAdapter.getById<Servico>(this.tableName, id);
      
      if (existingResult.error || !existingResult.data) {
        return { error: 'Serviço não encontrado' };
      }

      // Validações
      if (servicoData.valor !== undefined && parseFloat(servicoData.valor.toString()) <= 0) {
        return { error: 'Valor deve ser maior que zero' };
      }

      // Preparar dados para atualização
      const updateData = {
        ...servicoData,
        ...(servicoData.valor && { valor: parseFloat(servicoData.valor.toString()) })
      };

      const result = await databaseAdapter.update<Servico>(this.tableName, id, updateData);
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data };
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      return { error: 'Erro ao atualizar serviço' };
    }
  }

  /**
   * Exclui um serviço
   */
  async deleteServico(id: string): Promise<ServicoResult<boolean>> {
    try {
      const result = await databaseAdapter.delete(this.tableName, id);
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: true };
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      return { error: 'Erro ao excluir serviço' };
    }
  }

  /**
   * Obtém um serviço por ID
   */
  async getServicoById(id: string): Promise<ServicoResult<Servico>> {
    try {
      const result = await databaseAdapter.getById<Servico>(this.tableName, id);
      
      if (result.error) {
        return { error: result.error };
      }

      if (!result.data) {
        return { error: 'Serviço não encontrado' };
      }

      return { data: result.data };
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      return { error: 'Erro ao buscar serviço' };
    }
  }

  /**
   * Busca serviços por cliente
   */
  async getServicosByCliente(clienteId: string): Promise<ServicoResult<Servico[]>> {
    try {
      const result = await databaseAdapter.findWhere<Servico>(this.tableName, {
        cliente_id: clienteId
      });
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data || [] };
    } catch (error) {
      console.error('Erro ao buscar serviços por cliente:', error);
      return { error: 'Erro ao buscar serviços por cliente' };
    }
  }

  /**
   * Busca serviços por status
   */
  async getServicosByStatus(status: string): Promise<ServicoResult<Servico[]>> {
    try {
      const result = await databaseAdapter.findWhere<Servico>(this.tableName, {
        status: status
      });
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data || [] };
    } catch (error) {
      console.error('Erro ao buscar serviços por status:', error);
      return { error: 'Erro ao buscar serviços por status' };
    }
  }
}