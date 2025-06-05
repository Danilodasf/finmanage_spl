import { Venda as ModelVenda } from '../models/Venda';
import { Venda as SupabaseVenda, CreateVendaDTO, UpdateVendaDTO } from '../lib/services/SupabaseMeiVendaService';

/**
 * Formata uma data do formato ISO (YYYY-MM-DD) para o formato DD/MM/YYYY
 */
export function formatISODateToBrazilian(isoDate: string): string {
  // Se já estiver no formato brasileiro, retorna como está
  if (isoDate.includes('/')) {
    return isoDate;
  }
  
  // Converte de YYYY-MM-DD para DD/MM/YYYY
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Formata uma data do formato brasileiro (DD/MM/YYYY) para o formato ISO (YYYY-MM-DD)
 */
export function formatBrazilianDateToISO(brDate: string): string {
  // Se já estiver no formato ISO, retorna como está
  if (brDate.includes('-')) {
    return brDate;
  }
  
  // Converte de DD/MM/YYYY para YYYY-MM-DD
  const [day, month, year] = brDate.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Adapta uma venda do formato da API Supabase para o formato do modelo da aplicação
 */
export function adaptSupabaseVendaToModel(supabaseVenda: SupabaseVenda): ModelVenda {
  // Formatar o valor como string com prefixo "R$ "
  const valorFormatado = `R$ ${supabaseVenda.valor.toFixed(2).replace('.', ',')}`;
  
  // Garantir que o ID seja um número válido
  const id = supabaseVenda.id ? parseInt(supabaseVenda.id) : 0;
  const clienteId = supabaseVenda.cliente_id ? parseInt(supabaseVenda.cliente_id) : 0;
  
  return {
    id: isNaN(id) ? 0 : id, // Assegurar que não seja NaN
    clienteId: isNaN(clienteId) ? 0 : clienteId, // Assegurar que não seja NaN
    clienteNome: supabaseVenda.cliente_nome || '',
    data: formatISODateToBrazilian(supabaseVenda.data),
    descricao: supabaseVenda.descricao,
    valor: valorFormatado,
    formaPagamento: supabaseVenda.forma_pagamento.charAt(0).toUpperCase() + supabaseVenda.forma_pagamento.slice(1),
    comprovante: supabaseVenda.comprovante_url || undefined
  };
}

/**
 * Adapta um array de vendas do formato da API Supabase para o formato do modelo
 */
export function adaptSupabaseVendasToModel(supabaseVendas: SupabaseVenda[]): ModelVenda[] {
  return supabaseVendas.map(adaptSupabaseVendaToModel);
}

/**
 * Converte o valor de uma string "R$ X,XX" para número
 */
export function convertStringValorToNumber(valor: string): number {
  // Remove o prefixo "R$ " e converte vírgula para ponto
  return Number(valor.replace('R$ ', '').replace(',', '.'));
}

/**
 * Adapta uma venda do formato do modelo para criar uma nova venda na API
 */
export function adaptModelVendaToCreateDTO(modelVenda: ModelVenda, comprovante?: File): CreateVendaDTO {
  return {
    cliente_id: modelVenda.clienteId ? String(modelVenda.clienteId) : undefined,
    cliente_nome: modelVenda.clienteNome,
    data: formatBrazilianDateToISO(modelVenda.data),
    descricao: modelVenda.descricao,
    valor: convertStringValorToNumber(modelVenda.valor),
    forma_pagamento: modelVenda.formaPagamento.toLowerCase(),
    comprovante
  };
}

/**
 * Adapta uma venda do formato do modelo para atualizar uma venda existente na API
 */
export function adaptModelVendaToUpdateDTO(modelVenda: ModelVenda, comprovante?: File): UpdateVendaDTO {
  return {
    cliente_id: modelVenda.clienteId ? String(modelVenda.clienteId) : undefined,
    cliente_nome: modelVenda.clienteNome,
    data: formatBrazilianDateToISO(modelVenda.data),
    descricao: modelVenda.descricao,
    valor: convertStringValorToNumber(modelVenda.valor),
    forma_pagamento: modelVenda.formaPagamento.toLowerCase(),
    comprovante
  };
} 