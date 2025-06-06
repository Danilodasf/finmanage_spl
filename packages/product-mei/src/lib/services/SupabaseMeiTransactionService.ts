import { TransactionService, Transaction } from '../core-exports';
import { supabase, getCurrentUserId } from '../supabase';

/**
 * Implementação do serviço de transações usando Supabase para o produto MEI
 */
export class SupabaseMeiTransactionService implements TransactionService {
  /**
   * Busca todas as transações
   */
  async getAll(): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      console.log('[SupabaseMeiTransactionService] getAll - Iniciando...');
      const userId = await getCurrentUserId();
      console.log('[SupabaseMeiTransactionService] getAll - UserId obtido:', userId);
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] getAll - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      console.log('[SupabaseMeiTransactionService] getAll - Executando query no Supabase...');
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      console.log('[SupabaseMeiTransactionService] getAll - Resultado da query:');
      console.log('- Data bruta:', data);
      console.log('- Error:', error);
      console.log('- Número de registros:', data?.length || 0);
        
      if (error) {
        console.error('[SupabaseMeiTransactionService] getAll - Erro:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = data.map((item: any) => {
        console.log('[SupabaseMeiTransactionService] getAll - Formatando item:', item);
        return {
          id: item.id,
          type: item.type,
          date: item.date,
          value: Number(item.value),
          description: item.description || '',
          categoryId: item.category_id || '',
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      });
      
      console.log(`[SupabaseMeiTransactionService] getAll - Dados formatados:`, formattedData);
      console.log(`[SupabaseMeiTransactionService] getAll - Retornando ${formattedData.length} transações`);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('[SupabaseMeiTransactionService] getAll - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca uma transação pelo ID
   * @param id ID da transação
   */
  async getById(id: string): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiTransactionService] getById - Buscando transação com ID ${id}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] getById - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error(`[SupabaseMeiTransactionService] getById - Erro ao buscar transação ${id}:`, error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = {
        id: data.id,
        type: data.type,
        date: data.date,
        value: Number(data.value),
        description: data.description || '',
        categoryId: data.category_id || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      console.log(`[SupabaseMeiTransactionService] getById - Transação ${id} encontrada`);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiTransactionService] getById - Erro inesperado ao buscar transação ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Cria uma nova transação
   * @param entity Dados da transação
   */
  async create(entity: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      console.log('[SupabaseMeiTransactionService] create - Iniciando criação de transação:', entity);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] create - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Verificar se a categoria é um UUID válido
      if (entity.categoryId) {
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entity.categoryId);
        
        if (!isValidUuid) {
          console.error(`[SupabaseMeiTransactionService] create - ID da categoria não é um UUID válido: ${entity.categoryId}`);
          // Em vez de causar erro, definir como nulo
          entity.categoryId = '';
          console.log('[SupabaseMeiTransactionService] create - Definindo ID da categoria como vazio');
        }
      }
      
      // Preparar dados para inserção
      const transactionToInsert = {
        user_id: userId,
        type: entity.type,
        date: entity.date,
        value: entity.value,
        description: entity.description,
        category_id: entity.categoryId
      };
      
      console.log('[SupabaseMeiTransactionService] create - Inserindo:', transactionToInsert);
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionToInsert)
        .select()
        .single();
        
      if (error) {
        console.error('[SupabaseMeiTransactionService] create - Erro Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = {
        id: data.id,
        type: data.type,
        date: data.date,
        value: Number(data.value),
        description: data.description || '',
        categoryId: data.category_id || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      console.log('[SupabaseMeiTransactionService] create - Transação criada com sucesso:', formattedData);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('[SupabaseMeiTransactionService] create - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Atualiza uma transação existente
   * @param id ID da transação
   * @param transactionData Dados da transação a serem atualizados
   */
  async update(id: string, transactionData: Partial<Transaction>): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] update - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      // Buscar dados atuais da transação antes da atualização
      const { data: currentTransaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('[SupabaseMeiTransactionService] update - Erro ao buscar transação atual:', fetchError);
        return { data: null, error: new Error(fetchError.message) };
      }

      // Mapear campos do frontend para o banco de dados
      const mappedData: any = {};
      if (transactionData.type !== undefined) mappedData.type = transactionData.type;
      if (transactionData.date !== undefined) mappedData.date = transactionData.date;
      if (transactionData.value !== undefined) mappedData.value = transactionData.value;
      if (transactionData.description !== undefined) mappedData.description = transactionData.description;
      if (transactionData.categoryId !== undefined) mappedData.category_id = transactionData.categoryId;
      if (transactionData.payment_method !== undefined) mappedData.payment_method = transactionData.payment_method;

      const { data, error } = await supabase
        .from('transactions')
        .update(mappedData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[SupabaseMeiTransactionService] update - Erro:', error);
        return { data: null, error: new Error(error.message) };
      }

      // Nota: A sincronização de registros associados (DAS/vendas) é feita automaticamente pelos triggers do banco

      console.log('[SupabaseMeiTransactionService] update - Transação atualizada:', data);
      return { data, error: null };
    } catch (error) {
      console.error('[SupabaseMeiTransactionService] update - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Remove uma transação
   * @param id ID da transação
   */
  async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiTransactionService] delete - Removendo transação ${id}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] delete - Usuário não autenticado');
        return { success: false, error: new Error('Usuário não autenticado') };
      }
      
      // Buscar dados da transação antes de deletar para sincronização reversa
      const { data: transactionToDelete, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('[SupabaseMeiTransactionService] delete - Erro ao buscar transação:', fetchError);
        return { success: false, error: new Error(fetchError.message) };
      }
      
      console.log('[DEBUG] Transação encontrada:', transactionToDelete);
      
      // Verificar registros relacionados ANTES da deleção
      if (transactionToDelete.type === 'despesa' && transactionToDelete.description?.includes('DAS')) {
        const { data: dasRecords, error: dasError } = await supabase
          .from('imposto_das')
          .select('id, competencia, valor')
          .eq('transaction_id', id);
        
        console.log('[DEBUG] Registros DAS encontrados ANTES da deleção:', dasRecords);
        if (dasError) console.error('[DEBUG] Erro ao buscar DAS:', dasError);
      }
      
      if (transactionToDelete.type === 'receita') {
        const { data: vendasRecords, error: vendasError } = await supabase
          .from('vendas')
          .select('id, descricao, valor')
          .eq('transaction_id', id);
        
        console.log('[DEBUG] Registros de vendas encontrados ANTES da deleção:', vendasRecords);
        if (vendasError) console.error('[DEBUG] Erro ao buscar vendas:', vendasError);
      }
      
      // Executar a deleção
      console.log('[DEBUG] Executando deleção da transação...');
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error(`[SupabaseMeiTransactionService] delete - Erro ao excluir transação ${id}:`, error);
        return { success: false, error: new Error(error.message) };
      }
      
      console.log('[DEBUG] Transação deletada com sucesso. Verificando se triggers funcionaram...');
      
      // Aguardar um pouco para os triggers executarem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar registros relacionados APÓS a deleção
      if (transactionToDelete.type === 'despesa' && transactionToDelete.description?.includes('DAS')) {
        const { data: dasRecordsAfter, error: dasErrorAfter } = await supabase
          .from('imposto_das')
          .select('id, competencia, valor')
          .eq('transaction_id', id);
        
        console.log('[DEBUG] Registros DAS encontrados APÓS a deleção:', dasRecordsAfter);
        if (dasErrorAfter) console.error('[DEBUG] Erro ao buscar DAS após deleção:', dasErrorAfter);
        
        if (dasRecordsAfter && dasRecordsAfter.length > 0) {
          console.error('❌ [DEBUG] PROBLEMA: Registros DAS não foram deletados pelos triggers!');
          console.error('[DEBUG] Registros órfãos encontrados:', dasRecordsAfter);
        } else {
          console.log('✅ [DEBUG] SUCESSO: Registros DAS foram deletados pelos triggers!');
        }
      }
      
      if (transactionToDelete.type === 'receita') {
        const { data: vendasRecordsAfter, error: vendasErrorAfter } = await supabase
          .from('vendas')
          .select('id, descricao, valor')
          .eq('transaction_id', id);
        
        console.log('[DEBUG] Registros de vendas encontrados APÓS a deleção:', vendasRecordsAfter);
        if (vendasErrorAfter) console.error('[DEBUG] Erro ao buscar vendas após deleção:', vendasErrorAfter);
        
        if (vendasRecordsAfter && vendasRecordsAfter.length > 0) {
          console.error('❌ [DEBUG] PROBLEMA: Registros de vendas não foram deletados pelos triggers!');
          console.error('[DEBUG] Registros órfãos encontrados:', vendasRecordsAfter);
        } else {
          console.log('✅ [DEBUG] SUCESSO: Registros de vendas foram deletados pelos triggers!');
        }
      }
      
      // Nota: A exclusão de registros associados (DAS/vendas) é feita automaticamente pelos triggers do banco
      
      console.log(`[SupabaseMeiTransactionService] delete - Transação ${id} removida com sucesso`);
      return { success: true, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiTransactionService] delete - Erro inesperado ao excluir transação ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  /**
   * Busca transações por intervalo de datas
   * @param startDate Data inicial
   * @param endDate Data final
   */
  async getByDateRange(startDate: string, endDate: string): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiTransactionService] getByDateRange - Buscando transações entre ${startDate} e ${endDate}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] getByDateRange - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('[SupabaseMeiTransactionService] getByDateRange - Erro:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = data.map((item: any) => ({
        id: item.id,
        type: item.type,
        date: item.date,
        value: Number(item.value),
        description: item.description || '',
        categoryId: item.category_id || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      console.log(`[SupabaseMeiTransactionService] getByDateRange - Retornando ${formattedData.length} transações`);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('[SupabaseMeiTransactionService] getByDateRange - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca transações por tipo
   * @param type Tipo da transação
   */
  async getByType(type: 'receita' | 'despesa'): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiTransactionService] getByType - Buscando transações do tipo ${type}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] getByType - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('[SupabaseMeiTransactionService] getByType - Erro:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = data.map((item: any) => ({
        id: item.id,
        type: item.type,
        date: item.date,
        value: Number(item.value),
        description: item.description || '',
        categoryId: item.category_id || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      console.log(`[SupabaseMeiTransactionService] getByType - Retornando ${formattedData.length} transações do tipo ${type}`);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('[SupabaseMeiTransactionService] getByType - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca transações por categoria
   * @param categoryId ID da categoria
   */
  async getByCategory(categoryId: string): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiTransactionService] getByCategory - Buscando transações da categoria ${categoryId}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] getByCategory - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('[SupabaseMeiTransactionService] getByCategory - Erro:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = data.map((item: any) => ({
        id: item.id,
        type: item.type,
        date: item.date,
        value: Number(item.value),
        description: item.description || '',
        categoryId: item.category_id || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      console.log(`[SupabaseMeiTransactionService] getByCategory - Retornando ${formattedData.length} transações da categoria ${categoryId}`);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('[SupabaseMeiTransactionService] getByCategory - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Obtém resumo financeiro por período
   * @param period Período (mês ou ano)
   */
  async getFinancialSummary(period: 'month' | 'year'): Promise<{
    receitas: number;
    despesas: number;
    saldo: number;
    transactions: Transaction[];
  }> {
    try {
      console.log(`[SupabaseMeiTransactionService] getFinancialSummary - Gerando resumo financeiro para ${period}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] getFinancialSummary - Usuário não autenticado');
        return { receitas: 0, despesas: 0, saldo: 0, transactions: [] };
      }
      
      // Calcular datas do período
      const today = new Date();
      let startDate: string;
      let endDate: string = today.toISOString().split('T')[0]; // Hoje
      
      if (period === 'month') {
        // Primeiro dia do mês atual
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      } else {
        // Primeiro dia do ano atual
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      }
      
      console.log(`[SupabaseMeiTransactionService] getFinancialSummary - Data atual: ${today.toISOString()}`);
      console.log(`[SupabaseMeiTransactionService] getFinancialSummary - Período de ${startDate} até ${endDate}`);
      
      // Buscar transações do período
      console.log(`[SupabaseMeiTransactionService] getFinancialSummary - Executando query para período...`);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      console.log(`[SupabaseMeiTransactionService] getFinancialSummary - Resultado da query:`);
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('- Transações encontradas no período:', data?.length || 0);
        
      if (error) {
        console.error('[SupabaseMeiTransactionService] getFinancialSummary - Erro:', error);
        return { receitas: 0, despesas: 0, saldo: 0, transactions: [] };
      }
      
      // Mapear os dados
      const transactions = data.map((item: any) => {
        console.log(`[SupabaseMeiTransactionService] getFinancialSummary - Processando transação:`, item);
        return {
          id: item.id,
          type: item.type,
          date: item.date,
          value: Number(item.value),
          description: item.description || '',
          categoryId: item.category_id || '',
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      });
      
      // Calcular totais
      let receitas = 0;
      let despesas = 0;
      
      transactions.forEach(transaction => {
        console.log(`[SupabaseMeiTransactionService] getFinancialSummary - Calculando: ${transaction.description} (${transaction.type}) = ${transaction.value}`);
        if (transaction.type === 'receita') {
          receitas += transaction.value;
        } else if (transaction.type === 'despesa') {
          despesas += transaction.value;
        }
      });
      
      const saldo = receitas - despesas;
      
      console.log(`[SupabaseMeiTransactionService] getFinancialSummary - Resumo: Receitas=${receitas}, Despesas=${despesas}, Saldo=${saldo}`);
      return { receitas, despesas, saldo, transactions };
    } catch (error) {
      console.error('[SupabaseMeiTransactionService] getFinancialSummary - Erro inesperado:', error);
      return { receitas: 0, despesas: 0, saldo: 0, transactions: [] };
    }
  }

  /**
   * Atualiza registros associados quando uma transação é modificada
   * @param currentTransaction Dados atuais da transação
   * @param updatedTransaction Dados atualizados da transação
   */
  private async updateAssociatedDAS(currentTransaction: any, updatedTransaction: any): Promise<void> {
    try {
      // Verificar se é uma transação de DAS (categoria "Impostos" e descrição contém "DAS")
      if (this.isDASTransaction(updatedTransaction)) {
        // Buscar DAS associado
        const { data: dasRecord, error: dasError } = await supabase
          .from('imposto_das')
          .select('*')
          .eq('transaction_id', updatedTransaction.id)
          .single();

        if (!dasError && dasRecord) {
          const updateData: any = {};

          // Atualizar valor se mudou
          if (currentTransaction.value !== updatedTransaction.value) {
            updateData.valor = updatedTransaction.value;
          }

          // Atualizar data de pagamento se mudou
          if (currentTransaction.date !== updatedTransaction.date) {
            updateData.data_pagamento = updatedTransaction.date;
          }

          // Se há mudanças, atualizar o DAS
          if (Object.keys(updateData).length > 0) {
            await supabase
              .from('imposto_das')
              .update(updateData)
              .eq('id', dasRecord.id);

            console.log(`[SupabaseMeiTransactionService] updateAssociatedDAS - DAS atualizado: ${dasRecord.id}`);
          }
        }
      }
      
      // Verificar se é uma transação de venda (tipo 'receita')
      else if (this.isSaleTransaction(updatedTransaction)) {
        // Buscar venda associada
        const { data: saleRecord, error: saleError } = await supabase
          .from('vendas')
          .select('*')
          .eq('transaction_id', updatedTransaction.id)
          .single();

        if (!saleError && saleRecord) {
          const updateSaleData: any = {};

          // Atualizar valor se mudou
          if (currentTransaction.value !== updatedTransaction.value) {
            updateSaleData.valor = updatedTransaction.value;
          }

          // Atualizar data se mudou
          if (currentTransaction.date !== updatedTransaction.date) {
            updateSaleData.data = updatedTransaction.date;
          }

          // Atualizar descrição se mudou
          if (currentTransaction.description !== updatedTransaction.description) {
            updateSaleData.descricao = updatedTransaction.description;
          }

          // Se há mudanças, atualizar a venda
          if (Object.keys(updateSaleData).length > 0) {
            await supabase
              .from('vendas')
              .update(updateSaleData)
              .eq('id', saleRecord.id);

            console.log(`[SupabaseMeiTransactionService] updateAssociatedDAS - Venda atualizada: ${saleRecord.id}`);
          }
        }
      }
    } catch (error) {
      console.error('[SupabaseMeiTransactionService] updateAssociatedDAS - Erro:', error);
    }
  }

  /**
   * Atualiza registros associados quando uma transação é deletada
   * @param deletedTransaction Dados da transação deletada
   */
  private async deleteAssociatedDAS(deletedTransaction: any): Promise<void> {
    try {
      console.log(`[SupabaseMeiTransactionService] deleteAssociatedDAS - Iniciando para transação:`, deletedTransaction);
      
      // Verificar se é uma transação de DAS
      const isDAS = this.isDASTransaction(deletedTransaction);
      console.log(`[SupabaseMeiTransactionService] deleteAssociatedDAS - É transação DAS: ${isDAS}`);
      
      if (isDAS) {
        console.log(`[SupabaseMeiTransactionService] deleteAssociatedDAS - Buscando DAS associado à transação ${deletedTransaction.id}`);
        
        // Buscar DAS associado
        const { data: dasRecord, error: dasError } = await supabase
          .from('imposto_das')
          .select('*')
          .eq('transaction_id', deletedTransaction.id)
          .single();

        console.log(`[SupabaseMeiTransactionService] deleteAssociatedDAS - Resultado da busca DAS:`, { dasRecord, dasError });

        if (!dasError && dasRecord) {
          console.log(`[SupabaseMeiTransactionService] deleteAssociatedDAS - Deletando DAS ${dasRecord.id}`);
          
          // Deletar completamente o registro de DAS
          const { error: deleteError } = await supabase
            .from('imposto_das')
            .delete()
            .eq('id', dasRecord.id);

          if (deleteError) {
            console.error(`[SupabaseMeiTransactionService] deleteAssociatedDAS - Erro ao deletar DAS:`, deleteError);
          } else {
            console.log(`[SupabaseMeiTransactionService] deleteAssociatedDAS - DAS deletado completamente: ${dasRecord.id}`);
          }
        } else if (dasError) {
          console.log(`[SupabaseMeiTransactionService] deleteAssociatedDAS - Nenhum DAS encontrado ou erro:`, dasError);
        }
      }
      
      // Verificar se é uma transação de venda
      else if (this.isSaleTransaction(deletedTransaction)) {
        // Buscar venda associada
        const { data: saleRecord, error: saleError } = await supabase
          .from('vendas')
          .select('*')
          .eq('transaction_id', deletedTransaction.id)
          .single();

        if (!saleError && saleRecord) {
          // Deletar completamente o registro de venda
          await supabase
            .from('vendas')
            .delete()
            .eq('id', saleRecord.id);

          console.log(`[SupabaseMeiTransactionService] deleteAssociatedDAS - Venda deletada completamente: ${saleRecord.id}`);
        }
      }
    } catch (error) {
      console.error('[SupabaseMeiTransactionService] deleteAssociatedDAS - Erro:', error);
    }
  }

  /**
   * Verifica se uma transação é relacionada ao DAS
   * @param transaction Dados da transação
   */
  private isDASTransaction(transaction: any): boolean {
    return transaction.type === 'despesa' && 
           transaction.description && 
           transaction.description.includes('DAS');
  }

  /**
   * Verifica se uma transação é relacionada a uma venda
   * @param transaction Dados da transação
   */
  private isSaleTransaction(transaction: any): boolean {
    return transaction.type === 'receita';
  }
}