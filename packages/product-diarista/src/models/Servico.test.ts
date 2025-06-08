import { describe, it, expect, beforeEach } from 'vitest'
import { servicoRepository, Servico, StatusServico } from './Servico'

describe('ServicoRepository', () => {
  beforeEach(() => {
    // Limpar o repositório antes de cada teste
    const repo = servicoRepository as any
    repo.servicos = []
  })

  it('deve criar um novo serviço com ID gerado automaticamente', () => {
    const servicoData = {
      diaristaId: 'diarista-123',
      clienteId: 'cliente-456',
      dataHoraInicio: new Date('2024-01-15T09:00:00'),
      dataHoraFim: new Date('2024-01-15T17:00:00'),
      endereco: 'Rua das Palmeiras, 100',
      valorHora: 25.0,
      horasTotais: 8,
      valorTotal: 200.0,
      descricao: 'Limpeza completa da casa',
      status: StatusServico.AGENDADO
    }

    const servico = servicoRepository.create(servicoData)

    expect(servico).toMatchObject(servicoData)
    expect(servico.id).toBeDefined()
    expect(typeof servico.id).toBe('string')
    expect(servico.id.length).toBeGreaterThan(0)
  })

  it('deve encontrar serviços por ID do diarista', () => {
    const diaristaId = 'diarista-123'
    const servico1 = servicoRepository.create({
      diaristaId,
      clienteId: 'cliente-1',
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Endereço 1',
      valorHora: 20,
      horasTotais: 4,
      valorTotal: 80,
      descricao: 'Serviço 1',
      status: StatusServico.AGENDADO
    })

    const servico2 = servicoRepository.create({
      diaristaId: 'outro-diarista',
      clienteId: 'cliente-2',
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Endereço 2',
      valorHora: 30,
      horasTotais: 6,
      valorTotal: 180,
      descricao: 'Serviço 2',
      status: StatusServico.CONCLUIDO
    })

    const servicosDoDiarista = servicoRepository.findByDiaristaId(diaristaId)

    expect(servicosDoDiarista).toHaveLength(1)
    expect(servicosDoDiarista[0]).toEqual(servico1)
  })

  it('deve encontrar serviços por ID do cliente', () => {
    const clienteId = 'cliente-789'
    const servico1 = servicoRepository.create({
      diaristaId: 'diarista-1',
      clienteId,
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Casa do cliente',
      valorHora: 25,
      horasTotais: 5,
      valorTotal: 125,
      descricao: 'Limpeza semanal',
      status: StatusServico.EM_ANDAMENTO
    })

    const servicosDoCliente = servicoRepository.findByClienteId(clienteId)

    expect(servicosDoCliente).toHaveLength(1)
    expect(servicosDoCliente[0]).toEqual(servico1)
  })

  it('deve atualizar status do serviço', () => {
    const servico = servicoRepository.create({
      diaristaId: 'diarista-123',
      clienteId: 'cliente-456',
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Teste',
      valorHora: 20,
      horasTotais: 3,
      valorTotal: 60,
      descricao: 'Teste',
      status: StatusServico.AGENDADO
    })

    const servicoAtualizado = servicoRepository.update(servico.id, {
      status: StatusServico.CONCLUIDO
    })

    expect(servicoAtualizado).toBeDefined()
    expect(servicoAtualizado?.status).toBe(StatusServico.CONCLUIDO)
  })

  it('deve deletar serviço existente', () => {
    const servico = servicoRepository.create({
      diaristaId: 'diarista-123',
      clienteId: 'cliente-456',
      dataHoraInicio: new Date(),
      dataHoraFim: new Date(),
      endereco: 'Para deletar',
      valorHora: 15,
      horasTotais: 2,
      valorTotal: 30,
      descricao: 'Serviço para deletar',
      status: StatusServico.CANCELADO
    })

    const deleted = servicoRepository.delete(servico.id)
    const foundAfterDelete = servicoRepository.findById(servico.id)

    expect(deleted).toBe(true)
    expect(foundAfterDelete).toBeUndefined()
  })
})