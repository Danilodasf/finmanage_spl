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
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] getAll - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('[SupabaseMeiTransactionService] getAll - Erro:', error);
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
   * @param entity Dados para atualização
   */
  async update(id: string, entity: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiTransactionService] update - Atualizando transação ${id}:`, entity);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiTransactionService] update - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Preparar dados para atualização
      const updateData: any = {};
      if (entity.type !== undefined) updateData.type = entity.type;
      if (entity.date !== undefined) updateData.date = entity.date;
      if (entity.value !== undefined) updateData.value = entity.value;
      if (entity.description !== undefined) updateData.description = entity.description;
      if (entity.categoryId !== undefined) updateData.category_id = entity.categoryId;
      
      console.log('[SupabaseMeiTransactionService] update - Dados para atualização:', updateData);
      
      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('[SupabaseMeiTransactionService] update - Erro Supabase:', {
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
      
      console.log(`[SupabaseMeiTransactionService] update - Transação ${id} atualizada com sucesso:`, formattedData);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiTransactionService] update - Erro inesperado ao atualizar transação ${id}:`, error);
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
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error(`[SupabaseMeiTransactionService] delete - Erro ao excluir transação ${id}:`, error);
        return { success: false, error: new Error(error.message) };
      }
      
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
      
      console.log(`[SupabaseMeiTransactionService] getFinancialSummary - Período de ${startDate} até ${endDate}`);
      
      // Buscar transações do período
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('[SupabaseMeiTransactionService] getFinancialSummary - Erro:', error);
        return { receitas: 0, despesas: 0, saldo: 0, transactions: [] };
      }
      
      // Mapear os dados
      const transactions = data.map((item: any) => ({
        id: item.id,
        type: item.type,
        date: item.date,
        value: Number(item.value),
        description: item.description || '',
        categoryId: item.category_id || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      // Calcular totais
      let receitas = 0;
      let despesas = 0;
      
      transactions.forEach(transaction => {
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
} 