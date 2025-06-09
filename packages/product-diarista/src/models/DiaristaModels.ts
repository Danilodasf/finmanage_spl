/**
 * Modelos específicos para o produto Diarista
 * Extensões e adaptações dos modelos do core para o contexto de diaristas
 */

import { Transaction, Category } from '../lib/core/services';

/**
 * Tipos de categorias para MEI (mesma estrutura do product-mei)
 */
export type CategoryType = 'receita' | 'despesa' | 'ambos' | 'investimento';

/**
 * Categoria adaptada para usar a mesma estrutura do MEI
 */
export interface CategoriaDiarista {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  created_at?: string;
  updated_at?: string;
}

/**
 * Extensão da transação para incluir informações específicas de diarista
 */
export interface TransacaoDiarista extends Transaction {
  cliente_nome?: string;
  cliente_telefone?: string;
  endereco_servico?: string;
  status_pagamento?: 'pendente' | 'pago' | 'atrasado';
  servico_id?: string; // Referência ao serviço que gerou esta transação
  gasto_servico_id?: string; // Referência ao gasto adicional que gerou esta transação
  is_auto_generated?: boolean; // Indica se a transação foi gerada automaticamente
}

/**
 * Interface para dados de cliente
 */
export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  localizacao?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para agendamento de serviços
 */
export interface Agendamento {
  id: string;
  cliente_id: string;
  categoria_id: string;
  data_agendada: string;
  hora_inicio: string;
  hora_fim?: string;
  status: 'em_andamento' | 'concluido' | 'cancelado';
  valor_acordado: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * DTOs para criação e atualização
 */
export interface CreateTransacaoDiaristaDTO extends Omit<TransacaoDiarista, 'id' | 'user_id' | 'created_at' | 'updated_at'> {}

export interface UpdateTransacaoDiaristaDTO extends Partial<CreateTransacaoDiaristaDTO> {}

// DTOs removidos - usando interfaces padrão do core

export interface CreateClienteDTO {
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  localizacao?: string;
}

export interface UpdateClienteDTO {
  nome?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  localizacao?: string;
}

export interface CreateAgendamentoDTO extends Omit<Agendamento, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateAgendamentoDTO extends Partial<CreateAgendamentoDTO> {}

/**
 * Interface para serviços
 */
export interface Servico {
  id: string;
  user_id: string;
  cliente_id: string;
  categoria_id?: string;
  data: string;
  valor: number;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  descricao?: string;
  localizacao?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para gastos de serviços
 */
export interface GastoServico {
  id: string;
  servico_id: string;
  user_id: string;
  categoria_id: string;
  descricao: string;
  valor: number;
  data: string;
  created_at: string;
  updated_at: string;
}

/**
 * DTOs para serviços
 */
export interface CreateServicoDTO extends Omit<Servico, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateServicoDTO extends Partial<CreateServicoDTO> {}

/**
 * DTOs para gastos de serviços
 */
export interface CreateGastoServicoDTO extends Omit<GastoServico, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateGastoServicoDTO extends Partial<CreateGastoServicoDTO> {}