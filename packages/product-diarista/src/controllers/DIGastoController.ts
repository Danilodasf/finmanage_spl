import { databaseAdapter } from '../lib/database/DatabaseAdapter';
import { GastoServico, CreateGastoServicoDTO } from '../models/DiaristaModels';
import { DITransactionController } from './DITransactionController';
import { DICategoryController } from './DICategoryController';

export interface GastoResult<T> {
  data?: T;
  error?: string;
}

export class DIGastoController {
  private databaseAdapter = databaseAdapter;

  constructor() {
    // Usando a instância global do databaseAdapter
  }

  async createGasto(gastoData: CreateGastoServicoDTO): Promise<GastoResult<GastoServico>> {
    try {
      // Não definir o ID - deixar o banco gerar automaticamente o UUID
      const gastoToCreate = {
        servico_id: gastoData.servico_id,
        user_id: gastoData.user_id,
        descricao: gastoData.descricao,
        valor: gastoData.valor,
        categoria_id: gastoData.categoria_id,
        data: gastoData.data
        // created_at e updated_at também serão gerados automaticamente pelo banco
      };

      const result = await this.databaseAdapter.create('gastos_servicos', gastoToCreate);
      
      if (result.error) {
        return { error: result.error };
      }

      const gastoCreated = result.data as GastoServico;
      
      // Criar transação automaticamente
      await this.criarTransacaoGasto(gastoCreated);

      return { data: gastoCreated };
    } catch (error) {
      console.error('Erro ao criar gasto:', error);
      return { error: 'Erro interno do servidor' };
    }
  }

  async getGastosByServico(servicoId: string): Promise<GastoResult<GastoServico[]>> {
    try {
      const result = await this.databaseAdapter.findMany('gastos_servicos', {
        servico_id: servicoId
      });
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data as GastoServico[] };
    } catch (error) {
      console.error('Erro ao buscar gastos do serviço:', error);
      return { error: 'Erro interno do servidor' };
    }
  }

  async updateGasto(id: string, gastoData: Partial<CreateGastoServicoDTO>): Promise<GastoResult<GastoServico>> {
    try {
      // Não definir updated_at manualmente - deixar o banco gerenciar automaticamente
      const updateData = {
        ...gastoData
      };

      const result = await this.databaseAdapter.update('gastos_servicos', id, updateData);
      
      if (result.error) {
        return { error: result.error };
      }

      const gastoUpdated = result.data as GastoServico;
      
      // Atualizar transação correspondente
      await this.atualizarTransacaoGasto(gastoUpdated);

      return { data: gastoUpdated };
    } catch (error) {
      console.error('Erro ao atualizar gasto:', error);
      return { error: 'Erro interno do servidor' };
    }
  }

  async deleteGasto(id: string): Promise<GastoResult<void>> {
    try {
      // Buscar o gasto antes de deletar para obter informações da transação
      const gastoResult = await this.databaseAdapter.getById('gastos_servicos', id);
      
      if (gastoResult.error || !gastoResult.data) {
        return { error: gastoResult.error || 'Gasto não encontrado' };
      }
      
      const gasto = gastoResult.data as GastoServico;
      
      // Deletar transação correspondente primeiro
      await this.deletarTransacaoGasto(gasto);
      
      // Deletar o gasto
      const result = await this.databaseAdapter.delete('gastos_servicos', id);
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: undefined };
    } catch (error) {
      console.error('Erro ao deletar gasto:', error);
      return { error: 'Erro interno do servidor' };
    }
  }

  async getAllGastos(): Promise<GastoResult<GastoServico[]>> {
    try {
      const result = await this.databaseAdapter.findMany('gastos_servicos');
      
      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data as GastoServico[] };
    } catch (error) {
      console.error('Erro ao buscar todos os gastos:', error);
      return { error: 'Erro interno do servidor' };
    }
  }

  /**
   * Cria uma transação de despesa para um gasto adicional
   */
  private async criarTransacaoGasto(gasto: GastoServico): Promise<void> {
    try {
      const transactionController = new DITransactionController();
      const categoryController = new DICategoryController();
      
      // Buscar a categoria "Gastos Adicionais"
      const categoriesResult = await categoryController.getCategoriesByType('despesa');
      let gastosAdicionaisCategory = null;
      
      if (categoriesResult.data) {
        gastosAdicionaisCategory = categoriesResult.data.find(
          cat => cat.name === 'Gastos Adicionais'
        );
      }
      
      // Se não encontrar a categoria, criar as categorias padrão
      if (!gastosAdicionaisCategory) {
        await categoryController.createDefaultCategories();
        const newCategoriesResult = await categoryController.getCategoriesByType('despesa');
        if (newCategoriesResult.data) {
          gastosAdicionaisCategory = newCategoriesResult.data.find(
            cat => cat.name === 'Gastos Adicionais'
          );
        }
      }
      
      if (gastosAdicionaisCategory) {
        await transactionController.createTransaction({
          category_id: gastosAdicionaisCategory.id,
          type: 'despesa',
          value: gasto.valor,
          description: `Gasto adicional: ${gasto.descricao}`,
          date: gasto.data,
          payment_method: 'dinheiro', // valor padrão
          gasto_servico_id: gasto.id, // Referência ao gasto
          is_auto_generated: true // Marca como gerada automaticamente
        });
      }
    } catch (error) {
      console.error('Erro ao criar transação de gasto:', error);
      // Não interrompe o fluxo se houver erro na criação da transação
    }
  }

  /**
   * Atualiza a transação correspondente a um gasto adicional
   */
  private async atualizarTransacaoGasto(gasto: GastoServico): Promise<void> {
    try {
      const transactionController = new DITransactionController();
      
      // Buscar a transação correspondente ao gasto
      const allTransactionsResult = await transactionController.getAllTransactions();
      
      if (allTransactionsResult.data) {
        const transacaoCorrespondente = allTransactionsResult.data.find(
          (t: any) => t.gasto_servico_id === gasto.id
        );
        
        if (transacaoCorrespondente) {
          await transactionController.updateTransaction(transacaoCorrespondente.id, {
            value: gasto.valor,
            description: `Gasto adicional: ${gasto.descricao}`,
            date: gasto.data
          });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar transação de gasto:', error);
      // Não interrompe o fluxo se houver erro na atualização da transação
    }
  }

  /**
   * Deleta a transação correspondente a um gasto adicional
   */
  private async deletarTransacaoGasto(gasto: GastoServico): Promise<void> {
    try {
      const transactionController = new DITransactionController();
      
      // Buscar a transação correspondente ao gasto
      const allTransactionsResult = await transactionController.getAllTransactions();
      
      if (allTransactionsResult.data) {
        const transacaoCorrespondente = allTransactionsResult.data.find(
          (t: any) => t.gasto_servico_id === gasto.id
        );
        
        if (transacaoCorrespondente) {
          await transactionController.deleteTransaction(transacaoCorrespondente.id);
        }
      }
    } catch (error) {
      console.error('Erro ao deletar transação de gasto:', error);
      // Não interrompe o fluxo se houver erro na deleção da transação
    }
  }
}