import { Venda as ModelVenda } from '../models/Venda';
import { Venda as SupabaseVenda, CreateVendaDTO, UpdateVendaDTO } from '../lib/services/SupabaseMeiVendaService';
import { getNumericIdFromUuid, getUuidFromNumericId, registerUuidMapping } from '../lib/utils/uuidUtils';

// Funções de mapeamento de UUID removidas, agora usando as do módulo uuidUtils

/**
 * Formata uma data do formato ISO (YYYY-MM-DD) para o formato DD/MM/YYYY
 */
export function formatISODateToBrazilian(isoDate: string): string {
  console.log('formatISODateToBrazilian - Data recebida:', isoDate);
  
  // Se já estiver no formato brasileiro, retorna como está
  if (isoDate.includes('/')) {
    console.log('formatISODateToBrazilian - Data já está no formato brasileiro');
    return isoDate;
  }
  
  try {
  // Converte de YYYY-MM-DD para DD/MM/YYYY
  const [year, month, day] = isoDate.split('-');
    
    // Verificar se os componentes são válidos
    if (!year || !month || !day) {
      console.error('formatISODateToBrazilian - Formato de data inválido:', isoDate);
      return isoDate; // Retorna a data original em caso de erro
    }
    
    const formattedDate = `${day}/${month}/${year}`;
    console.log('formatISODateToBrazilian - Data formatada:', isoDate, '->', formattedDate);
    return formattedDate;
  } catch (error) {
    console.error('formatISODateToBrazilian - Erro ao formatar data:', error);
    return isoDate; // Retorna a data original em caso de erro
  }
}

/**
 * Formata uma data do formato brasileiro (DD/MM/YYYY) para o formato ISO (YYYY-MM-DD)
 */
export function formatBrazilianDateToISO(brDate: string): string {
  console.log('formatBrazilianDateToISO - Data recebida:', brDate);
  
  // Se já estiver no formato ISO, retorna como está
  if (brDate.includes('-')) {
    console.log('formatBrazilianDateToISO - Data já está no formato ISO');
    return brDate;
  }
  
  try {
    // Converte de DD/MM/YYYY para YYYY-MM-DD
    const [day, month, year] = brDate.split('/');
    
    // Verificar se os componentes são válidos
    if (!day || !month || !year) {
      console.error('formatBrazilianDateToISO - Formato de data inválido:', brDate);
      return brDate; // Retorna a data original em caso de erro
    }
    
    // Garantir que dia e mês tenham 2 dígitos para evitar problemas de fuso horário
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');
    
    const formattedDate = `${year}-${paddedMonth}-${paddedDay}`;
    console.log('formatBrazilianDateToISO - Data formatada:', brDate, '->', formattedDate);
    return formattedDate;
  } catch (error) {
    console.error('formatBrazilianDateToISO - Erro ao formatar data:', error);
    return brDate; // Retorna a data original em caso de erro
  }
}

/**
 * Adapta uma venda do formato da API Supabase para o formato do modelo da aplicação
 */
export function adaptSupabaseVendaToModel(supabaseVenda: SupabaseVenda): ModelVenda {
  console.log('adaptSupabaseVendaToModel - Venda do Supabase:', supabaseVenda);
  
  // Formatar o valor como string com prefixo "R$ "
  let valorFormatado = 'R$ 0,00';
  try {
    if (typeof supabaseVenda.valor === 'number') {
      valorFormatado = `R$ ${supabaseVenda.valor.toFixed(2).replace('.', ',')}`;
      console.log('adaptSupabaseVendaToModel - Valor formatado:', supabaseVenda.valor, '->', valorFormatado);
    } else {
      console.error('adaptSupabaseVendaToModel - Valor não é um número:', supabaseVenda.valor);
    }
  } catch (error) {
    console.error('adaptSupabaseVendaToModel - Erro ao formatar valor:', error);
  }
  
  // Converter ID da venda
  let id: number = 0;
  if (supabaseVenda.id === null || supabaseVenda.id === undefined) {
    console.warn('adaptSupabaseVendaToModel - ID nulo ou indefinido:', supabaseVenda.id);
  } else if (typeof supabaseVenda.id === 'string' && supabaseVenda.id.includes('-')) {
    // Parece ser um UUID, usar nosso mapeamento
    id = getNumericIdFromUuid(supabaseVenda.id);
    // Garantir que o mapeamento seja registrado para uso futuro
    registerUuidMapping(supabaseVenda.id, id);
    console.log('adaptSupabaseVendaToModel - UUID mapeado para ID numérico:', supabaseVenda.id, '->', id);
  } else {
    // Tentar converter para número
    const parsedId = parseInt(supabaseVenda.id);
    if (isNaN(parsedId)) {
      console.error('adaptSupabaseVendaToModel - ID inválido (NaN):', supabaseVenda.id);
    } else {
      id = parsedId;
      console.log('adaptSupabaseVendaToModel - ID convertido com sucesso:', supabaseVenda.id, '->', id);
    }
  }
  
  // Converter ID do cliente se necessário
  let clienteId: number = 0;
  if (supabaseVenda.cliente_id === null || supabaseVenda.cliente_id === undefined) {
    console.warn('adaptSupabaseVendaToModel - ID do cliente nulo ou indefinido:', supabaseVenda.cliente_id);
  } else if (typeof supabaseVenda.cliente_id === 'string' && supabaseVenda.cliente_id.includes('-')) {
    // Cliente ID é um UUID, usar nosso mapeamento
    clienteId = getNumericIdFromUuid(supabaseVenda.cliente_id);
    // Garantir que o mapeamento seja registrado para uso futuro
    registerUuidMapping(supabaseVenda.cliente_id, clienteId);
    console.log('adaptSupabaseVendaToModel - UUID do cliente mapeado para ID numérico:', 
                supabaseVenda.cliente_id, '->', clienteId);
  } else {
    const parsedClienteId = parseInt(supabaseVenda.cliente_id);
    if (isNaN(parsedClienteId)) {
      console.error('adaptSupabaseVendaToModel - ID do cliente inválido (NaN):', supabaseVenda.cliente_id);
    } else {
      clienteId = parsedClienteId;
      console.log('adaptSupabaseVendaToModel - ID do cliente convertido com sucesso:', 
                 supabaseVenda.cliente_id, '->', clienteId);
    }
  }
  
  // Formatar data
  const dataFormatada = formatISODateToBrazilian(supabaseVenda.data);
  
  // Formatar forma de pagamento (primeira letra maiúscula)
  const formaPagamento = supabaseVenda.forma_pagamento
    ? supabaseVenda.forma_pagamento.charAt(0).toUpperCase() + supabaseVenda.forma_pagamento.slice(1)
    : '';
  
  const vendaModel: ModelVenda = {
    id: id,
    clienteId: clienteId,
    clienteNome: supabaseVenda.cliente_nome || '',
    data: dataFormatada,
    descricao: supabaseVenda.descricao,
    valor: valorFormatado,
    formaPagamento: formaPagamento,
    comprovante: supabaseVenda.comprovante_url || undefined,
    uuid: supabaseVenda.id, // Armazenar o UUID original para referência
    clienteUuid: supabaseVenda.cliente_id // Armazenar o UUID do cliente para referência
  };
  
  console.log('adaptSupabaseVendaToModel - Venda adaptada para modelo:', vendaModel);
  return vendaModel;
}

/**
 * Adapta um array de vendas do formato da API Supabase para o formato do modelo
 */
export function adaptSupabaseVendasToModel(supabaseVendas: SupabaseVenda[]): ModelVenda[] {
  console.log(`adaptSupabaseVendasToModel - Adaptando ${supabaseVendas?.length || 0} vendas`);
  
  if (!supabaseVendas || supabaseVendas.length === 0) {
    console.log('adaptSupabaseVendasToModel - Nenhuma venda para adaptar');
    return [];
  }
  
  // Verificar se há algum ID inválido
  const invalidIds = supabaseVendas.filter(v => !v.id || v.id === 'null' || v.id === 'undefined');
  if (invalidIds.length > 0) {
    console.warn('adaptSupabaseVendasToModel - Vendas com IDs inválidos:', invalidIds);
  }
  
  const vendasAdaptadas = supabaseVendas.map(adaptSupabaseVendaToModel);
  
  // Verificar se há IDs duplicados após conversão
  const idMap = new Map<number, boolean>();
  const duplicatedIds = vendasAdaptadas.filter(v => {
    if (v.id && idMap.has(v.id)) {
      return true;
    }
    if (v.id) {
      idMap.set(v.id, true);
    }
    return false;
  });
  
  if (duplicatedIds.length > 0) {
    console.error('adaptSupabaseVendasToModel - Vendas com IDs duplicados após adaptação:', duplicatedIds);
  }
  
  return vendasAdaptadas;
}

/**
 * Converte o valor de uma string "R$ X,XX" para número
 */
export function convertStringValorToNumber(valor: string): number {
  console.log('convertStringValorToNumber - Valor recebido:', valor);
  
  try {
  // Remove o prefixo "R$ " e converte vírgula para ponto
    const valorLimpo = valor.replace(/[^\d,.-]/g, '').replace(',', '.');
    const valorNumerico = Number(valorLimpo);
    
    if (isNaN(valorNumerico)) {
      console.error('convertStringValorToNumber - Valor não é um número válido:', valor, '->', valorLimpo);
      return 0;
    }
    
    console.log('convertStringValorToNumber - Valor convertido:', valor, '->', valorNumerico);
    return valorNumerico;
  } catch (error) {
    console.error('convertStringValorToNumber - Erro ao converter valor:', error);
    return 0;
  }
}

/**
 * Adapta uma venda do modelo para o DTO de criação para a API
 * @param venda Venda do modelo
 * @returns DTO de criação para a API
 */
export function adaptModelVendaToCreateDTO(venda: ModelVenda): any {
  console.log('adaptModelVendaToCreateDTO - Venda do modelo:', venda);
  
  return {
    cliente_id: venda.clienteId ? String(venda.clienteId) : undefined,
    cliente_nome: venda.clienteNome,
    data: formatBrazilianDateToISO(venda.data),
    descricao: venda.descricao,
    valor: convertStringValorToNumber(venda.valor),
    forma_pagamento: venda.formaPagamento.toLowerCase()
  };
}

/**
 * Adapta uma venda do modelo para o DTO de atualização para a API
 * @param venda Venda do modelo
 * @returns DTO de atualização para a API
 */
export function adaptModelVendaToUpdateDTO(venda: ModelVenda): any {
  console.log('adaptModelVendaToUpdateDTO - Venda do modelo:', venda);
  
  return {
    cliente_id: venda.clienteId ? String(venda.clienteId) : undefined,
    cliente_nome: venda.clienteNome,
    data: formatBrazilianDateToISO(venda.data),
    descricao: venda.descricao,
    valor: convertStringValorToNumber(venda.valor),
    forma_pagamento: venda.formaPagamento.toLowerCase()
  };
}