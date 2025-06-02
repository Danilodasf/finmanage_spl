import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dvfkxltbwhkrdkuvejue.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2Zmt4bHRid2hrcmRrdXZlanVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MzgwODgsImV4cCI6MjA2NDQxNDA4OH0.nLURRo4_h5yzXfLhi7IspUrfFFgnHL_zcIdD3mS-jmg';

// Criando o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Tipos para as tabelas do Supabase
 * 
 * Para uma documentação completa da estrutura do banco de dados, consulte:
 * - supabase/database-schema.sql: Script completo de criação das tabelas, relacionamentos e políticas RLS
 * - supabase/database-schema.md: Documentação detalhada da estrutura do banco de dados
 */
export type Tables = {
  categories: {
    id: string;
    name: string;
    type: 'receita' | 'despesa' | 'ambos' | 'investimento';
    user_id: string;
    created_at?: string;
    updated_at?: string;
  };
  transactions: {
    id: string;
    type: 'receita' | 'despesa';
    date: string;
    value: number;
    description?: string;
    category_id?: string;
    payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix';
    user_id: string;
    created_at?: string;
    updated_at?: string;
  };
  budgets: {
    id: string;
    name: string;
    amount: number;
    category_id?: string;
    spent_amount?: number;
    period: 'mensal' | 'anual';
    description?: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
  };
  goals: {
    id: string;
    name: string;
    target_amount: number;
    current_amount?: number;
    start_date: string;
    target_date: string;
    description?: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
  };
  investments: {
    id: string;
    name: string;
    amount: number;
    category_id?: string;
    description?: string;
    total_returns?: number;
    user_id: string;
    created_at?: string;
    updated_at?: string;
  };
  investment_returns: {
    id: string;
    investment_id: string;
    amount: number;
    date: string;
    user_id: string;
    created_at?: string;
  };
  profiles: {
    id: string;
    name: string;
    avatar_url?: string;
    monthly_income?: number;
    monthly_expense_goal?: number;
    monthly_savings_goal?: number;
    created_at?: string;
    updated_at?: string;
  };
}; 