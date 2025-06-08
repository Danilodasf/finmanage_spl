import { describe, it, expect, beforeEach } from 'vitest'
import { diaristaRepository } from '../src/models/Diarista'

describe('DiaristaRepository', () => {
  beforeEach(() => {
    // Limpar o repositório antes de cada teste
    const repo = diaristaRepository as any
    repo.diaristas = []
  })

  it('deve criar um novo diarista com ID gerado automaticamente', () => {
    const diaristaData = {
      name: 'Maria Silva',
      email: 'maria@email.com',
      cpf: '123.456.789-00',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123',
      specialties: ['limpeza', 'organização']
    }

    const diarista = diaristaRepository.create(diaristaData)

    expect(diarista).toMatchObject(diaristaData)
    expect(diarista.id).toBeDefined()
    expect(typeof diarista.id).toBe('string')
    expect(diarista.id.length).toBeGreaterThan(0)
  })

  it('deve encontrar diarista por ID', () => {
    const diaristaData = {
      name: 'João Santos',
      email: 'joao@email.com',
      cpf: '987.654.321-00',
      phone: '(11) 88888-8888',
      address: 'Av. Principal, 456',
      specialties: ['jardinagem']
    }

    const createdDiarista = diaristaRepository.create(diaristaData)
    const foundDiarista = diaristaRepository.findById(createdDiarista.id)

    expect(foundDiarista).toEqual(createdDiarista)
  })

  it('deve retornar undefined ao buscar diarista inexistente', () => {
    const foundDiarista = diaristaRepository.findById('id-inexistente')
    expect(foundDiarista).toBeUndefined()
  })

  it('deve atualizar dados do diarista', () => {
    const diaristaData = {
      name: 'Ana Costa',
      email: 'ana@email.com',
      cpf: '111.222.333-44',
      phone: '(11) 77777-7777',
      address: 'Rua Nova, 789',
      specialties: ['cozinha']
    }

    const createdDiarista = diaristaRepository.create(diaristaData)
    const updatedData = {
      phone: '(11) 66666-6666',
      specialties: ['cozinha', 'limpeza']
    }

    const updatedDiarista = diaristaRepository.update(createdDiarista.id, updatedData)

    expect(updatedDiarista).toBeDefined()
    expect(updatedDiarista?.phone).toBe('(11) 66666-6666')
    expect(updatedDiarista?.specialties).toEqual(['cozinha', 'limpeza'])
    expect(updatedDiarista?.name).toBe('Ana Costa') // Dados não alterados devem permanecer
  })

  it('deve deletar diarista existente', () => {
    const diaristaData = {
      name: 'Carlos Oliveira',
      email: 'carlos@email.com',
      cpf: '555.666.777-88',
      phone: '(11) 55555-5555',
      address: 'Praça Central, 321',
      specialties: ['manutenção']
    }

    const createdDiarista = diaristaRepository.create(diaristaData)
    const deleted = diaristaRepository.delete(createdDiarista.id)
    const foundAfterDelete = diaristaRepository.findById(createdDiarista.id)

    expect(deleted).toBe(true)
    expect(foundAfterDelete).toBeUndefined()
  })
})