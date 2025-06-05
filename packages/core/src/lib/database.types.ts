export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
      }
      clientes: {
        Row: {
          cpf_cnpj: string | null
          created_at: string | null
          data_cadastro: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string | null
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string | null
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
      }
      imposto_das: {
        Row: {
          competencia: string
          comprovante_url: string | null
          created_at: string | null
          data_pagamento: string | null
          id: string
          numero_das: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
          valor: number
          vencimento: string
        }
        Insert: {
          competencia: string
          comprovante_url?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          id?: string
          numero_das?: string | null
          status: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
          valor: number
          vencimento: string
        }
        Update: {
          competencia?: string
          comprovante_url?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          id?: string
          numero_das?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
          valor?: number
          vencimento?: string
        }
      }
      transactions: {
        Row: {
          category_id: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          payment_method: string | null
          type: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          payment_method?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
      }
      vendas: {
        Row: {
          cliente_id: string | null
          comprovante_url: string | null
          created_at: string | null
          data: string
          descricao: string
          forma_pagamento: string
          id: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          data: string
          descricao: string
          forma_pagamento: string
          id?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          cliente_id?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          data?: string
          descricao?: string
          forma_pagamento?: string
          id?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
``` 