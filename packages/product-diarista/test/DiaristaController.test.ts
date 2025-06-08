import { describe, it, expect, beforeEach } from 'vitest'
import { diaristaController } from '../src/controllers/DiaristaController'
import { diaristaRepository } from '../src/models/Diarista'

describe('DiaristaController', () => {
  beforeEach(() => {
    // Limpar o repositório antes de cada teste
    const repo = diaristaRepository as any
    repo.diaristas = []
  })

  it('deve criar um novo diarista através do controller', () => {
    const diaristaData = {
      name: 'Fernanda Lima',
      email: 'fernanda@email.com',
      cpf: '123.456.789-10',
      phone: '(11) 91234-5678',
      address: 'Rua dos Testes, 123',
      specialties: ['limpeza', 'organização']
    }

    const diarista = diaristaController.createDiarista(diaristaData)

    expect(diarista).toMatchObject(diaristaData)
    expect(diarista.id).toBeDefined()
    expect(typeof diarista.id).toBe('string')
  })

  it('deve retornar todos os diaristas', () => {
    const diarista1 = diaristaController.createDiarista({
      name: 'Diarista 1',
      email: 'diarista1@email.com',
      cpf: '111.111.111-11',
      phone: '(11) 11111-1111',
      address: 'Endereço 1',
      specialties: ['limpeza']
    })

    const diarista2 = diaristaController.createDiarista({
      name: 'Diarista 2',
      email: 'diarista2@email.com',
      cpf: '222.222.222-22',
      phone: '(11) 22222-2222',
      address: 'Endereço 2',
      specialties: ['jardinagem']
    })

    const diaristas = diaristaController.getDiaristas()

    expect(diaristas).toHaveLength(2)
    expect(diaristas).toContain(diarista1)
    expect(diaristas).toContain(diarista2)
  })

  it('deve encontrar diarista por ID', () => {
    const diaristaData = {
      name: 'Roberto Silva',
      email: 'roberto@email.com',
      cpf: '333.333.333-33',
      phone: '(11) 33333-3333',
      address: 'Rua Roberto, 456',
      specialties: ['manutenção']
    }

    const createdDiarista = diaristaController.createDiarista(diaristaData)
    const foundDiarista = diaristaController.getDiaristaById(createdDiarista.id)

    expect(foundDiarista).toEqual(createdDiarista)
  })

  it('deve atualizar dados do diarista', () => {
    const diarista = diaristaController.createDiarista({
      name: 'Lucia Santos',
      email: 'lucia@email.com',
      cpf: '444.444.444-44',
      phone: '(11) 44444-4444',
      address: 'Av. Lucia, 789',
      specialties: ['cozinha']
    })

    const updatedData = {
      phone: '(11) 99999-9999',
      address: 'Nova Av. Lucia, 999'
    }

    const updatedDiarista = diaristaController.updateDiarista(diarista.id, updatedData)

    expect(updatedDiarista).toBeDefined()
    expect(updatedDiarista?.phone).toBe('(11) 99999-9999')
    expect(updatedDiarista?.address).toBe('Nova Av. Lucia, 999')
    expect(updatedDiarista?.name).toBe('Lucia Santos') // Dados não alterados devem permanecer
  })

  it('deve adicionar especialidade ao diarista', () => {
    const diarista = diaristaController.createDiarista({
      name: 'Pedro Costa',
      email: 'pedro@email.com',
      cpf: '555.555.555-55',
      phone: '(11) 55555-5555',
      address: 'Rua Pedro, 321',
      specialties: ['limpeza']
    })

    const updatedDiarista = diaristaController.addSpecialty(diarista.id, 'organização')

    expect(updatedDiarista).toBeDefined()
    expect(updatedDiarista?.specialties).toContain('limpeza')
    expect(updatedDiarista?.specialties).toContain('organização')
    expect(updatedDiarista?.specialties).toHaveLength(2)
  })

  it('não deve adicionar especialidade duplicada', () => {
    const diarista = diaristaController.createDiarista({
      name: 'Carla Oliveira',
      email: 'carla@email.com',
      cpf: '666.666.666-66',
      phone: '(11) 66666-6666',
      address: 'Rua Carla, 654',
      specialties: ['jardinagem']
    })

    const updatedDiarista = diaristaController.addSpecialty(diarista.id, 'jardinagem')

    expect(updatedDiarista).toBeDefined()
    expect(updatedDiarista?.specialties).toEqual(['jardinagem'])
    expect(updatedDiarista?.specialties).toHaveLength(1)
  })

  it('deve deletar diarista', () => {
    const diarista = diaristaController.createDiarista({
      name: 'Marcos Lima',
      email: 'marcos@email.com',
      cpf: '777.777.777-77',
      phone: '(11) 77777-7777',
      address: 'Rua Marcos, 987',
      specialties: ['limpeza']
    })

    const deleted = diaristaController.deleteDiarista(diarista.id)
    const foundAfterDelete = diaristaController.getDiaristaById(diarista.id)

    expect(deleted).toBe(true)
    expect(foundAfterDelete).toBeUndefined()
  })
})