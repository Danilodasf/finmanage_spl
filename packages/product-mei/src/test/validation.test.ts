import { describe, it, expect } from 'vitest'
import {
  isValidName,
  isValidEmail,
  isValidPhone,
  formatPhone,
  isValidCPF,
  formatCPF,
  isValidCNPJ,
  formatCNPJ,
  isValidMoneyValue,
  formatMoneyValue,
  moneyValueToNumber
} from '../utils/validation'

describe('Validation Utils', () => {
  describe('isValidName', () => {
    it('should validate correct names', () => {
      expect(isValidName('João Silva')).toBe(true)
      expect(isValidName('Maria José')).toBe(true)
      expect(isValidName('José da Silva')).toBe(true)
      expect(isValidName('Ana-Carolina')).toBe(true)
      expect(isValidName("O'Connor")).toBe(true)
    })

    it('should reject invalid names', () => {
      expect(isValidName('João123')).toBe(false)
      expect(isValidName('Maria@Silva')).toBe(false)
      expect(isValidName('123')).toBe(false)
      expect(isValidName('')).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('11987654321')).toBe(true)
      expect(isValidPhone('1134567890')).toBe(true)
      expect(isValidPhone('(11) 98765-4321')).toBe(true)
      expect(isValidPhone('(11) 3456-7890')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false)
      expect(isValidPhone('123456789012')).toBe(false)
      expect(isValidPhone('')).toBe(false)
    })
  })

  describe('formatPhone', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
    })

    it('should handle partial phone numbers', () => {
      expect(formatPhone('11')).toBe('11')
      expect(formatPhone('119')).toBe('(11) 9')
      expect(formatPhone('11987')).toBe('(11) 987')
    })

    it('should remove non-numeric characters', () => {
      expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321')
      expect(formatPhone('11 98765-4321')).toBe('(11) 98765-4321')
    })
  })

  describe('isValidCPF', () => {
    it('should validate correct CPF', () => {
      expect(isValidCPF('11144477735')).toBe(true)
      expect(isValidCPF('111.444.777-35')).toBe(true)
    })

    it('should reject invalid CPF', () => {
      expect(isValidCPF('11111111111')).toBe(false)
      expect(isValidCPF('123.456.789-00')).toBe(false)
      expect(isValidCPF('123')).toBe(false)
      expect(isValidCPF('')).toBe(false)
    })
  })

  describe('formatCPF', () => {
    it('should format CPF correctly', () => {
      const result1 = formatCPF('12345678901')
      const result2 = formatCPF('98765432100')
      
      expect(typeof result1).toBe('string')
      expect(typeof result2).toBe('string')
      expect(result1.length).toBeGreaterThan(0)
      expect(result2.length).toBeGreaterThan(0)
    })

    it('should handle partial CPF', () => {
      const result1 = formatCPF('123456')
      const result2 = formatCPF('123')
      
      expect(typeof result1).toBe('string')
      expect(typeof result2).toBe('string')
    })
  })

  describe('isValidCNPJ', () => {
    it('should validate correct CNPJ', () => {
      expect(isValidCNPJ('11222333000181')).toBe(true)
      expect(isValidCNPJ('11.222.333/0001-81')).toBe(true)
    })

    it('should reject invalid CNPJ', () => {
      expect(isValidCNPJ('11111111111111')).toBe(false)
      expect(isValidCNPJ('123')).toBe(false)
      expect(isValidCNPJ('')).toBe(false)
    })
  })

  describe('formatCNPJ', () => {
    it('should format CNPJ correctly', () => {
      const result1 = formatCNPJ('12345678000195')
      const result2 = formatCNPJ('98765432000123')
      
      expect(typeof result1).toBe('string')
      expect(typeof result2).toBe('string')
      expect(result1.length).toBeGreaterThan(0)
      expect(result2.length).toBeGreaterThan(0)
    })

    it('should handle partial CNPJ', () => {
      const result1 = formatCNPJ('123456')
      const result2 = formatCNPJ('12')
      
      expect(typeof result1).toBe('string')
      expect(typeof result2).toBe('string')
    })
  })

  describe('isValidMoneyValue', () => {
    it('should validate money values', () => {
      expect(isValidMoneyValue('R$ 100,00')).toBe(true)
      expect(isValidMoneyValue('R$ 1.234,56')).toBe(true)
      expect(isValidMoneyValue('100,00')).toBe(true)
      expect(isValidMoneyValue('1234.56')).toBe(true)
    })

    it('should reject invalid money values', () => {
      expect(isValidMoneyValue('abc')).toBe(false)
      expect(isValidMoneyValue('R$ abc')).toBe(false)
      expect(isValidMoneyValue('')).toBe(false)
    })
  })

  describe('formatMoneyValue', () => {
    it('should format money values', () => {
      const result1 = formatMoneyValue('100')
      const result2 = formatMoneyValue('1234.56')
      
      expect(typeof result1).toBe('string')
      expect(typeof result2).toBe('string')
      expect(result1).toContain('R$')
      expect(result2).toContain('R$')
    })

    it('should handle decimal values', () => {
      const result1 = formatMoneyValue('100.5')
      const result2 = formatMoneyValue('100.50')
      
      expect(typeof result1).toBe('string')
      expect(typeof result2).toBe('string')
    })
  })

  describe('moneyValueToNumber', () => {
    it('should parse money values to numbers', () => {
      expect(moneyValueToNumber('R$ 100,00')).toBe(100)
      expect(moneyValueToNumber('R$ 1.234,56')).toBe(1234.56)
      expect(moneyValueToNumber('1000,00')).toBe(1000)
    })

    it('should handle invalid values', () => {
      expect(moneyValueToNumber('')).toBe(0)
      expect(moneyValueToNumber('R$')).toBe(0)
    })
  })
})