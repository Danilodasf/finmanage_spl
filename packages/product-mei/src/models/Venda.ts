export interface Venda {
  id: number;
  clienteId: number;
  clienteNome: string;
  data: string;
  descricao: string;
  valor: string;
  formaPagamento: string;
  comprovante?: string;
}

export const vendasMock: Venda[] = [
  { 
    id: 1, 
    clienteId: 1,
    clienteNome: 'João Silva', 
    data: '10/05/2023', 
    descricao: 'Consultoria de Marketing', 
    valor: 'R$ 350,00', 
    formaPagamento: 'PIX' 
  },
  { 
    id: 2, 
    clienteId: 2,
    clienteNome: 'Maria Oliveira', 
    data: '15/05/2023', 
    descricao: 'Design de Logo', 
    valor: 'R$ 500,00', 
    formaPagamento: 'Transferência' 
  },
  { 
    id: 3, 
    clienteId: 3,
    clienteNome: 'Carlos Santos', 
    data: '22/05/2023', 
    descricao: 'Desenvolvimento de Landing Page', 
    valor: 'R$ 1.200,00', 
    formaPagamento: 'Cartão' 
  },
]; 