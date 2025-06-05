import { CreateClienteDTO, UpdateClienteDTO } from '../lib/services/SupabaseMeiClienteService';

/**
 * Interface para o cliente no formato do formulário
 */
export interface ClienteFormData {
  id?: number;
  nome: string;
  email?: string;
  telefone?: string;
  cpfCnpj?: string;
  endereco?: string;
  observacoes?: string;
  dataCadastro?: string;
  uuid?: string; // UUID original do Supabase
}

/**
 * Adapta um cliente do formato do formulário para o formato da API (criação)
 */
export function adaptClienteFormToCreateDTO(formData: ClienteFormData): CreateClienteDTO {
  return {
    nome: formData.nome,
    email: formData.email || undefined,
    telefone: formData.telefone || undefined,
    cpf_cnpj: formData.cpfCnpj || undefined,
    endereco: formData.endereco || undefined,
    observacoes: formData.observacoes || undefined
  };
}

/**
 * Adapta um cliente do formato do formulário para o formato da API (atualização)
 */
export function adaptClienteFormToUpdateDTO(formData: ClienteFormData): UpdateClienteDTO {
  return {
    nome: formData.nome,
    email: formData.email || undefined,
    telefone: formData.telefone || undefined,
    cpf_cnpj: formData.cpfCnpj || undefined,
    endereco: formData.endereco || undefined,
    observacoes: formData.observacoes || undefined
  };
} 