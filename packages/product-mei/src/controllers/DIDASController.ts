import { supabase } from '../lib/supabase';
import { toast } from '../hooks/use-toast';
import { SupabaseMeiDASService, DASPayment } from '../lib/services/SupabaseMeiDASService';
import { SupabaseMeiTransactionService } from '../lib/services/SupabaseMeiTransactionService';
// Importação do DIContainer comentada temporariamente até encontrar o caminho correto
// import DIContainer from '../lib/di-container';

/**
 * Controlador para gerenciar pagamentos DAS
 */
export class DIDASController {
  private static dasService: SupabaseMeiDASService | null = null;
  
  /**
   * Obtém o serviço de pagamentos DAS
   * @returns Instância do serviço de pagamentos DAS
   */
  private static getDASService(): SupabaseMeiDASService {
    if (!this.dasService) {
      this.dasService = new SupabaseMeiDASService();
    }
    return this.dasService;
  }

  /**
   * Busca todos os pagamentos DAS
   * @returns Lista de pagamentos DAS
   */
  static async getAllPayments(): Promise<DASPayment[]> {
    try {
      const dasService = this.getDASService();
      const { data, error } = await dasService.getAll();
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao buscar pagamentos DAS.",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos DAS:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar pagamentos DAS.",
        variant: "destructive",
      });
      return [];
    }
  }

  /**
   * Busca um pagamento DAS pelo ID
   * @param id ID do pagamento DAS
   * @returns Pagamento DAS ou null se não encontrado
   */
  static async getPaymentById(id: string): Promise<DASPayment | null> {
    try {
      const dasService = this.getDASService();
      const { data, error } = await dasService.getById(id);
      
      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao buscar pagamento DAS com ID ${id}.`,
          variant: "destructive",
        });
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar pagamento DAS com ID ${id}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao buscar pagamento DAS com ID ${id}.`,
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Cria um novo pagamento DAS
   * @param payment Dados do pagamento DAS
   * @returns Pagamento DAS criado ou null em caso de erro
   */
  static async createPayment(payment: Omit<DASPayment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DASPayment | null> {
    try {
      console.log('[DIDASController] createPayment - Iniciando criação de pagamento DAS:', payment);
      const dasService = this.getDASService();
      const { data, error } = await dasService.create(payment);
      
      if (error) {
        console.error('[DIDASController] createPayment - Erro retornado do serviço:', error);
        
        // Verificar se é um erro de tabela não encontrada
        if (error.message?.includes('não encontrada') || error.message?.includes('not found')) {
          toast({
            title: "Erro de configuração",
            description: "A tabela de pagamentos DAS não existe. Por favor, acesse a página de configuração do banco de dados para criá-la.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro",
            description: `Erro ao criar pagamento DAS: ${error.message}`,
            variant: "destructive",
          });
        }
        return null;
      }
      
      console.log('[DIDASController] createPayment - Pagamento DAS criado com sucesso:', data);
      
      // Criar transação de despesa se o pagamento estiver como Pago
      if (data && payment.status === 'Pago' && payment.data_pagamento) {
        try {
          // Validar saldo antes de criar a transação
          const transactionService = new SupabaseMeiTransactionService();
          const financialSummary = await transactionService.getFinancialSummary('month');
          
          if (financialSummary.saldo < (payment.valor || 0)) {
            toast({
              title: 'Saldo Insuficiente',
              description: `Saldo atual: R$ ${financialSummary.saldo.toFixed(2)}. Valor do DAS: R$ ${(payment.valor || 0).toFixed(2)}. Não é possível registrar o pagamento.`,
              variant: 'destructive',
            });
            // Reverter o pagamento DAS criado
            await this.getDASService().delete(data.id);
            return null;
          }
          
          // Buscar o ID da categoria "Impostos"
          const { data: categoria, error: catError } = await supabase
            .from('categories')
            .select('id')
            .eq('name', 'Impostos')
            .single();
          
          if (catError || !categoria) {
            console.error('Categoria "Impostos" não encontrada ou erro:', catError);
            toast({
              title: 'Erro',
              description: 'Categoria "Impostos" não encontrada. Não foi possível registrar a transação de despesa.',
              variant: 'destructive',
            });
            return data;
          }
          
          const categoriaId = categoria.id;
          const transactionData = {
            user_id: data.user_id,
            type: 'despesa',
            category_id: categoriaId,
            description: `DAS - Competência ${payment.competencia}`,
            value: payment.valor || 0,
            date: payment.data_pagamento,
            payment_method: 'Transferência',
          };
          
          const { data: transactionResult, error: transError } = await supabase
            .from('transactions')
            .insert([transactionData])
            .select()
            .single();
            
          if (transError || !transactionResult) {
            console.error('Erro ao criar transação de despesa:', transError);
            toast({
              title: 'Erro',
              description: 'Erro ao criar transação de despesa: ' + (transError?.message || 'Erro desconhecido'),
              variant: 'destructive',
            });
          } else {
            console.log('Transação de despesa criada para o pagamento DAS:', transactionResult);
            
            // Atualizar o pagamento DAS com o transaction_id
            const { error: updateError } = await supabase
              .from('imposto_das')
              .update({ transaction_id: transactionResult.id })
              .eq('id', data.id);
              
            if (updateError) {
              console.error('Erro ao vincular transaction_id ao pagamento DAS:', updateError);
            } else {
              console.log('Transaction_id vinculado ao pagamento DAS com sucesso');
              data.transaction_id = transactionResult.id;
            }
          }
        } catch (transactionError) {
          console.error('Erro ao criar transação de despesa:', transactionError);
        }
      }
      
      toast({
        title: "Sucesso",
        description: "Pagamento DAS registrado com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error('[DIDASController] createPayment - Erro inesperado:', error);
      toast({
        title: "Erro",
        description: `Erro ao criar pagamento DAS: ${(error as Error).message}`,
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Atualiza um pagamento DAS existente
   * @param id ID do pagamento DAS
   * @param payment Dados para atualização
   * @returns Pagamento DAS atualizado ou null em caso de erro
   */
  static async updatePayment(id: string, payment: Partial<Omit<DASPayment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<DASPayment | null> {
    try {
      const dasService = this.getDASService();
      const { data, error } = await dasService.update(id, payment);
      
      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao atualizar pagamento DAS: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }
      
      if (data) {
        console.log(`[DIDASController.updatePayment] dasService.update retornou: id=${data.id}, status=${data.status}, transaction_id=${data.transaction_id}`);
      } else {
        console.log(`[DIDASController.updatePayment] dasService.update não retornou dados.`);
        // Considerar se isso é um erro que deve ser tratado se 'data' for crucial aqui além do toast
      }
      
      toast({
        title: "Sucesso",
        description: "Pagamento DAS atualizado com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error(`Erro ao atualizar pagamento DAS com ID ${id}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar pagamento DAS: ${(error as Error).message}`,
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Remove um pagamento DAS
   * @param id ID do pagamento DAS
   * @returns true se removido com sucesso, false caso contrário
   */
  static async deletePayment(id: string): Promise<boolean> {
    try {
      const dasService = this.getDASService();
      const { success, error } = await dasService.delete(id);
      
      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao excluir pagamento DAS: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Pagamento DAS excluído com sucesso.",
      });
      
      return success;
    } catch (error) {
      console.error(`Erro ao excluir pagamento DAS com ID ${id}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao excluir pagamento DAS: ${(error as Error).message}`,
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Marca um pagamento DAS como pago
   * @param id ID do pagamento DAS
   * @param dataPagamento Data do pagamento
   * @returns Pagamento DAS atualizado ou null em caso de erro
   */
  static async markAsPaid(id: string, dataPagamento: string): Promise<DASPayment | null> {
    try {
      const dasService = this.getDASService();
      const { data, error } = await dasService.markAsPaid(id, dataPagamento);
      
      if (error) {
        toast({
          title: "Erro",
          description: `Erro ao marcar pagamento DAS como pago: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Sucesso",
        description: "Pagamento DAS marcado como pago com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error(`Erro ao marcar pagamento DAS com ID ${id} como pago:`, error);
      toast({
        title: "Erro",
        description: `Erro ao marcar pagamento DAS como pago: ${(error as Error).message}`,
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Atualiza a URL do comprovante de um pagamento DAS
   * @param paymentId ID do pagamento DAS
   * @param comprovanteUrl URL do comprovante
   * @returns void
   */
  static async updatePaymentComprovante(paymentId: string, comprovanteUrl: string): Promise<void> {
    try {
      const dasService = this.getDASService();
      const result = await dasService.updateComprovante(paymentId, comprovanteUrl);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar comprovante:', error);
      throw error;
    }
  }
}