import { supabase, getCurrentUserId } from '../supabase';
import { DIContainer, TRANSACTION_SERVICE, TransactionService } from '../core-exports';

/**
 * Interface para representar uma venda
 */
export interface Venda {
  id: string;
  user_id: string;
  cliente_id?: string;
  cliente_nome?: string;
  data: string;
  descricao: string;
  valor: number;
  forma_pagamento: string;
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
}

/**
 * Interface para atualizar uma venda existente
 */
export interface UpdateVendaDTO {
  id?: string; // ID da venda (UUID)
  cliente_id?: string;
  cliente_nome?: string;
  data?: string;
  descricao?: string;
  valor?: number;
  forma_pagamento?: string;
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
      
      // Verificar se o ID da venda é um UUID válido
      const isValidVendaId = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (!isValidVendaId) {
        console.error(`[SupabaseMeiVendaService] getById - ID da venda não é um UUID válido: ${id}`);
        // Tentar converter ID numérico para UUID
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          const { getUuidFromNumericId } = await import('../utils/uuidUtils');
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            id = uuid;
            console.log(`[SupabaseMeiVendaService] getById - Convertendo ID numérico ${numericId} para UUID ${id}`);
          } else {
            console.error(`[SupabaseMeiVendaService] getById - Não foi possível encontrar UUID para o ID ${numericId}`);
            return { 
              data: null, 
              error: new Error(`ID da venda inválido: ${numericId} não é um UUID válido`) 
            };
          }
        } else {
          return { 
            data: null, 
            error: new Error(`ID da venda inválido: ${id} não é um UUID válido`) 
          };
        }
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
      
      // Verificar se o cliente_id é um UUID válido, se fornecido
      let clienteId: string | null = null;
      if (venda.cliente_id) {
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(venda.cliente_id);
        
        if (!isValidUuid) {
          console.error(`[SupabaseMeiVendaService] create - ID do cliente não é um UUID válido: ${venda.cliente_id}`);
          // Tentar converter ID numérico para UUID
          const numericId = parseInt(venda.cliente_id);
          if (!isNaN(numericId)) {
            const { getUuidFromNumericId } = await import('../utils/uuidUtils');
            const uuid = getUuidFromNumericId(numericId);
            if (uuid) {
              clienteId = uuid;
              console.log(`[SupabaseMeiVendaService] create - Convertendo ID numérico ${venda.cliente_id} para UUID ${clienteId}`);
            } else {
              console.error(`[SupabaseMeiVendaService] create - Não foi possível encontrar UUID para o ID ${venda.cliente_id}`);
              return { 
                data: null, 
                error: new Error(`ID do cliente inválido: ${venda.cliente_id} não é um UUID válido`) 
              };
            }
          } else {
            // Em vez de causar erro, definir como nulo
            console.log('[SupabaseMeiVendaService] create - Definindo ID do cliente como nulo');
          }
        } else {
          clienteId = venda.cliente_id;
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
        cliente_id: clienteId,
        data: venda.data,
        descricao: venda.descricao,
        valor: venda.valor,
        forma_pagamento: venda.forma_pagamento,
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
      
      // Verificar se o ID da venda é um UUID válido
      const isValidVendaId = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (!isValidVendaId) {
        console.error(`[SupabaseMeiVendaService] update - ID da venda não é um UUID válido: ${id}`);
        // Tentar converter ID numérico para UUID
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          const { getUuidFromNumericId } = await import('../utils/uuidUtils');
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            id = uuid;
            console.log(`[SupabaseMeiVendaService] update - Convertendo ID numérico ${numericId} para UUID ${id}`);
          } else {
            console.error(`[SupabaseMeiVendaService] update - Não foi possível encontrar UUID para o ID ${numericId}`);
            return { 
              data: null, 
              error: new Error(`ID da venda inválido: ${numericId} não é um UUID válido`) 
            };
          }
        } else {
          return { 
            data: null, 
            error: new Error(`ID da venda inválido: ${id} não é um UUID válido`) 
          };
        }
      }
      
      // Verificar se o cliente_id é um UUID válido, se fornecido
      let clienteIdValidado: string | null | undefined = undefined;
      if (venda.cliente_id !== undefined) {
        if (venda.cliente_id === null || venda.cliente_id === '') {
          clienteIdValidado = null;
        } else {
          const isValidClienteId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(venda.cliente_id);
          
          if (!isValidClienteId) {
            console.error(`[SupabaseMeiVendaService] update - ID do cliente não é um UUID válido: ${venda.cliente_id}`);
            // Tentar converter ID numérico para UUID
            const numericId = parseInt(venda.cliente_id);
            if (!isNaN(numericId)) {
              const { getUuidFromNumericId } = await import('../utils/uuidUtils');
              const uuid = getUuidFromNumericId(numericId);
              if (uuid) {
                clienteIdValidado = uuid;
                console.log(`[SupabaseMeiVendaService] update - Convertendo ID numérico do cliente ${venda.cliente_id} para UUID ${clienteIdValidado}`);
              } else {
                console.error(`[SupabaseMeiVendaService] update - Não foi possível encontrar UUID para o ID do cliente ${venda.cliente_id}`);
                return { 
                  data: null, 
                  error: new Error(`ID do cliente inválido: ${venda.cliente_id} não é um UUID válido`) 
                };
              }
            } else {
              // Em vez de causar erro, definir como nulo
              clienteIdValidado = null;
              console.log('[SupabaseMeiVendaService] update - Definindo ID do cliente como nulo');
            }
          } else {
            clienteIdValidado = venda.cliente_id;
          }
        }
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
      if (clienteIdValidado !== undefined) updateData.cliente_id = clienteIdValidado;
      if (venda.data !== undefined) updateData.data = venda.data;
      if (venda.descricao !== undefined) updateData.descricao = venda.descricao;
      if (venda.valor !== undefined) updateData.valor = venda.valor;
      if (venda.forma_pagamento !== undefined) updateData.forma_pagamento = venda.forma_pagamento;
      
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
      
      // Verificar se o ID da venda é um UUID válido
      const isValidVendaId = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (!isValidVendaId) {
        console.error(`[SupabaseMeiVendaService] delete - ID da venda não é um UUID válido: ${id}`);
        // Tentar converter ID numérico para UUID
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          const { getUuidFromNumericId } = await import('../utils/uuidUtils');
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            id = uuid;
            console.log(`[SupabaseMeiVendaService] delete - Convertendo ID numérico ${numericId} para UUID ${id}`);
          } else {
            console.error(`[SupabaseMeiVendaService] delete - Não foi possível encontrar UUID para o ID ${numericId}`);
            return { 
              success: false, 
              error: new Error(`ID da venda inválido: ${numericId} não é um UUID válido`) 
            };
          }
        } else {
          return { 
            success: false, 
            error: new Error(`ID da venda inválido: ${id} não é um UUID válido`) 
          };
        }
      }
      
      // Buscar a venda para obter o ID da transação associada
      const { data: venda, error: getError } = await supabase
        .from('vendas')
        .select('transaction_id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (getError) {
        console.error('[SupabaseMeiVendaService] delete - Erro ao buscar venda:', getError);
        // Se a venda não for encontrada, considera-se que já foi excluída
        if (getError.code === 'PGRST116') {
          console.log('[SupabaseMeiVendaService] delete - Venda não encontrada, considerando como já excluída');
          return { success: true, error: null };
        }
        return { success: false, error: new Error(getError.message) };
      }
      
      // Excluir a venda
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error('[SupabaseMeiVendaService] delete - Erro ao excluir venda:', error);
        return { success: false, error: new Error(error.message) };
      }
      
      // Excluir a transação associada, se existir
      if (venda && venda.transaction_id) {
        const transactionService = DIContainer.get<TransactionService>(TRANSACTION_SERVICE);
        const { success, error: deleteError } = await transactionService.delete(venda.transaction_id);
        
        if (deleteError) {
          console.error('[SupabaseMeiVendaService] delete - Erro ao excluir transação associada:', deleteError);
          // Não falhar a operação principal caso a exclusão da transação falhe
        } else if (success) {
          console.log('[SupabaseMeiVendaService] delete - Transação associada excluída com sucesso');
        }
      }
      
      console.log('[SupabaseMeiVendaService] delete - Venda excluída com sucesso');
      return { success: true, error: null };
    } catch (error) {
      console.error('[SupabaseMeiVendaService] delete - Erro inesperado:', error);
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