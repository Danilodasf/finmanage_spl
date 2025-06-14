import { supabase, getCurrentUserId } from '../supabase';

/**
 * Interface para representar um pagamento DAS
 */
export interface DASPayment {
  id: string;
  user_id: string;
  competencia: string;
  vencimento: string;
  valor: number;
  numero_das?: string;
  data_pagamento?: string;
  status: 'Pago' | 'Pendente';
  transaction_id?: string | null;
  comprovante_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Serviço para gerenciar pagamentos DAS usando Supabase
 */
export class SupabaseMeiDASService {
  /**
   * Busca todos os pagamentos DAS do usuário
   */
  async getAll(): Promise<{ data: DASPayment[] | null; error: Error | null }> {
    try {
      console.log('[SupabaseMeiDASService] getAll - Iniciando...');
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiDASService] getAll - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('user_id', userId)
        .order('vencimento', { ascending: false });
        
      if (error) {
        console.error('[SupabaseMeiDASService] getAll - Erro:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      console.log(`[SupabaseMeiDASService] getAll - Retornando ${data.length} pagamentos DAS`);
      return { data, error: null };
    } catch (error) {
      console.error('[SupabaseMeiDASService] getAll - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca um pagamento DAS pelo ID
   * @param id ID do pagamento DAS
   */
  async getById(id: string): Promise<{ data: DASPayment | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiDASService] getById - Buscando pagamento DAS com ID ${id}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiDASService] getById - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error(`[SupabaseMeiDASService] getById - Erro ao buscar pagamento DAS ${id}:`, error);
        return { data: null, error: new Error(error.message) };
      }
      
      console.log(`[SupabaseMeiDASService] getById - Pagamento DAS ${id} encontrado`);
      return { data, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiDASService] getById - Erro inesperado ao buscar pagamento DAS ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Cria um novo pagamento DAS
   * @param payment Dados do pagamento DAS
   */
  async create(payment: Omit<DASPayment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: DASPayment | null; error: Error | null }> {
    try {
      console.log('[SupabaseMeiDASService] create - Iniciando criação de pagamento DAS:', payment);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiDASService] create - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Verificar se a tabela existe
      console.log('[SupabaseMeiDASService] create - Verificando se a tabela imposto_das existe...');
      const { error: tableCheckError } = await supabase
        .from('imposto_das')
        .select('count')
        .limit(1);
        
      if (tableCheckError) {
        console.error('[SupabaseMeiDASService] create - Erro ao verificar tabela:', tableCheckError);
        return { data: null, error: new Error(`Tabela imposto_das não encontrada: ${tableCheckError.message}`) };
      }
      
      // Preparar dados para inserção
      const paymentToInsert = {
        user_id: userId,
        competencia: payment.competencia,
        vencimento: payment.vencimento,
        valor: payment.valor,
        numero_das: payment.numero_das || null,
        data_pagamento: payment.data_pagamento || null,
        status: payment.status
      };
      
      console.log('[SupabaseMeiDASService] create - Inserindo:', paymentToInsert);
      
      // Primeiro inserir o registro
      const { error: insertError } = await supabase
        .from('imposto_das')
        .insert(paymentToInsert);
        
      if (insertError) {
        console.error('[SupabaseMeiDASService] create - Erro Supabase ao inserir:', insertError);
        return { data: null, error: new Error(`Erro ao criar pagamento: ${insertError.message || 'Erro desconhecido'}`) };
      }
      
      // Depois buscar o registro inserido (porque o Supabase pode não retornar o registro completo na inserção)
      console.log('[SupabaseMeiDASService] create - Buscando registro inserido...');
      const { data, error: selectError } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('user_id', userId)
        .eq('competencia', payment.competencia)
        .eq('vencimento', payment.vencimento)
        .eq('valor', payment.valor)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (selectError) {
        console.error('[SupabaseMeiDASService] create - Erro ao buscar registro inserido:', selectError);
        return { data: null, error: new Error(`Pagamento criado, mas não foi possível recuperá-lo: ${selectError.message}`) };
      }
      
      if (!data) {
        console.error('[SupabaseMeiDASService] create - Nenhum dado retornado na busca');
        return { data: null, error: new Error('Pagamento criado, mas não foi possível recuperá-lo') };
      }
      
      console.log('[SupabaseMeiDASService] create - Pagamento DAS criado com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('[SupabaseMeiDASService] create - Erro inesperado:', error);
      return { data: null, error: new Error(`Erro ao criar pagamento: ${errorMessage}`) };
    }
  }
  
  /**
   * Atualiza um pagamento DAS existente
   * @param id ID do pagamento DAS
   * @param payment Dados para atualização
   */
  async update(id: string, payment: Partial<Omit<DASPayment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<{ data: DASPayment | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiDASService] update - Atualizando pagamento DAS ${id}:`, payment);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiDASService] update - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Buscar o registro atual para comparar mudanças
      const { data: currentData, error: fetchError } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (fetchError || !currentData) {
        console.error('[SupabaseMeiDASService] update - Erro ao buscar registro atual:', fetchError);
        return { data: null, error: new Error('Registro não encontrado') };
      }
      
      // Preparar dados para atualização
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (payment.competencia !== undefined) updateData.competencia = payment.competencia;
      if (payment.vencimento !== undefined) updateData.vencimento = payment.vencimento;
      if (payment.valor !== undefined) updateData.valor = payment.valor;
      if (payment.numero_das !== undefined) updateData.numero_das = payment.numero_das;
      if (payment.status !== undefined) updateData.status = payment.status;
      if (payment.data_pagamento !== undefined) updateData.data_pagamento = payment.data_pagamento;
      
      const { data, error } = await supabase
        .from('imposto_das')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('[SupabaseMeiDASService] update - Erro Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { data: null, error: new Error(error.message) };
      }
      
      // Gerenciar transação associada baseado nas mudanças de status
      if (data) {
        await this.manageAssociatedTransaction(currentData, data, userId);
      }
      
      console.log(`[SupabaseMeiDASService] update - Pagamento DAS ${id} atualizado com sucesso:`, data);
      return { data, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiDASService] update - Erro inesperado ao atualizar pagamento DAS ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Remove um pagamento DAS
   * @param id ID do pagamento DAS
   */
  async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiDASService] delete - Removendo pagamento DAS ${id}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiDASService] delete - Usuário não autenticado');
        return { success: false, error: new Error('Usuário não autenticado') };
      }
      
      // Buscar o DAS antes de deletar para verificar se tem transação associada
      const { data: dasData, error: fetchError } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (fetchError) {
        console.error(`[SupabaseMeiDASService] delete - Erro ao buscar DAS ${id}:`, fetchError);
        return { success: false, error: new Error(fetchError.message) };
      }
      
      // Se o DAS tem transação associada, usar o TransactionService para deletar
      // Isso permitirá que os triggers funcionem corretamente
      if (dasData && dasData.transaction_id) {
        console.log(`[SupabaseMeiDASService] delete - Usando TransactionService para deletar transação ${dasData.transaction_id}`);
        
        // Importar o TransactionService dinamicamente para evitar dependência circular
        const { SupabaseMeiTransactionService } = await import('./SupabaseMeiTransactionService');
        const transactionService = new SupabaseMeiTransactionService();
        
        const { success: transactionDeleted, error: deleteTransactionError } = await transactionService.delete(dasData.transaction_id);
        
        if (!transactionDeleted || deleteTransactionError) {
          console.error(`[SupabaseMeiDASService] delete - Erro ao deletar transação associada ${dasData.transaction_id}:`, deleteTransactionError);
          return { success: false, error: deleteTransactionError || new Error('Falha ao deletar transação associada') };
        }
        
        console.log(`[SupabaseMeiDASService] delete - Transação ${dasData.transaction_id} deletada via TransactionService (triggers devem ter removido o DAS automaticamente)`);
        return { success: true, error: null };
      } else {
        // Se não tem transação associada, deletar o DAS diretamente
        console.log(`[SupabaseMeiDASService] delete - DAS sem transação associada, deletando diretamente`);
        
        const { error } = await supabase
          .from('imposto_das')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
          
        if (error) {
          console.error(`[SupabaseMeiDASService] delete - Erro ao excluir pagamento DAS ${id}:`, error);
          return { success: false, error: new Error(error.message) };
        }
        
        console.log(`[SupabaseMeiDASService] delete - Pagamento DAS ${id} removido com sucesso`);
        return { success: true, error: null };
      }
    } catch (error) {
      console.error(`[SupabaseMeiDASService] delete - Erro inesperado ao excluir pagamento DAS ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  /**
   * Marca um pagamento DAS como pago
   * @param id ID do pagamento DAS
   * @param dataPagamento Data do pagamento
   */
  async markAsPaid(id: string, dataPagamento: string): Promise<{ data: DASPayment | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiDASService] markAsPaid - Marcando pagamento DAS ${id} como pago`);
      
      return await this.update(id, {
        status: 'Pago',
        data_pagamento: dataPagamento
      });
    } catch (error) {
      console.error(`[SupabaseMeiDASService] markAsPaid - Erro inesperado ao marcar pagamento DAS ${id} como pago:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Gerencia transação associada baseado nas mudanças de status do DAS
   * @param currentData Dados atuais do DAS
   * @param updatedData Dados atualizados do DAS
   * @param userId ID do usuário
   */
  private async manageAssociatedTransaction(currentData: any, updatedData: any, userId: string): Promise<void> {
    try {
      const statusChanged = currentData.status !== updatedData.status;
      const wasUnpaid = currentData.status === 'Pendente';
      const nowPaid = updatedData.status === 'Pago';
      const wasPaid = currentData.status === 'Pago';
      const nowUnpaid = updatedData.status === 'Pendente';
      
      // Caso 1: Mudou de Pendente para Pago - criar transação
      if (statusChanged && wasUnpaid && nowPaid && updatedData.data_pagamento) {
        // Buscar categoria "Impostos"
        const { data: categoria, error: catError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', 'Impostos')
          .single();
          
        if (!catError && categoria) {
          const transactionData = {
            user_id: userId,
            type: 'despesa',
            category_id: categoria.id,
            description: `DAS - Competência ${updatedData.competencia}`,
            value: updatedData.valor,
            date: updatedData.data_pagamento,
            payment_method: 'Transferência',
          };
          
          const { data: transactionResult, error: transError } = await supabase
            .from('transactions')
            .insert([transactionData])
            .select()
            .single();
            
          if (!transError && transactionResult) {
            // Atualizar DAS com transaction_id
            await supabase
              .from('imposto_das')
              .update({ transaction_id: transactionResult.id })
              .eq('id', updatedData.id);
              
            console.log(`[SupabaseMeiDASService] manageAssociatedTransaction - Transação criada: ${transactionResult.id}`);
          }
        }
      }
      
      // Caso 2: Mudou de Pago para Pendente - deletar transação
      else if (statusChanged && wasPaid && nowUnpaid && currentData.transaction_id) {
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', currentData.transaction_id)
          .eq('user_id', userId);
          
        if (!deleteError) {
          // Limpar transaction_id do DAS
          await supabase
            .from('imposto_das')
            .update({ transaction_id: null })
            .eq('id', updatedData.id);
            
          console.log(`[SupabaseMeiDASService] manageAssociatedTransaction - Transação deletada: ${currentData.transaction_id}`);
        }
      }
      
      // Caso 3: Status continua Pago mas dados mudaram - atualizar transação
      else if (!statusChanged && nowPaid && currentData.transaction_id) {
        const updateTransactionData: any = {};
        
        if (currentData.valor !== updatedData.valor) {
          updateTransactionData.value = updatedData.valor;
        }
        if (currentData.data_pagamento !== updatedData.data_pagamento) {
          updateTransactionData.date = updatedData.data_pagamento;
        }
        if (currentData.competencia !== updatedData.competencia) {
          updateTransactionData.description = `DAS - Competência ${updatedData.competencia}`;
        }
        
        if (Object.keys(updateTransactionData).length > 0) {
          await supabase
            .from('transactions')
            .update(updateTransactionData)
            .eq('id', currentData.transaction_id)
            .eq('user_id', userId);
            
          console.log(`[SupabaseMeiDASService] manageAssociatedTransaction - Transação atualizada: ${currentData.transaction_id}`);
        }
      }
    } catch (error) {
      console.error('[SupabaseMeiDASService] manageAssociatedTransaction - Erro:', error);
    }
  }

  /**
   * Atualiza a URL do comprovante de um pagamento DAS
   * @param id ID do pagamento DAS
   * @param comprovanteUrl URL do comprovante
   */
  async updateComprovante(id: string, comprovanteUrl: string): Promise<{ data: DASPayment | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiDASService] updateComprovante - Atualizando comprovante do DAS ${id}`);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('[SupabaseMeiDASService] updateComprovante - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      const { data, error } = await supabase
        .from('imposto_das')
        .update({ comprovante_url: comprovanteUrl })
        .eq('id', id)
        .eq('user_id', user.user.id)
        .select()
        .single();

      if (error) {
        console.error(`[SupabaseMeiDASService] updateComprovante - Erro ao atualizar comprovante:`, error);
        return { data: null, error: new Error(error.message) };
      }

      console.log(`[SupabaseMeiDASService] updateComprovante - Comprovante atualizado com sucesso`);
      return { data, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiDASService] updateComprovante - Erro inesperado:`, error);
      return { data: null, error: error as Error };
    }
  }
}