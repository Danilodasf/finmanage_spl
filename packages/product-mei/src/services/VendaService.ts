import { supabase } from '../../../core/src/lib/supabase';
import { getCurrentUserId } from '../../../core/src/lib/supabase';
import { TransactionService } from '../../../core/src/lib/services/transaction';

/**
 * Interface para representar uma venda
 */
export interface Venda {
  id: string;
  user_id: string;
  cliente_id: string | null;
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
  data?: string;
  descricao?: string;
  valor?: number;
  forma_pagamento?: string;
  comprovante?: File;
}

/**
 * Implementação do serviço de vendas usando Supabase
 */
export class VendaService {
  /**
   * Busca todas as vendas do usuário atual
   */
  static async getAll(): Promise<Venda[]> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false });
        
      if (error) {
        console.error('Erro ao buscar vendas:', error);
        return [];
      }
      
      return data as Venda[];
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      return [];
    }
  }
  
  /**
   * Busca uma venda pelo ID
   * @param id ID da venda
   */
  static async getById(id: string): Promise<Venda | null> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar venda:', error);
        return null;
      }
      
      return data as Venda;
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      return null;
    }
  }
  
  /**
   * Cria uma nova venda
   * @param venda Dados da venda
   */
  static async create(venda: CreateVendaDTO): Promise<Venda | null> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Processar o upload do comprovante, se houver
      let comprovanteUrl = null;
      if (venda.comprovante) {
        const fileName = `${Date.now()}_${venda.comprovante.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('vendas_comprovantes')
          .upload(`${userId}/${fileName}`, venda.comprovante);
          
        if (uploadError) {
          console.error('Erro ao fazer upload do comprovante:', uploadError);
        } else if (uploadData) {
          // Obter a URL pública do arquivo
          const { data: urlData } = supabase.storage
            .from('vendas_comprovantes')
            .getPublicUrl(`${userId}/${fileName}`);
            
          comprovanteUrl = urlData.publicUrl;
        }
      }
      
      // Criar a transação correspondente à venda
      const transaction = await TransactionService.create({
        type: 'receita',
        category_id: '', // Buscar a categoria "Vendas" ou criar
        description: venda.descricao,
        value: venda.valor,
        date: venda.data,
        payment_method: venda.forma_pagamento,
      });
      
      // Inserir a venda no banco de dados
      const { data, error } = await supabase
        .from('vendas')
        .insert({
          user_id: userId,
          cliente_id: venda.cliente_id || null,
          data: venda.data,
          descricao: venda.descricao,
          valor: venda.valor,
          forma_pagamento: venda.forma_pagamento,
          comprovante_url: comprovanteUrl,
          transaction_id: transaction?.id || null,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao criar venda:', error);
        return null;
      }
      
      return data as Venda;
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      return null;
    }
  }
  
  /**
   * Atualiza uma venda existente
   * @param id ID da venda
   * @param venda Dados para atualização
   */
  static async update(id: string, venda: UpdateVendaDTO): Promise<Venda | null> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar a venda existente para obter o ID da transação
      const { data: vendaExistente, error: getError } = await supabase
        .from('vendas')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (getError || !vendaExistente) {
        console.error('Erro ao buscar venda existente:', getError);
        return null;
      }
      
      // Processar o upload do comprovante, se houver
      let comprovanteUrl = vendaExistente.comprovante_url;
      if (venda.comprovante) {
        const fileName = `${Date.now()}_${venda.comprovante.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('vendas_comprovantes')
          .upload(`${userId}/${fileName}`, venda.comprovante);
          
        if (uploadError) {
          console.error('Erro ao fazer upload do comprovante:', uploadError);
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
        await TransactionService.update(vendaExistente.transaction_id, {
          description: venda.descricao,
          value: venda.valor,
          date: venda.data,
          payment_method: venda.forma_pagamento,
        });
      }
      
      // Atualizar a venda
      const { data, error } = await supabase
        .from('vendas')
        .update({
          cliente_id: venda.cliente_id || null,
          data: venda.data,
          descricao: venda.descricao,
          valor: venda.valor,
          forma_pagamento: venda.forma_pagamento,
          comprovante_url: comprovanteUrl,
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar venda:', error);
        return null;
      }
      
      return data as Venda;
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      return null;
    }
  }
  
  /**
   * Remove uma venda
   * @param id ID da venda
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar a venda para obter o ID da transação
      const { data: venda, error: getError } = await supabase
        .from('vendas')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (getError || !venda) {
        console.error('Erro ao buscar venda:', getError);
        return false;
      }
      
      // Excluir a transação associada, se existir
      if (venda.transaction_id) {
        await TransactionService.delete(venda.transaction_id);
      }
      
      // Excluir o comprovante, se existir
      if (venda.comprovante_url) {
        const fileName = venda.comprovante_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('vendas_comprovantes')
            .remove([`${userId}/${fileName}`]);
        }
      }
      
      // Excluir a venda
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao excluir venda:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      return false;
    }
  }
  
  /**
   * Busca vendas filtradas por cliente, período e/ou forma de pagamento
   * @param clienteId ID do cliente
   * @param startDate Data inicial
   * @param endDate Data final
   * @param formaPagamento Forma de pagamento
   */
  static async getFiltered(
    clienteId?: string, 
    startDate?: string, 
    endDate?: string,
    formaPagamento?: string
  ): Promise<Venda[]> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      let query = supabase
        .from('vendas')
        .select('*')
        .eq('user_id', userId);
        
      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }
      
      if (startDate) {
        query = query.gte('data', startDate);
      }
      
      if (endDate) {
        query = query.lte('data', endDate);
      }
      
      if (formaPagamento) {
        query = query.eq('forma_pagamento', formaPagamento);
      }
      
      const { data, error } = await query.order('data', { ascending: false });
        
      if (error) {
        console.error('Erro ao buscar vendas filtradas:', error);
        return [];
      }
      
      return data as Venda[];
    } catch (error) {
      console.error('Erro ao buscar vendas filtradas:', error);
      return [];
    }
  }
  
  /**
   * Retorna o total de vendas no período
   * @param startDate Data inicial
   * @param endDate Data final
   */
  static async getTotalVendas(startDate?: string, endDate?: string): Promise<number> {
    try {
      const vendas = await this.getFiltered(undefined, startDate, endDate);
      
      const total = vendas.reduce((acc, venda) => acc + venda.valor, 0);
      
      return total;
    } catch (error) {
      console.error('Erro ao calcular total de vendas:', error);
      return 0;
    }
  }
} 