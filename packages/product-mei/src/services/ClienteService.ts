import { supabase } from '../../../core/src/lib/supabase';
import { getCurrentUserId } from '../../../core/src/lib/supabase';

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
export class ClienteService {
  /**
   * Busca todos os clientes do usuário atual
   */
  static async getAll(): Promise<Cliente[]> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', userId)
        .order('nome');
        
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        return [];
      }
      
      return data as Cliente[];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  }
  
  /**
   * Busca um cliente pelo ID
   * @param id ID do cliente
   */
  static async getById(id: string): Promise<Cliente | null> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar cliente:', error);
        return null;
      }
      
      return data as Cliente;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  }
  
  /**
   * Cria um novo cliente
   * @param cliente Dados do cliente
   */
  static async create(cliente: CreateClienteDTO): Promise<Cliente | null> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Formatar a data atual para o formato YYYY-MM-DD
      const dataCadastro = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          ...cliente,
          user_id: userId,
          data_cadastro: dataCadastro,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao criar cliente:', error);
        return null;
      }
      
      return data as Cliente;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return null;
    }
  }
  
  /**
   * Atualiza um cliente existente
   * @param id ID do cliente
   * @param cliente Dados para atualização
   */
  static async update(id: string, cliente: UpdateClienteDTO): Promise<Cliente | null> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('clientes')
        .update(cliente)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        return null;
      }
      
      return data as Cliente;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return null;
    }
  }
  
  /**
   * Remove um cliente
   * @param id ID do cliente
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao excluir cliente:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      return false;
    }
  }
  
  /**
   * Busca clientes por nome (pesquisa parcial)
   * @param nome Nome para pesquisa
   */
  static async searchByName(nome: string): Promise<Cliente[]> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', userId)
        .ilike('nome', `%${nome}%`)
        .order('nome');
        
      if (error) {
        console.error('Erro ao buscar clientes por nome:', error);
        return [];
      }
      
      return data as Cliente[];
    } catch (error) {
      console.error('Erro ao buscar clientes por nome:', error);
      return [];
    }
  }
} 