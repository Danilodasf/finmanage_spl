export interface DASPayment {
  id: string;
  competencia: string; // Formato: YYYY-MM
  vencimento: Date;
  valor: number;
  numeroDAS: string;
  dataPagamento?: Date;
  status: 'Pendente' | 'Pago' | 'Vencido';
}

export interface CreateDASPaymentData {
  competencia: string;
  vencimento: Date;
  valor: number;
  numeroDAS: string;
  dataPagamento?: Date;
  status: 'Pendente' | 'Pago' | 'Vencido';
}