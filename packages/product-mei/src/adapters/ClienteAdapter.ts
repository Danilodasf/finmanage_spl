import { Cliente as ModelCliente } from '../models/Cliente';
import { Cliente as SupabaseCliente, CreateClienteDTO, UpdateClienteDTO } from '../lib/services/SupabaseMeiClienteService';
import { ClienteFormData } from './ClienteFormAdapter';
import { getNumericIdFromUuid, getUuidFromNumericId, registerUuidMapping } from '../lib/utils/uuidUtils';

// Mapeamento removido, agora usando as funções do módulo uuidUtils

/**
 * Adapta um cliente do formato da API Supabase para o formato do modelo da aplicação
 */
export function adaptSupabaseClienteToModel(supabaseCliente: SupabaseCliente): ClienteFormData {
  console.log('adaptSupabaseClienteToModel - Cliente do Supabase:', supabaseCliente);
  
  // Garantir que o ID seja um número válido
  let id: number = 0;
  
  if (supabaseCliente.id === null || supabaseCliente.id === undefined) {
    console.warn('adaptSupabaseClienteToModel - ID nulo ou indefinido:', supabaseCliente.id);
  } else if (typeof supabaseCliente.id === 'string' && supabaseCliente.id.includes('-')) {
    // Parece ser um UUID, usar nosso mapeamento
    id = getNumericIdFromUuid(supabaseCliente.id);
    // Garantir que o mapeamento seja registrado para uso futuro
    registerUuidMapping(supabaseCliente.id, id);
    console.log('adaptSupabaseClienteToModel - UUID mapeado para ID numérico:', supabaseCliente.id, '->', id);
  } else {
    // Tentar converter para número
    const parsedId = parseInt(supabaseCliente.id);
    if (isNaN(parsedId)) {
      console.error('adaptSupabaseClienteToModel - ID inválido (NaN):', supabaseCliente.id);
    } else {
      id = parsedId;
      console.log('adaptSupabaseClienteToModel - ID convertido com sucesso:', supabaseCliente.id, '->', id);
    }
  }
  
  const clienteForm: ClienteFormData = {
    id: id,
    nome: supabaseCliente.nome,
    email: supabaseCliente.email || '',
    telefone: supabaseCliente.telefone || '',
    cpfCnpj: supabaseCliente.cpf_cnpj || '',
    endereco: supabaseCliente.endereco || '',
    observacoes: supabaseCliente.observacoes || '',
    dataCadastro: supabaseCliente.created_at ? supabaseCliente.created_at.split('T')[0] : supabaseCliente.data_cadastro || '',
    uuid: supabaseCliente.id // Armazenar o UUID original para referência
  };
  
  console.log('adaptSupabaseClienteToModel - Cliente adaptado para formulário:', clienteForm);
  return clienteForm;
}

/**
 * Adapta um array de clientes do formato da API Supabase para o formato do modelo
 */
export function adaptSupabaseClientesToModel(supabaseClientes: SupabaseCliente[]): ClienteFormData[] {
  console.log(`adaptSupabaseClientesToModel - Adaptando ${supabaseClientes?.length || 0} clientes`);
  
  if (!supabaseClientes || supabaseClientes.length === 0) {
    console.log('adaptSupabaseClientesToModel - Nenhum cliente para adaptar');
    return [];
  }
  
  // Verificar se há algum ID inválido
  const invalidIds = supabaseClientes.filter(c => !c.id || c.id === 'null' || c.id === 'undefined');
  if (invalidIds.length > 0) {
    console.warn('adaptSupabaseClientesToModel - Clientes com IDs inválidos:', invalidIds);
  }
  
  const clientesAdaptados = supabaseClientes.map(adaptSupabaseClienteToModel);
  
  // Verificar se há IDs duplicados após conversão
  const idMap = new Map<number, boolean>();
  const duplicatedIds = clientesAdaptados.filter(c => {
    if (c.id && idMap.has(c.id)) {
      return true;
    }
    if (c.id) {
      idMap.set(c.id, true);
    }
    return false;
  });
  
  if (duplicatedIds.length > 0) {
    console.error('adaptSupabaseClientesToModel - Clientes com IDs duplicados após adaptação:', duplicatedIds);
  }
  
  return clientesAdaptados;
}

/**
 * Adapta um cliente do formato do modelo para o formato da API Supabase
 * Usado para conversões em atualizações/criações
 */
export function adaptModelClienteToSupabase(modelCliente: ModelCliente): Partial<SupabaseCliente> {
  console.log('adaptModelClienteToSupabase - Cliente do modelo:', modelCliente);
  
  const adaptedCliente: Partial<SupabaseCliente> = {
    nome: modelCliente.nome,
    email: modelCliente.email || null,
    telefone: modelCliente.telefone || null,
    cpf_cnpj: modelCliente.cpfCnpj || null,
    endereco: modelCliente.endereco || null,
    observacoes: modelCliente.observacoes || null
  };
  
  console.log('adaptModelClienteToSupabase - Cliente adaptado para Supabase:', adaptedCliente);
  return adaptedCliente;
}

/**
 * Adapta um cliente do formato do formulário para o formato da API Supabase
 * Usado para conversões em atualizações
 */
export function adaptFormClienteToSupabase(formCliente: ClienteFormData): Partial<SupabaseCliente> {
  console.log('adaptFormClienteToSupabase - Cliente do formulário:', formCliente);
  
  // Tratar o ID, obter o UUID original se disponível
  let clienteId: string | undefined = undefined;
  
  if (formCliente.uuid) {
    // Se temos o UUID armazenado, usá-lo diretamente
    clienteId = formCliente.uuid;
    console.log('adaptFormClienteToSupabase - Usando UUID original:', clienteId);
  } else if (formCliente.id !== undefined && formCliente.id !== null && formCliente.id !== 0) {
    // Tentar recuperar o UUID a partir do ID numérico
    const uuid = getUuidFromNumericId(formCliente.id);
    if (uuid) {
      clienteId = uuid;
      console.log('adaptFormClienteToSupabase - ID numérico convertido para UUID:', formCliente.id, '->', clienteId);
    } else {
      // Se não encontrar o UUID, usar o ID numérico como string
      clienteId = String(formCliente.id);
      console.log('adaptFormClienteToSupabase - Usando ID numérico como string:', formCliente.id, '->', clienteId);
    }
  }
  
  const adaptedCliente: Partial<SupabaseCliente> = {
    id: clienteId,
    nome: formCliente.nome,
    email: formCliente.email || null,
    telefone: formCliente.telefone || null,
    cpf_cnpj: formCliente.cpfCnpj || null,
    endereco: formCliente.endereco || null,
    observacoes: formCliente.observacoes || null
  };
  
  console.log('adaptFormClienteToSupabase - Cliente adaptado para Supabase:', adaptedCliente);
  return adaptedCliente;
} 