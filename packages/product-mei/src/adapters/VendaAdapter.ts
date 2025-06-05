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
    
    const formattedDate = `${year}-${month}-${day}`;
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
 * Adapta uma venda do formato do modelo para criar uma nova venda na API
 */
export function adaptModelVendaToCreateDTO(modelVenda: ModelVenda, comprovante?: File): CreateVendaDTO {
  console.log('adaptModelVendaToCreateDTO - Venda do modelo:', modelVenda);
  
  // Obter o UUID do cliente em vez do ID numérico
  let clienteUuid: string | undefined = undefined;
  if (modelVenda.clienteUuid) {
    // Se temos o UUID do cliente armazenado, usá-lo diretamente
    clienteUuid = modelVenda.clienteUuid;
    console.log('adaptModelVendaToCreateDTO - Usando UUID do cliente:', clienteUuid);
  } else if (modelVenda.clienteId && modelVenda.clienteId > 0) {
    // Tentar recuperar o UUID a partir do ID numérico
    const uuid = getUuidFromNumericId(modelVenda.clienteId);
    if (uuid) {
      clienteUuid = uuid;
      console.log('adaptModelVendaToCreateDTO - ID do cliente convertido para UUID:', modelVenda.clienteId, '->', clienteUuid);
    } else {
      // Se não encontrar o UUID, usar o ID numérico como string
      clienteUuid = String(modelVenda.clienteId);
      console.log('adaptModelVendaToCreateDTO - Usando ID numérico do cliente como string:', modelVenda.clienteId, '->', clienteUuid);
    }
  }
  
  // Formatar data para ISO
  const dataISO = formatBrazilianDateToISO(modelVenda.data);
  
  // Converter valor para número
  const valor = convertStringValorToNumber(modelVenda.valor);
  
  const createDTO: CreateVendaDTO = {
    cliente_id: clienteUuid,
    cliente_nome: modelVenda.clienteNome,
    data: dataISO,
    descricao: modelVenda.descricao,
    valor: valor,
    forma_pagamento: modelVenda.formaPagamento.toLowerCase(),
    comprovante
  };
  
  console.log('adaptModelVendaToCreateDTO - Venda adaptada para DTO de criação:', createDTO);
  return createDTO;
}

/**
 * Adapta uma venda do formato do modelo para atualizar uma venda existente na API
 */
export function adaptModelVendaToUpdateDTO(modelVenda: ModelVenda, comprovante?: File): UpdateVendaDTO {
  console.log('adaptModelVendaToUpdateDTO - Venda do modelo:', modelVenda);
  
  // Usar o UUID original da venda para atualização
  let vendaUuid: string | undefined = undefined;
  if (modelVenda.uuid) {
    vendaUuid = modelVenda.uuid;
    console.log('adaptModelVendaToUpdateDTO - Usando UUID da venda:', vendaUuid);
  } else if (modelVenda.id > 0) {
    // Tentar recuperar o UUID a partir do ID numérico
    vendaUuid = getUuidFromNumericId(modelVenda.id);
    console.log('adaptModelVendaToUpdateDTO - ID convertido para UUID:', modelVenda.id, '->', vendaUuid);
  }
  
  // Obter o UUID do cliente
  let clienteUuid: string | undefined = undefined;
  if (modelVenda.clienteUuid) {
    clienteUuid = modelVenda.clienteUuid;
    console.log('adaptModelVendaToUpdateDTO - Usando UUID do cliente:', clienteUuid);
  } else if (modelVenda.clienteId && modelVenda.clienteId > 0) {
    // Tentar recuperar o UUID a partir do ID numérico
    const uuid = getUuidFromNumericId(modelVenda.clienteId);
    if (uuid) {
      clienteUuid = uuid;
      console.log('adaptModelVendaToUpdateDTO - ID do cliente convertido para UUID:', modelVenda.clienteId, '->', clienteUuid);
    } else {
      // Se não encontrar o UUID, usar o ID numérico como string
      clienteUuid = String(modelVenda.clienteId);
      console.log('adaptModelVendaToUpdateDTO - Usando ID numérico do cliente como string:', modelVenda.clienteId, '->', clienteUuid);
    }
  }
  
  // Formatar data para ISO
  const dataISO = formatBrazilianDateToISO(modelVenda.data);
  
  // Converter valor para número
  const valor = convertStringValorToNumber(modelVenda.valor);
  console.log('adaptModelVendaToUpdateDTO - Valor convertido:', modelVenda.valor, '->', valor);
  
  const updateDTO: UpdateVendaDTO = {
    id: vendaUuid, // Incluir ID explicitamente para garantir a atualização correta
    cliente_id: clienteUuid,
    cliente_nome: modelVenda.clienteNome,
    data: dataISO,
    descricao: modelVenda.descricao,
    valor: valor,
    forma_pagamento: modelVenda.formaPagamento.toLowerCase(),
    comprovante
  };
  
  console.log('adaptModelVendaToUpdateDTO - Venda adaptada para DTO de atualização:', updateDTO);
  return updateDTO;
} 