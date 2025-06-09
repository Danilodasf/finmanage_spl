export enum StatusServico {
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDO = 'concluido',
  CANCELADO = 'cancelado'
}

export interface Servico {
  id: string;
  diaristaId: string;
  clienteId: string;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  endereco: string;
  valorHora: number;
  horasTotais: number;
  valorTotal: number;
  descricao: string;
  status: StatusServico;
}

// Repositório básico para Serviço
class ServicoRepository {
  private servicos: Servico[] = [];

  public findAll(): Servico[] {
    return this.servicos;
  }

  public findById(id: string): Servico | undefined {
    return this.servicos.find(servico => servico.id === id);
  }

  public findByDiaristaId(diaristaId: string): Servico[] {
    return this.servicos.filter(servico => servico.diaristaId === diaristaId);
  }

  public findByClienteId(clienteId: string): Servico[] {
    return this.servicos.filter(servico => servico.clienteId === clienteId);
  }

  public create(servico: Omit<Servico, 'id'>): Servico {
    const newServico = {
      ...servico,
      id: Math.random().toString(36).substring(2, 9)
    };
    this.servicos.push(newServico);
    return newServico;
  }

  public update(id: string, servicoData: Partial<Servico>): Servico | undefined {
    const index = this.servicos.findIndex(servico => servico.id === id);
    if (index === -1) return undefined;
    
    this.servicos[index] = { ...this.servicos[index], ...servicoData };
    return this.servicos[index];
  }

  public delete(id: string): boolean {
    const index = this.servicos.findIndex(servico => servico.id === id);
    if (index === -1) return false;
    
    this.servicos.splice(index, 1);
    return true;
  }
}

export const servicoRepository = new ServicoRepository();