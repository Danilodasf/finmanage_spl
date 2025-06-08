import { describe, it, expect, beforeEach } from 'vitest'
import { servicoController } from './ServicoController'
import { servicoRepository, StatusServico } from '../models/Servico'

describe('ServicoController', () => {
  beforeEach(() => {
    // Limpar o repositório antes de cada teste
    const repo = servicoRepository as any
    repo.servicos = []
  })

  it('deve criar um novo serviço com valor total calculado automaticamente', () => {
    const servicoData = {
      diaristaId: 'diarista-123',
      clienteId: 'cliente-456',
      dataHoraInicio: new Date('2024-01-15T08:00:00'),
      dataHoraFim: new Date('2024-01-15T16:00:00'),
      endereco: 'Rua das Acácias, 200',
      valorHora: 30.0,
      horasTotais: 8,
      valorTotal: 0, // Será calculado automaticamente
      descricao: 'Limpeza completa e organização',
      status: StatusServico.AGENDADO
    }

    const servico = servicoController.createServico(servicoData)

    expect(servico.valorTotal).toBe(240.0) // 30 * 8 = 240
    expect(servico.diaristaId).toBe('diarista-123')
    expect(servico.clienteId).toBe('cliente-456')
    expect(servico.status).toBe(StatusServico.AGENDADO)
  })

  it('deve retornar todos os serviços', () => {
    const servico1 = servicoController.createServico({
      diaristaId: 'diarista-1',
      clienteId: 'cliente-1',
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Endereço 1',
      valorHora: 25,
      horasTotais: 4,
      valorTotal: 0,
      descricao: 'Serviço 1',
      status: StatusServico.AGENDADO
    })

    const servico2 = servicoController.createServico({
      diaristaId: 'diarista-2',
      clienteId: 'cliente-2',
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Endereço 2',
      valorHora: 35,
      horasTotais: 6,
      valorTotal: 0,
      descricao: 'Serviço 2',
      status: StatusServico.CONCLUIDO
    })

    const servicos = servicoController.getServicos()

    expect(servicos).toHaveLength(2)
    expect(servicos).toContain(servico1)
    expect(servicos).toContain(servico2)
  })

  it('deve encontrar serviços por ID do diarista', () => {
    const diaristaId = 'diarista-especifico'
    
    servicoController.createServico({
      diaristaId,
      clienteId: 'cliente-1',
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Casa 1',
      valorHora: 20,
      horasTotais: 3,
      valorTotal: 0,
      descricao: 'Limpeza casa 1',
      status: StatusServico.AGENDADO
    })

    servicoController.createServico({
      diaristaId: 'outro-diarista',
      clienteId: 'cliente-2',
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Casa 2',
      valorHora: 25,
      horasTotais: 4,
      valorTotal: 0,
      descricao: 'Limpeza casa 2',
      status: StatusServico.CONCLUIDO
    })

    const servicosDoDiarista = servicoController.getServicosByDiaristaId(diaristaId)

    expect(servicosDoDiarista).toHaveLength(1)
    expect(servicosDoDiarista[0].diaristaId).toBe(diaristaId)
    expect(servicosDoDiarista[0].descricao).toBe('Limpeza casa 1')
  })

  it('deve encontrar serviços por ID do cliente', () => {
    const clienteId = 'cliente-especifico'
    
    servicoController.createServico({
      diaristaId: 'diarista-1',
      clienteId,
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Apartamento do cliente',
      valorHora: 28,
      horasTotais: 5,
      valorTotal: 0,
      descricao: 'Limpeza apartamento',
      status: StatusServico.EM_ANDAMENTO
    })

    servicoController.createServico({
      diaristaId: 'diarista-2',
      clienteId: 'outro-cliente',
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Casa de outro cliente',
      valorHora: 30,
      horasTotais: 6,
      valorTotal: 0,
      descricao: 'Limpeza casa',
      status: StatusServico.AGENDADO
    })

    const servicosDoCliente = servicoController.getServicosByClienteId(clienteId)

    expect(servicosDoCliente).toHaveLength(1)
    expect(servicosDoCliente[0].clienteId).toBe(clienteId)
    expect(servicosDoCliente[0].valorTotal).toBe(140) // 28 * 5 = 140
  })

  it('deve atualizar status do serviço', () => {
    const servico = servicoController.createServico({
      diaristaId: 'diarista-123',
      clienteId: 'cliente-456',
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Casa para atualizar',
      valorHora: 22,
      horasTotais: 4,
      valorTotal: 0,
      descricao: 'Serviço para atualizar',
      status: StatusServico.AGENDADO
    })

    const servicoAtualizado = servicoController.updateServico(servico.id, {
      status: StatusServico.EM_ANDAMENTO
    })

    expect(servicoAtualizado).toBeDefined()
    expect(servicoAtualizado?.status).toBe(StatusServico.EM_ANDAMENTO)
    expect(servicoAtualizado?.valorTotal).toBe(88) // 22 * 4 = 88
  })

  it('deve calcular receita total de um diarista', () => {
    const diaristaId = 'diarista-receita'
    const dataServico = new Date('2024-06-15')
    
    // Criar serviços concluídos
    servicoController.createServico({
      diaristaId,
      clienteId: 'cliente-1',
      dataHoraInicio: dataServico,
      dataHoraFim: dataServico,
      endereco: 'Casa 1',
      valorHora: 25,
      horasTotais: 4,
      valorTotal: 0,
      descricao: 'Serviço 1',
      status: StatusServico.CONCLUIDO
    })

    servicoController.createServico({
      diaristaId,
      clienteId: 'cliente-2',
      dataHoraInicio: dataServico,
      dataHoraFim: dataServico,
      endereco: 'Casa 2',
      valorHora: 30,
      horasTotais: 6,
      valorTotal: 0,
      descricao: 'Serviço 2',
      status: StatusServico.CONCLUIDO
    })

    // Criar serviço não concluído (não deve contar na receita)
    servicoController.createServico({
      diaristaId,
      clienteId: 'cliente-3',
      dataHoraInicio: dataServico,
      dataHoraFim: dataServico,
      endereco: 'Casa 3',
      valorHora: 20,
      horasTotais: 3,
      valorTotal: 0,
      descricao: 'Serviço 3',
      status: StatusServico.AGENDADO
    })

    const dataInicio = new Date('2024-01-01')
    const dataFim = new Date('2024-12-31')
    const receitaTotal = servicoController.calcularFaturamento(diaristaId, dataInicio, dataFim)

    // Apenas serviços concluídos: (25*4) + (30*6) = 100 + 180 = 280
    expect(receitaTotal).toBe(280)
  })
})