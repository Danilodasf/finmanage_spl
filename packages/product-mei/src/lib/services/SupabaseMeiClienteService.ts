import { supabase, getCurrentUserId } from '../supabase';

/**
 * Interface para representar um cliente
 */
export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf_cnpj: string | null;
  endereco: string | null;
  observacoes: string | null;
  data_cadastro: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para criar um novo cliente
 */
export interface CreateClienteDTO {
  nome: string;
  email?: string;
  telefone?: string;
  cpf_cnpj?: string;
  endereco?: string;
  observacoes?: string;
}

/**
 * Interface para atualizar um cliente existente
 */
export interface UpdateClienteDTO {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf_cnpj?: string;
  endereco?: string;
  observacoes?: string;
}

/**
 * Implementação do serviço de clientes usando Supabase
 */
export class SupabaseMeiClienteService {
  /**
   * Busca todos os clientes do usuário atual
   */
  async getAll(): Promise<{ data: Cliente[] | null; error: Error | null }> {
    try {
      console.log('[SupabaseMeiClienteService] getAll - Iniciando...');
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiClienteService] getAll - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', userId)
        .order('nome');
        
      if (error) {
        console.error('[SupabaseMeiClienteService] getAll - Erro:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      console.log(`[SupabaseMeiClienteService] getAll - Retornando ${data.length} clientes`);
      return { data, error: null };
    } catch (error) {
      console.error('[SupabaseMeiClienteService] getAll - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Busca um cliente pelo ID
   * @param id ID do cliente
   */
  async getById(id: string): Promise<{ data: Cliente | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiClienteService] getById - Buscando cliente com ID ${id}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiClienteService] getById - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error(`[SupabaseMeiClienteService] getById - Erro ao buscar cliente ${id}:`, error);
        return { data: null, error: new Error(error.message) };
      }
      
      console.log(`[SupabaseMeiClienteService] getById - Cliente ${id} encontrado`);
      return { data, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiClienteService] getById - Erro inesperado ao buscar cliente ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Cria um novo cliente
   * @param cliente Dados do cliente
   */
  async create(cliente: CreateClienteDTO): Promise<{ data: Cliente | null; error: Error | null }> {
    try {
      console.log('[SupabaseMeiClienteService] create - Iniciando criação de cliente:', cliente);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiClienteService] create - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Formatar a data atual para o formato YYYY-MM-DD
      const dataCadastro = new Date().toISOString().split('T')[0];
      
      const clienteToInsert = {
        ...cliente,
        user_id: userId,
        data_cadastro: dataCadastro,
      };
      
      console.log('[SupabaseMeiClienteService] create - Inserindo:', clienteToInsert);
      
      const { data, error } = await supabase
        .from('clientes')
        .insert(clienteToInsert)
        .select()
        .single();
        
      if (error) {
        console.error('[SupabaseMeiClienteService] create - Erro Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { data: null, error: new Error(error.message) };
      }
      
      console.log('[SupabaseMeiClienteService] create - Cliente criado com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('[SupabaseMeiClienteService] create - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Atualiza um cliente existente
   * @param id ID do cliente
   * @param cliente Dados para atualização
   */
  async update(id: string, cliente: UpdateClienteDTO): Promise<{ data: Cliente | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiClienteService] update - Atualizando cliente ${id}:`, cliente);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiClienteService] update - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('clientes')
        .update(cliente)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('[SupabaseMeiClienteService] update - Erro Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { data: null, error: new Error(error.message) };
      }
      
      console.log(`[SupabaseMeiClienteService] update - Cliente ${id} atualizado com sucesso:`, data);
      return { data, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiClienteService] update - Erro inesperado ao atualizar cliente ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Remove um cliente
   * @param id ID do cliente
   */
  async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiClienteService] delete - Removendo cliente ${id}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiClienteService] delete - Usuário não autenticado');
        return { success: false, error: new Error('Usuário não autenticado') };
      }
      
      // Verificar se o cliente tem vendas associadas
      const { data: vendasAssociadas, error: vendasError } = await supabase
        .from('vendas')
        .select('id')
        .eq('cliente_id', id)
        .eq('user_id', userId)
        .limit(1);
        
      if (vendasError) {
        console.error(`[SupabaseMeiClienteService] delete - Erro ao verificar vendas associadas:`, vendasError);
      } else if (vendasAssociadas && vendasAssociadas.length > 0) {
        console.error(`[SupabaseMeiClienteService] delete - Cliente possui vendas associadas`);
        return { 
          success: false, 
          error: new Error('Não é possível excluir o cliente pois existem vendas associadas a ele') 
        };
      }
      
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error(`[SupabaseMeiClienteService] delete - Erro ao excluir cliente ${id}:`, error);
        return { success: false, error: new Error(error.message) };
      }
      
      console.log(`[SupabaseMeiClienteService] delete - Cliente ${id} removido com sucesso`);
      return { success: true, error: null };
    } catch (error) {
      console.error(`[SupabaseMeiClienteService] delete - Erro inesperado ao excluir cliente ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  /**
   * Busca clientes por nome (pesquisa parcial)
   * @param nome Nome para pesquisa
   */
  async searchByName(nome: string): Promise<{ data: Cliente[] | null; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiClienteService] searchByName - Buscando clientes com nome contendo "${nome}"`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiClienteService] searchByName - Usuário não autenticado');
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', userId)
        .ilike('nome', `%${nome}%`)
        .order('nome');
        
      if (error) {
        console.error('[SupabaseMeiClienteService] searchByName - Erro:', error);
        return { data: null, error: new Error(error.message) };
      }
      
      console.log(`[SupabaseMeiClienteService] searchByName - Retornando ${data.length} clientes`);
      return { data, error: null };
    } catch (error) {
      console.error('[SupabaseMeiClienteService] searchByName - Erro inesperado:', error);
      return { data: null, error: error as Error };
    }
  }
  
  /**
   * Verifica se o CPF/CNPJ já está em uso por outro cliente
   * @param cpfCnpj CPF/CNPJ para verificar
   * @param clienteId ID do cliente atual (opcional, para exclusão na verificação de edição)
   */
  async checkCpfCnpjExists(cpfCnpj: string, clienteId?: string): Promise<{ exists: boolean; error: Error | null }> {
    try {
      console.log(`[SupabaseMeiClienteService] checkCpfCnpjExists - Verificando CPF/CNPJ: ${cpfCnpj}`);
      const userId = await getCurrentUserId();
      
      if (!userId) {
        console.error('[SupabaseMeiClienteService] checkCpfCnpjExists - Usuário não autenticado');
        return { exists: false, error: new Error('Usuário não autenticado') };
      }
      
      let query = supabase
        .from('clientes')
        .select('id')
        .eq('user_id', userId)
        .eq('cpf_cnpj', cpfCnpj);
        
      // Se for edição, excluir o próprio cliente da consulta
      if (clienteId) {
        query = query.neq('id', clienteId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[SupabaseMeiClienteService] checkCpfCnpjExists - Erro:', error);
        return { exists: false, error: new Error(error.message) };
      }
      
      const exists = data.length > 0;
      console.log(`[SupabaseMeiClienteService] checkCpfCnpjExists - CPF/CNPJ ${exists ? 'já existe' : 'disponível'}`);
      
      return { exists, error: null };
    } catch (error) {
      console.error('[SupabaseMeiClienteService] checkCpfCnpjExists - Erro inesperado:', error);
      return { exists: false, error: error as Error };
    }
  }
} 