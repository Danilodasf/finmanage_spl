import { describe, it, expect } from 'vitest'
import { Transaction, CreateTransactionData } from '../models/Transaction'
import { Cliente, clientesMock } from '../models/Cliente'
import { Venda, vendasMock } from '../models/Venda'
import { Category } from '../models/Category'
import { DASPayment } from '../models/DASPayment'

describe('Models', () => {
  describe('Transaction Model', () => {
    it('should have correct Transaction interface structure', () => {
      const transaction: Transaction = {
        id: '1',
        type: 'receita',
        date: new Date(),
        value: 1000,
        description: 'Test transaction',
        categoryId: 'cat-1'
      }

      expect(transaction.id).toBeDefined()
      expect(['receita', 'despesa']).toContain(transaction.type)
      expect(transaction.date).toBeInstanceOf(Date)
      expect(typeof transaction.value).toBe('number')
      expect(typeof transaction.description).toBe('string')
      expect(typeof transaction.categoryId).toBe('string')
    })

    it('should have correct CreateTransactionData interface structure', () => {
      const createData: CreateTransactionData = {
        type: 'despesa',
        date: new Date(),
        value: 500,
        description: 'Test expense',
        categoryId: 'cat-2'
      }

      expect(['receita', 'despesa']).toContain(createData.type)
      expect(createData.date).toBeInstanceOf(Date)
      expect(typeof createData.value).toBe('number')
      expect(typeof createData.description).toBe('string')
      expect(typeof createData.categoryId).toBe('string')
      expect(createData.id).toBeUndefined() // Should not have id in create data
    })

    it('should validate transaction types', () => {
      const validTypes = ['receita', 'despesa']
      validTypes.forEach(type => {
        const transaction: Transaction = {
          id: '1',
          type: type as 'receita' | 'despesa',
          date: new Date(),
          value: 100,
          description: 'Test',
          categoryId: 'cat-1'
        }
        expect(validTypes).toContain(transaction.type)
      })
    })
  })

  describe('Cliente Model', () => {
    it('should have correct Cliente interface structure', () => {
      const cliente: Cliente = {
        id: 1,
        nome: 'Test Client',
        email: 'test@example.com',
        telefone: '(11) 99999-9999',
        cpfCnpj: '123.456.789-00',
        endereco: 'Test Address',
        observacoes: 'Test notes',
        dataCadastro: '01/01/2024'
      }

      expect(typeof cliente.id).toBe('number')
      expect(typeof cliente.nome).toBe('string')
      expect(typeof cliente.email).toBe('string')
      expect(typeof cliente.telefone).toBe('string')
      expect(typeof cliente.dataCadastro).toBe('string')
    })

    it('should have valid clientesMock data', () => {
      expect(Array.isArray(clientesMock)).toBe(true)
      expect(clientesMock.length).toBeGreaterThan(0)

      clientesMock.forEach(cliente => {
        expect(typeof cliente.id).toBe('number')
        expect(typeof cliente.nome).toBe('string')
        expect(cliente.nome.length).toBeGreaterThan(0)
        expect(typeof cliente.email).toBe('string')
        expect(cliente.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        expect(typeof cliente.telefone).toBe('string')
        expect(typeof cliente.dataCadastro).toBe('string')
      })
    })

    it('should have optional fields in Cliente', () => {
      const minimalCliente: Cliente = {
        id: 1,
        nome: 'Test',
        email: 'test@test.com',
        telefone: '11999999999',
        dataCadastro: '01/01/2024'
      }

      expect(minimalCliente.cpfCnpj).toBeUndefined()
      expect(minimalCliente.endereco).toBeUndefined()
      expect(minimalCliente.observacoes).toBeUndefined()
    })
  })

  describe('Venda Model', () => {
    it('should have correct Venda interface structure', () => {
      const venda: Venda = {
        id: 1,
        clienteId: 1,
        clienteNome: 'Test Client',
        data: '01/01/2024',
        descricao: 'Test sale',
        valor: 'R$ 1.000,00',
        formaPagamento: 'PIX',
        uuid: 'test-uuid',
        clienteUuid: 'client-uuid',
        transaction_id: 'trans-1'
      }

      expect(typeof venda.id).toBe('number')
      expect(typeof venda.clienteId).toBe('number')
      expect(typeof venda.clienteNome).toBe('string')
      expect(typeof venda.data).toBe('string')
      expect(typeof venda.descricao).toBe('string')
      expect(typeof venda.valor).toBe('string')
      expect(typeof venda.formaPagamento).toBe('string')
    })

    it('should have valid vendasMock data', () => {
      expect(Array.isArray(vendasMock)).toBe(true)
      expect(vendasMock.length).toBeGreaterThan(0)

      vendasMock.forEach(venda => {
        expect(typeof venda.id).toBe('number')
        expect(typeof venda.clienteId).toBe('number')
        expect(typeof venda.clienteNome).toBe('string')
        expect(venda.clienteNome.length).toBeGreaterThan(0)
        expect(typeof venda.data).toBe('string')
        expect(typeof venda.descricao).toBe('string')
        expect(typeof venda.valor).toBe('string')
        expect(venda.valor.length).toBeGreaterThan(0)
        expect(typeof venda.formaPagamento).toBe('string')
      })
    })

    it('should have valid payment methods in vendasMock', () => {
      const validPaymentMethods = ['PIX', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Transferência', 'Cartão']
      
      vendasMock.forEach(venda => {
        expect(validPaymentMethods).toContain(venda.formaPagamento)
      })
    })
  })

  describe('Category Model', () => {
    it('should have correct Category interface structure', () => {
      const category: Category = {
        id: '1',
        name: 'Test Category',
        type: 'receita',
        color: '#FF0000',
        icon: 'TestIcon'
      }

      expect(typeof category.id).toBe('string')
      expect(typeof category.name).toBe('string')
      expect(['receita', 'despesa', 'ambos']).toContain(category.type)
      expect(typeof category.color).toBe('string')
      expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(typeof category.icon).toBe('string')
    })

    it('should validate category types', () => {
      const validTypes = ['receita', 'despesa', 'ambos']
      validTypes.forEach(type => {
        const category: Category = {
          id: '1',
          name: 'Test',
          type: type as 'receita' | 'despesa' | 'ambos',
          color: '#000000',
          icon: 'Icon'
        }
        expect(validTypes).toContain(category.type)
      })
    })
  })

  describe('DASPayment Model', () => {
    it('should have correct DASPayment interface structure', () => {
      const dasPayment: DASPayment = {
        id: '1',
        competencia: '2024-01',
        vencimento: new Date(),
        valor: 89.50,
        numeroDAS: 'DAS202401001',
        dataPagamento: new Date(),
        status: 'Pago'
      }

      expect(typeof dasPayment.id).toBe('string')
      expect(typeof dasPayment.competencia).toBe('string')
      expect(dasPayment.competencia).toMatch(/^\d{4}-\d{2}$/)
      expect(dasPayment.vencimento).toBeInstanceOf(Date)
      expect(typeof dasPayment.valor).toBe('number')
      expect(dasPayment.valor).toBeGreaterThan(0)
      expect(typeof dasPayment.numeroDAS).toBe('string')
      expect(['Pendente', 'Pago', 'Vencido']).toContain(dasPayment.status)
    })

    it('should validate DAS status values', () => {
      const validStatuses = ['Pendente', 'Pago', 'Vencido']
      validStatuses.forEach(status => {
        const dasPayment: DASPayment = {
          id: '1',
          competencia: '2024-01',
          vencimento: new Date(),
          valor: 89.50,
          numeroDAS: 'DAS202401001',
          status: status as 'Pendente' | 'Pago' | 'Vencido'
        }
        expect(validStatuses).toContain(dasPayment.status)
      })
    })

    it('should handle optional dataPagamento', () => {
      const pendingPayment: DASPayment = {
        id: '1',
        competencia: '2024-01',
        vencimento: new Date(),
        valor: 89.50,
        numeroDAS: 'DAS202401001',
        status: 'Pendente'
      }

      expect(pendingPayment.dataPagamento).toBeUndefined()
    })
  })
})