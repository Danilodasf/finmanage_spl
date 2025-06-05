import { Cliente as ModelCliente } from '../models/Cliente';
import { Cliente as SupabaseCliente, CreateClienteDTO, UpdateClienteDTO } from '../lib/services/SupabaseMeiClienteService';
import { ClienteFormData } from './ClienteFormAdapter';

/**
 * Adapta um cliente do formato da API Supabase para o formato do modelo da aplicação
 */
export function adaptSupabaseClienteToModel(supabaseCliente: SupabaseCliente): ClienteFormData {
  // Garantir que o ID seja um número válido
  const id = supabaseCliente.id ? parseInt(supabaseCliente.id) : 0;
  
  return {
    id: isNaN(id) ? 0 : id, // Assegurar que não seja NaN
    nome: supabaseCliente.nome,
    email: supabaseCliente.email || '',
    telefone: supabaseCliente.telefone || '',
    cpfCnpj: supabaseCliente.cpf_cnpj || '',
    endereco: supabaseCliente.endereco || '',
    observacoes: supabaseCliente.observacoes || '',
    dataCadastro: supabaseCliente.created_at ? supabaseCliente.created_at.split('T')[0] : ''
  };
}

/**
 * Adapta um array de clientes do formato da API Supabase para o formato do modelo
 */
export function adaptSupabaseClientesToModel(supabaseClientes: SupabaseCliente[]): ClienteFormData[] {
  return supabaseClientes.map(adaptSupabaseClienteToModel);
}

/**
 * Adapta um cliente do formato do modelo para o formato da API Supabase
 * Usado para conversões em atualizações/criações
 */
export function adaptModelClienteToSupabase(modelCliente: ModelCliente): Partial<SupabaseCliente> {
  return {
    nome: modelCliente.nome,
    email: modelCliente.email || null,
    telefone: modelCliente.telefone || null,
    cpf_cnpj: modelCliente.cpfCnpj || null,
    endereco: modelCliente.endereco || null,
    observacoes: modelCliente.observacoes || null
  };
} 