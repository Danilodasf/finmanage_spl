import { toast } from '../hooks/use-toast';
import { SupabaseMeiDASService, DASPayment } from '../lib/services/SupabaseMeiDASService';

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
} 