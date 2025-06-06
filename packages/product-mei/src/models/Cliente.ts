export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj?: string;
  endereco?: string;
  observacoes?: string;
  dataCadastro: string;
}

export const clientesMock: Cliente[] = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 98765-4321',
    cpfCnpj: '123.456.789-00',
    endereco: 'Rua das Flores, 123 - São Paulo/SP',
    dataCadastro: `10/01/${new Date().getFullYear()}`
  },
  {
    id: 2,
    nome: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    telefone: '(11) 91234-5678',
    cpfCnpj: '987.654.321-00',
    endereco: 'Av. Paulista, 1000 - São Paulo/SP',
    dataCadastro: `15/02/${new Date().getFullYear()}`
  },
  {
    id: 3,
    nome: 'Carlos Santos',
    email: 'carlos.santos@email.com',
    telefone: '(21) 99876-5432',
    cpfCnpj: '456.789.123-00',
    dataCadastro: `05/03/${new Date().getFullYear()}`
  }
];