import { supabase, getCurrentUserId } from '../supabase';
import { DIContainer, TRANSACTION_SERVICE, TransactionService } from '../core-exports';

/**
 * Interface para representar uma venda
 */
export interface Venda {
  id: string;
  user_id: string;
  cliente_id: string | null;
  cliente_nome?: string;
  data: string;
  descricao: string;
  valor: number;
  forma_pagamento: string;
  comprovante_url: string | null;
  transaction_id: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para criar uma nova venda
 */
export interface CreateVendaDTO {
  cliente_id?: string;
  cliente_nome?: string;
  data: string;
  descricao: string;
  valor: number;
  forma_pagamento: string;
  comprovante?: File;
}

/**
 * Interface para atualizar uma venda existente
 */
export interface UpdateVendaDTO {
  cliente_id?: string;
  cliente_nome?: string;
  data?: string;
  descricao?: string;
  valor?: number;
  forma_pagamento?: string;
  comprovante?: File;
}

/**
 * Implementação do serviço de vendas usando Supabase
 */
export class SupabaseMeiVendaService {
  /**
   * Busca todas as vendas do usuário atual
   */
  async getAll(): Promise<{ data: Venda[] | null; error: Error | null }> {
    try {
      console.log('[SupabaseMeiVendaService] getAll - Iniciando...');
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiVendaService] getAll - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('vendas')
        .select('*, clientes(nome)')
        .eq('user_id', userId)
        .order('data', { ascending: false });
        
      if (error) {
        console.error('[SupabaseMeiVendaService] getAll - Erro:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        cliente_id: item.cliente_id,
        cliente_nome: item.clientes?.nome || 'Cliente não identificado',
        data: item.data,
        descricao: item.descricao,
        valor: Number(item.valor),
        forma_pagamento: item.forma_pagamento,
        comprovante_url: item.comprovante_url,
        transaction_id: item.transaction_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      console.log(`[SupabaseMeiVendaService] getAll - Retornando ${formattedData.length} vendas`);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('[SupabaseMeiVendaService] getAll - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca uma venda pelo ID
   * @param id ID da venda
   */
  async getById(id: string): Promise<{ data: Venda | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiVendaService] getById - Buscando venda com ID ${id}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiVendaService] getById - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('vendas')
        .select('*, clientes(nome)')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error(`[SupabaseMeiVendaService] getById - Erro ao buscar venda ${id}:`, error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = {
        id: data.id,
        user_id: data.user_id,
        cliente_id: data.cliente_id,
        cliente_nome: data.clientes?.nome || 'Cliente não identificado',
        data: data.data,
        descricao: data.descricao,
        valor: Number(data.valor),
        forma_pagamento: data.forma_pagamento,
        comprovante_url: data.comprovante_url,
        transaction_id: data.transaction_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      console.log(`[SupabaseMeiVendaService] getById - Venda ${id} encontrada`);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiVendaService] getById - Erro inesperado ao buscar venda ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Cria uma nova venda
   * @param venda Dados da venda
   */
  async create(venda: CreateVendaDTO): Promise<{ data: Venda | null; error: Error | null }> {
    try {
      console.log('[SupabaseMeiVendaService] create - Iniciando criação de venda:', venda);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiVendaService] create - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Processar o upload do comprovante, se houver
      let comprovanteUrl: string | null = null;
      if (venda.comprovante) {
        const fileName = `${Date.now()}_${venda.comprovante.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('vendas_comprovantes')
          .upload(`${userId}/${fileName}`, venda.comprovante);
          
        if (uploadError) {
          console.error('[SupabaseMeiVendaService] create - Erro ao fazer upload do comprovante:', uploadError);
        } else if (uploadData) {
          // Obter a URL pública do arquivo
          const { data: urlData } = supabase.storage
            .from('vendas_comprovantes')
            .getPublicUrl(`${userId}/${fileName}`);
            
          comprovanteUrl = urlData.publicUrl;
        }
      }
      
      // Criar a transação correspondente à venda
      const transactionService = DIContainer.get<TransactionService>(TRANSACTION_SERVICE);
      const { data: transaction } = await transactionService.create({
        type: 'receita',
        categoryId: '', // Buscar a categoria "Vendas" ou criar uma
        description: venda.descricao,
        value: venda.valor,
        date: venda.data
      });
      
      // Inserir a venda no banco de dados
      const vendaToInsert = {
        user_id: userId,
        cliente_id: venda.cliente_id || null,
        data: venda.data,
        descricao: venda.descricao,
        valor: venda.valor,
        forma_pagamento: venda.forma_pagamento,
        comprovante_url: comprovanteUrl,
        transaction_id: transaction?.id || null
      };
      
      console.log('[SupabaseMeiVendaService] create - Inserindo:', vendaToInsert);
      
      const { data, error } = await supabase
        .from('vendas')
        .insert(vendaToInsert)
        .select()
        .single();
        
      if (error) {
        console.error('[SupabaseMeiVendaService] create - Erro Supabase:', {
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
        user_id: data.user_id,
        cliente_id: data.cliente_id,
        cliente_nome: venda.cliente_nome || 'Cliente não identificado',
        data: data.data,
        descricao: data.descricao,
        valor: Number(data.valor),
        forma_pagamento: data.forma_pagamento,
        comprovante_url: data.comprovante_url,
        transaction_id: data.transaction_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      console.log('[SupabaseMeiVendaService] create - Venda criada com sucesso:', formattedData);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('[SupabaseMeiVendaService] create - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Atualiza uma venda existente
   * @param id ID da venda
   * @param venda Dados para atualização
   */
  async update(id: string, venda: UpdateVendaDTO): Promise<{ data: Venda | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiVendaService] update - Atualizando venda ${id}:`, venda);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiVendaService] update - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Buscar a venda existente para obter o ID da transação
      const { data: vendaExistente, error: getError } = await supabase
        .from('vendas')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (getError || !vendaExistente) {
        console.error('[SupabaseMeiVendaService] update - Erro ao buscar venda existente:', getError);
        return { data: null, error: new Error(getError?.message || 'Venda não encontrada') };
      }
      
      // Processar o upload do comprovante, se houver
      let comprovanteUrl: string | null = vendaExistente.comprovante_url;
      if (venda.comprovante) {
        const fileName = `${Date.now()}_${venda.comprovante.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('vendas_comprovantes')
          .upload(`${userId}/${fileName}`, venda.comprovante);
          
        if (uploadError) {
          console.error('[SupabaseMeiVendaService] update - Erro ao fazer upload do comprovante:', uploadError);
        } else if (uploadData) {
          // Obter a URL pública do arquivo
          const { data: urlData } = supabase.storage
            .from('vendas_comprovantes')
            .getPublicUrl(`${userId}/${fileName}`);
            
          comprovanteUrl = urlData.publicUrl;
        }
      }
      
      // Atualizar a transação correspondente, se existir
      if (vendaExistente.transaction_id) {
        const transactionService = DIContainer.get<TransactionService>(TRANSACTION_SERVICE);
        await transactionService.update(vendaExistente.transaction_id, {
          description: venda.descricao,
          value: venda.valor,
          date: venda.data
        });
      }
      
      // Preparar dados para atualização
      const updateData: any = {};
      if (venda.cliente_id !== undefined) updateData.cliente_id = venda.cliente_id;
      if (venda.data !== undefined) updateData.data = venda.data;
      if (venda.descricao !== undefined) updateData.descricao = venda.descricao;
      if (venda.valor !== undefined) updateData.valor = venda.valor;
      if (venda.forma_pagamento !== undefined) updateData.forma_pagamento = venda.forma_pagamento;
      if (comprovanteUrl !== vendaExistente.comprovante_url) updateData.comprovante_url = comprovanteUrl;
      
      console.log('[SupabaseMeiVendaService] update - Dados para atualização:', updateData);
      
      const { data, error } = await supabase
        .from('vendas')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('[SupabaseMeiVendaService] update - Erro Supabase:', {
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
        user_id: data.user_id,
        cliente_id: data.cliente_id,
        cliente_nome: venda.cliente_nome || 'Cliente não identificado',
        data: data.data,
        descricao: data.descricao,
        valor: Number(data.valor),
        forma_pagamento: data.forma_pagamento,
        comprovante_url: data.comprovante_url,
        transaction_id: data.transaction_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      console.log(`[SupabaseMeiVendaService] update - Venda ${id} atualizada com sucesso:`, formattedData);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiVendaService] update - Erro inesperado ao atualizar venda ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Remove uma venda
   * @param id ID da venda
   */
  async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiVendaService] delete - Removendo venda ${id}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiVendaService] delete - Usuário não autenticado');
        return { success: false, error: new Error('Usuário não autenticado') };
      }
      
      // Buscar a venda para obter o ID da transação antes de excluí-la
      const { data: venda, error: getError } = await supabase
        .from('vendas')
        .select('transaction_id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (getError) {
        console.error(`[SupabaseMeiVendaService] delete - Erro ao buscar venda ${id}:`, getError);
        return { success: false, error: new Error(getError.message) };
      }
      
      // Excluir a transação associada, se existir
      if (venda?.transaction_id) {
        const transactionService = DIContainer.get<TransactionService>(TRANSACTION_SERVICE);
        await transactionService.delete(venda.transaction_id);
      }
      
      // Excluir a venda
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error(`[SupabaseMeiVendaService] delete - Erro ao excluir venda ${id}:`, error);
        return { success: false, error: new Error(error.message) };
      }
      
      console.log(`[SupabaseMeiVendaService] delete - Venda ${id} removida com sucesso`);
      return { success: true, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiVendaService] delete - Erro inesperado ao excluir venda ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  /**
   * Busca vendas filtradas por cliente, período e forma de pagamento
   * @param filters Filtros a serem aplicados
   */
  async getFiltered(filters: {
    cliente_id?: string;
    startDate?: string;
    endDate?: string;
    forma_pagamento?: string;
  }): Promise<{ data: Venda[] | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiVendaService] getFiltered - Buscando vendas com filtros:`, filters);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiVendaService] getFiltered - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      let query = supabase
        .from('vendas')
        .select('*, clientes(nome)')
        .eq('user_id', userId);
      
      // Aplicar filtros
      if (filters.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id);
      }
      
      if (filters.startDate) {
        query = query.gte('data', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('data', filters.endDate);
      }
      
      if (filters.forma_pagamento) {
        query = query.eq('forma_pagamento', filters.forma_pagamento);
      }
      
      // Ordenar por data
      query = query.order('data', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[SupabaseMeiVendaService] getFiltered - Erro:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      // Mapear os dados para o formato esperado
      const formattedData = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        cliente_id: item.cliente_id,
        cliente_nome: item.clientes?.nome || 'Cliente não identificado',
        data: item.data,
        descricao: item.descricao,
        valor: Number(item.valor),
        forma_pagamento: item.forma_pagamento,
        comprovante_url: item.comprovante_url,
        transaction_id: item.transaction_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      console.log(`[SupabaseMeiVendaService] getFiltered - Retornando ${formattedData.length} vendas`);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('[SupabaseMeiVendaService] getFiltered - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Calcula o total de vendas em um período
   * @param startDate Data inicial
   * @param endDate Data final
   */
  async getTotalVendas(startDate?: string, endDate?: string): Promise<{ total: number; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiVendaService] getTotalVendas - Calculando total entre ${startDate || 'início'} e ${endDate || 'fim'}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiVendaService] getTotalVendas - Usuário não autenticado');
        return { total: 0, error: new Error('Usuário não autenticado') };
      }
      
      let query = supabase
        .from('vendas')
        .select('valor')
        .eq('user_id', userId);
      
      if (startDate) {
        query = query.gte('data', startDate);
      }
      
      if (endDate) {
        query = query.lte('data', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[SupabaseMeiVendaService] getTotalVendas - Erro:', error);
        return { total: 0, error: new Error(error.message) };
      }
      
      // Calcular soma dos valores
      const total = data.reduce((sum: number, item: any) => sum + Number(item.valor), 0);
      
      console.log(`[SupabaseMeiVendaService] getTotalVendas - Total calculado: ${total}`);
      return { total, error: null };
    } catch (error) {
      console.error('[SupabaseMeiVendaService] getTotalVendas - Erro inesperado:', error);
      return { total: 0, error: error as Error };
    }
  }
} 