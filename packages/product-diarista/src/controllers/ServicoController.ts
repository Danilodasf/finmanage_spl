import { Servico, servicoRepository, StatusServico } from '../models/Servico';

class ServicoController {
  /**
   * Retorna todos os serviços
   */
  public getServicos(): Servico[] {
    return servicoRepository.findAll();
  }

  /**
   * Retorna serviços de um diarista
   */
  public getServicosByDiaristaId(diaristaId: string): Servico[] {
    return servicoRepository.findByDiaristaId(diaristaId);
  }

  /**
   * Retorna serviços de um cliente
   */
  public getServicosByClienteId(clienteId: string): Servico[] {
    return servicoRepository.findByClienteId(clienteId);
  }

  /**
   * Retorna um serviço pelo ID
   */
  public getServicoById(id: string): Servico | undefined {
    return servicoRepository.findById(id);
  }

  /**
   * Cria um novo serviço
   */
  public createServico(servicoData: Omit<Servico, 'id'>): Servico {
    // Validar os dados antes de criar o serviço
    // Por exemplo, verificar se as datas são válidas
    
    // Calcular o valor total baseado nas horas e valor por hora
    const valorTotal = servicoData.horasTotais * servicoData.valorHora;
    
    return servicoRepository.create({
      ...servicoData,
      valorTotal
    });
  }

  /**
   * Atualiza um serviço existente
   */
  public updateServico(id: string, servicoData: Partial<Servico>): Servico | undefined {
    // Se atualizou horas ou valor hora, recalcular o valor total
    const servico = this.getServicoById(id);
    if (!servico) return undefined;
    
    let newData = { ...servicoData };
    
    if (servicoData.horasTotais !== undefined || servicoData.valorHora !== undefined) {
      const horasTotais = servicoData.horasTotais ?? servico.horasTotais;
      const valorHora = servicoData.valorHora ?? servico.valorHora;
      
      newData = {
        ...newData,
        valorTotal: horasTotais * valorHora
      };
    }
    
    return servicoRepository.update(id, newData);
  }

  /**
   * Remove um serviço
   */
  public deleteServico(id: string): boolean {
    return servicoRepository.delete(id);
  }

  /**
   * Inicia um serviço (muda o status para EM_ANDAMENTO)
   */
  public iniciarServico(id: string): Servico | undefined {
    const servico = this.getServicoById(id);
    if (!servico) return undefined;
    
    if (servico.status !== StatusServico.AGENDADO) {
      throw new Error('Apenas serviços agendados podem ser iniciados');
    }
    
    return this.updateServico(id, { 
      status: StatusServico.EM_ANDAMENTO,
      dataHoraInicio: new Date()
    });
  }

  /**
   * Conclui um serviço (muda o status para CONCLUIDO)
   */
  public concluirServico(id: string): Servico | undefined {
    const servico = this.getServicoById(id);
    if (!servico) return undefined;
    
    if (servico.status !== StatusServico.EM_ANDAMENTO) {
      throw new Error('Apenas serviços em andamento podem ser concluídos');
    }
    
    return this.updateServico(id, { 
      status: StatusServico.CONCLUIDO,
      dataHoraFim: new Date()
    });
  }

  /**
   * Cancela um serviço
   */
  public cancelarServico(id: string): Servico | undefined {
    const servico = this.getServicoById(id);
    if (!servico) return undefined;
    
    if (servico.status === StatusServico.CONCLUIDO) {
      throw new Error('Serviços concluídos não podem ser cancelados');
    }
    
    return this.updateServico(id, { status: StatusServico.CANCELADO });
  }

  /**
   * Calcula o faturamento total de um diarista por período
   */
  public calcularFaturamento(diaristaId: string, dataInicio: Date, dataFim: Date): number {
    const servicos = this.getServicosByDiaristaId(diaristaId);
    
    return servicos
      .filter(servico => {
        const dataServico = new Date(servico.dataHoraInicio);
        return (
          servico.status === StatusServico.CONCLUIDO &&
          dataServico >= dataInicio &&
          dataServico <= dataFim
        );
      })
      .reduce((total, servico) => total + servico.valorTotal, 0);
  }
}

export const servicoController = new ServicoController(); 