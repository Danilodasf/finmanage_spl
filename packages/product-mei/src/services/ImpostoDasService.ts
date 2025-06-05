import { supabase } from '../../../core/src/lib/supabase';
import { getCurrentUserId } from '../../../core/src/lib/supabase';
import { TransactionService } from '../../../core/src/lib/services/transaction';

/**
 * Interface para representar um pagamento de DAS
 */
export interface ImpostoDas {
  id: string;
  user_id: string;
  competencia: string;
  vencimento: string;
  valor: number;
  numero_das: string | null;
  status: 'Pago' | 'Pendente';
  data_pagamento: string | null;
  comprovante_url: string | null;
  transaction_id: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para criar um novo pagamento de DAS
 */
export interface CreateImpostoDasDTO {
  competencia: string;
  vencimento: string;
  valor: number;
  numero_das?: string;
  status: 'Pago' | 'Pendente';
  data_pagamento?: string;
  comprovante?: File;
}

/**
 * Interface para atualizar um pagamento de DAS existente
 */
export interface UpdateImpostoDasDTO {
  competencia?: string;
  vencimento?: string;
  valor?: number;
  numero_das?: string;
  status?: 'Pago' | 'Pendente';
  data_pagamento?: string | null;
  comprovante?: File;
}

/**
 * Implementação do serviço de Imposto DAS usando Supabase
 */
export class ImpostoDasService {
  /**
   * Busca todos os pagamentos de DAS do usuário atual
   */
  static async getAll(): Promise<ImpostoDas[]> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('user_id', userId)
        .order('vencimento', { ascending: false });
        
      if (error) {
        console.error('Erro ao buscar pagamentos de DAS:', error);
        return [];
      }
      
      return data as ImpostoDas[];
    } catch (error) {
      console.error('Erro ao buscar pagamentos de DAS:', error);
      return [];
    }
  }
  
  /**
   * Busca um pagamento de DAS pelo ID
   * @param id ID do pagamento de DAS
   */
  static async getById(id: string): Promise<ImpostoDas | null> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar pagamento de DAS:', error);
        return null;
      }
      
      return data as ImpostoDas;
    } catch (error) {
      console.error('Erro ao buscar pagamento de DAS:', error);
      return null;
    }
  }
  
  /**
   * Cria um novo pagamento de DAS
   * @param impostoDas Dados do pagamento de DAS
   */
  static async create(impostoDas: CreateImpostoDasDTO): Promise<ImpostoDas | null> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Processar o upload do comprovante, se houver
      let comprovanteUrl = null;
      if (impostoDas.comprovante) {
        const fileName = `${Date.now()}_${impostoDas.comprovante.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('das_comprovantes')
          .upload(`${userId}/${fileName}`, impostoDas.comprovante);
          
        if (uploadError) {
          console.error('Erro ao fazer upload do comprovante:', uploadError);
        } else if (uploadData) {
          // Obter a URL pública do arquivo
          const { data: urlData } = supabase.storage
            .from('das_comprovantes')
            .getPublicUrl(`${userId}/${fileName}`);
            
          comprovanteUrl = urlData.publicUrl;
        }
      }
      
      // Criar a transação correspondente ao pagamento, se for pago
      let transactionId = null;
      if (impostoDas.status === 'Pago' && impostoDas.data_pagamento) {
        const transaction = await TransactionService.create({
          type: 'despesa',
          category_id: '', // Buscar a categoria "Impostos" ou criar
          description: `DAS - Competência ${impostoDas.competencia}`,
          value: impostoDas.valor,
          date: impostoDas.data_pagamento,
          payment_method: 'Transferência',
        });
        
        if (transaction) {
          transactionId = transaction.id;
        }
      }
      
      // Inserir o pagamento de DAS no banco de dados
      const { data, error } = await supabase
        .from('imposto_das')
        .insert({
          user_id: userId,
          competencia: impostoDas.competencia,
          vencimento: impostoDas.vencimento,
          valor: impostoDas.valor,
          numero_das: impostoDas.numero_das || null,
          status: impostoDas.status,
          data_pagamento: impostoDas.data_pagamento || null,
          comprovante_url: comprovanteUrl,
          transaction_id: transactionId,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao criar pagamento de DAS:', error);
        return null;
      }
      
      return data as ImpostoDas;
    } catch (error) {
      console.error('Erro ao criar pagamento de DAS:', error);
      return null;
    }
  }
  
  /**
   * Atualiza um pagamento de DAS existente
   * @param id ID do pagamento de DAS
   * @param impostoDas Dados para atualização
   */
  static async update(id: string, impostoDas: UpdateImpostoDasDTO): Promise<ImpostoDas | null> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar o pagamento existente para obter o ID da transação
      const { data: dasExistente, error: getError } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (getError || !dasExistente) {
        console.error('Erro ao buscar pagamento de DAS existente:', getError);
        return null;
      }
      
      // Processar o upload do comprovante, se houver
      let comprovanteUrl = dasExistente.comprovante_url;
      if (impostoDas.comprovante) {
        const fileName = `${Date.now()}_${impostoDas.comprovante.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('das_comprovantes')
          .upload(`${userId}/${fileName}`, impostoDas.comprovante);
          
        if (uploadError) {
          console.error('Erro ao fazer upload do comprovante:', uploadError);
        } else if (uploadData) {
          // Obter a URL pública do arquivo
          const { data: urlData } = supabase.storage
            .from('das_comprovantes')
            .getPublicUrl(`${userId}/${fileName}`);
            
          comprovanteUrl = urlData.publicUrl;
        }
      }
      
      // Verificar se o status mudou de pendente para pago
      const statusMudouParaPago = 
        dasExistente.status === 'Pendente' && 
        impostoDas.status === 'Pago' && 
        impostoDas.data_pagamento;
      
      // Criar transação se o status mudou para pago
      let transactionId = dasExistente.transaction_id;
      if (statusMudouParaPago) {
        const transaction = await TransactionService.create({
          type: 'despesa',
          category_id: '', // Buscar a categoria "Impostos" ou criar
          description: `DAS - Competência ${impostoDas.competencia || dasExistente.competencia}`,
          value: impostoDas.valor || dasExistente.valor,
          date: impostoDas.data_pagamento,
          payment_method: 'Transferência',
        });
        
        if (transaction) {
          transactionId = transaction.id;
        }
      } 
      // Atualizar a transação existente, se houver
      else if (dasExistente.transaction_id && impostoDas.status === 'Pago') {
        await TransactionService.update(dasExistente.transaction_id, {
          description: `DAS - Competência ${impostoDas.competencia || dasExistente.competencia}`,
          value: impostoDas.valor,
          date: impostoDas.data_pagamento,
        });
      }
      // Se o status mudou de pago para pendente, remover a transação
      else if (dasExistente.status === 'Pago' && impostoDas.status === 'Pendente' && dasExistente.transaction_id) {
        await TransactionService.delete(dasExistente.transaction_id);
        transactionId = null;
      }
      
      // Atualizar o pagamento de DAS
      const { data, error } = await supabase
        .from('imposto_das')
        .update({
          competencia: impostoDas.competencia,
          vencimento: impostoDas.vencimento,
          valor: impostoDas.valor,
          numero_das: impostoDas.numero_das,
          status: impostoDas.status,
          data_pagamento: impostoDas.data_pagamento,
          comprovante_url: comprovanteUrl,
          transaction_id: transactionId,
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao atualizar pagamento de DAS:', error);
        return null;
      }
      
      return data as ImpostoDas;
    } catch (error) {
      console.error('Erro ao atualizar pagamento de DAS:', error);
      return null;
    }
  }
  
  /**
   * Remove um pagamento de DAS
   * @param id ID do pagamento de DAS
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar o pagamento para obter o ID da transação
      const { data: das, error: getError } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (getError || !das) {
        console.error('Erro ao buscar pagamento de DAS:', getError);
        return false;
      }
      
      // Excluir a transação associada, se existir
      if (das.transaction_id) {
        await TransactionService.delete(das.transaction_id);
      }
      
      // Excluir o comprovante, se existir
      if (das.comprovante_url) {
        const fileName = das.comprovante_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('das_comprovantes')
            .remove([`${userId}/${fileName}`]);
        }
      }
      
      // Excluir o pagamento de DAS
      const { error } = await supabase
        .from('imposto_das')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Erro ao excluir pagamento de DAS:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir pagamento de DAS:', error);
      return false;
    }
  }
  
  /**
   * Marca um pagamento de DAS como pago
   * @param id ID do pagamento de DAS
   * @param dataPagamento Data do pagamento
   * @param comprovante Arquivo do comprovante (opcional)
   */
  static async marcarComoPago(id: string, dataPagamento: string, comprovante?: File): Promise<ImpostoDas | null> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar o pagamento existente
      const { data: dasExistente, error: getError } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (getError || !dasExistente) {
        console.error('Erro ao buscar pagamento de DAS existente:', getError);
        return null;
      }
      
      // Processar o upload do comprovante, se houver
      let comprovanteUrl = dasExistente.comprovante_url;
      if (comprovante) {
        const fileName = `${Date.now()}_${comprovante.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('das_comprovantes')
          .upload(`${userId}/${fileName}`, comprovante);
          
        if (uploadError) {
          console.error('Erro ao fazer upload do comprovante:', uploadError);
        } else if (uploadData) {
          // Obter a URL pública do arquivo
          const { data: urlData } = supabase.storage
            .from('das_comprovantes')
            .getPublicUrl(`${userId}/${fileName}`);
            
          comprovanteUrl = urlData.publicUrl;
        }
      }
      
      // Criar a transação correspondente ao pagamento
      let transactionId = dasExistente.transaction_id;
      if (!transactionId) {
        const transaction = await TransactionService.create({
          type: 'despesa',
          category_id: '', // Buscar a categoria "Impostos" ou criar
          description: `DAS - Competência ${dasExistente.competencia}`,
          value: dasExistente.valor,
          date: dataPagamento,
          payment_method: 'Transferência',
        });
        
        if (transaction) {
          transactionId = transaction.id;
        }
      }
      
      // Atualizar o pagamento de DAS
      const { data, error } = await supabase
        .from('imposto_das')
        .update({
          status: 'Pago',
          data_pagamento: dataPagamento,
          comprovante_url: comprovanteUrl,
          transaction_id: transactionId,
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao marcar pagamento de DAS como pago:', error);
        return null;
      }
      
      return data as ImpostoDas;
    } catch (error) {
      console.error('Erro ao marcar pagamento de DAS como pago:', error);
      return null;
    }
  }
  
  /**
   * Busca pagamentos de DAS filtrados por competência, status e/ou período
   * @param competencia Competência do DAS
   * @param status Status do pagamento
   * @param startDate Data inicial de vencimento
   * @param endDate Data final de vencimento
   */
  static async getFiltered(
    competencia?: string, 
    status?: 'Pago' | 'Pendente', 
    startDate?: string, 
    endDate?: string
  ): Promise<ImpostoDas[]> {
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      let query = supabase
        .from('imposto_das')
        .select('*')
        .eq('user_id', userId);
        
      if (competencia) {
        query = query.eq('competencia', competencia);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (startDate) {
        query = query.gte('vencimento', startDate);
      }
      
      if (endDate) {
        query = query.lte('vencimento', endDate);
      }
      
      const { data, error } = await query.order('vencimento', { ascending: false });
        
      if (error) {
        console.error('Erro ao buscar pagamentos de DAS filtrados:', error);
        return [];
      }
      
      return data as ImpostoDas[];
    } catch (error) {
      console.error('Erro ao buscar pagamentos de DAS filtrados:', error);
      return [];
    }
  }
  
  /**
   * Calcula o valor do DAS com base no tipo de atividade, faturamento e MEI Caminhoneiro
   * @param tipoAtividade Tipo de atividade (comercio, servicos, ambos)
   * @param isMEICaminhoneiro Se é MEI Caminhoneiro
   * @returns Valores do cálculo (INSS, ISS, ICMS, total)
   */
  static calcularDAS(
    tipoAtividade: 'comercio' | 'servicos' | 'ambos',
    isMEICaminhoneiro: boolean
  ): { inss: number; iss: number; icms: number; total: number } {
    // Valores atualizados do DAS para MEI em 2025
    let inss = isMEICaminhoneiro ? 182.16 : 75.90; // 12% ou 5% do salário mínimo de R$ 1.518,00
    let iss = 0;
    let icms = 0;

    // Ajustar valores conforme o tipo de atividade
    if (tipoAtividade === 'comercio') {
      icms = 1.00;
    } else if (tipoAtividade === 'servicos') {
      iss = 5.00;
    } else if (tipoAtividade === 'ambos') {
      iss = 5.00;
      icms = 1.00;
    }

    const total = inss + iss + icms;

    return { inss, iss, icms, total };
  }
} 