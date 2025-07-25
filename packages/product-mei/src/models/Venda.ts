/**
 * Modelo de Venda para a aplicação
 */
export interface Venda {
  id: number;
  clienteId?: number;
  clienteNome: string;
  data: string;
  descricao: string;
  valor: string;
  formaPagamento: string;
  uuid?: string;
  clienteUuid?: string;
  transaction_id?: string | null; // ID da transação financeira vinculada
}

export const vendasMock: Venda[] = [
  { 
    id: 1, 
    clienteId: 1,
    clienteNome: 'João Silva', 
    data: `10/05/${new Date().getFullYear()}`, 
    descricao: 'Consultoria de Marketing', 
    valor: 'R$ 350,00', 
    formaPagamento: 'PIX' 
  },
  { 
    id: 2, 
    clienteId: 2,
    clienteNome: 'Maria Oliveira', 
    data: `15/05/${new Date().getFullYear()}`, 
    descricao: 'Design de Logo', 
    valor: 'R$ 500,00', 
    formaPagamento: 'Transferência' 
  },
  { 
    id: 3, 
    clienteId: 3,
    clienteNome: 'Carlos Santos', 
    data: `22/05/${new Date().getFullYear()}`, 
    descricao: 'Desenvolvimento de Landing Page', 
    valor: 'R$ 1.200,00', 
    formaPagamento: 'Cartão' 
  },
];