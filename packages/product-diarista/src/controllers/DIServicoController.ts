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
      // Validar dados obrigatórios
      if (!servicoData.user_id) {
        return { error: 'ID do usuário é obrigatório' };
      }

      if (!servicoData.cliente_id) {
        return { error: 'ID do cliente é obrigatório' };
      }

      if (!servicoData.valor || servicoData.valor <= 0) {
        return { error: 'Valor deve ser maior que zero' };
      }

      // Se o serviço está sendo criado como CONCLUIDO, buscar categoria "Serviços Realizados"
      let finalServiceData = { 
        ...servicoData,
        // Manter status em minúsculas para compatibilidade com o enum do banco
        status: servicoData.status?.toLowerCase() as any
      };
      
      if (servicoData.status === 'CONCLUIDO') {
        const categoryController = new (await import('./DICategoryController')).DICategoryController();
        const categoriesResult = await categoryController.getCategoriesByType('income');
        
        if (categoriesResult.data) {
          const servicosRealizadosCategory = categoriesResult.data.find(
            cat => cat.name === 'Serviços Realizados'
          );
          
          if (servicosRealizadosCategory) {
            finalServiceData.categoria_id = servicosRealizadosCategory.id;
          }
        }
      }

      // Criar o serviço
      const result = await databaseAdapter.create<Servico>(this.tableName, finalServiceData);
      
      if (result.error) {
        return { error: result.error };
      }

      // Transação será criada automaticamente pelo trigger do banco de dados

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
        ...(servicoData.valor && { valor: parseFloat(servicoData.valor.toString()) }),
        ...(servicoData.status && { status: servicoData.status.toLowerCase() as any })
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
      // Usar status como fornecido para busca no banco
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

  // Método removido - transações são criadas automaticamente pelos triggers do banco de dados
}