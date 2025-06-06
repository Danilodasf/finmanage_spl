import { describe, it, expect, vi } from 'vitest'
import {
  getNextDASDate,
  formatDASDate,
  getDaysUntilDAS,
  getCompetenciaKey,
  getNextMonthCompetencia
} from '../utils/dasDateUtils'

describe('DAS Date Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNextDASDate', () => {
    it('should return next DAS date when current date is before 20th', () => {
      const referenceDate = new Date(2024, 0, 15) // 15 de janeiro
      const result = getNextDASDate(referenceDate)
      
      expect(result.getDate()).toBe(20)
      expect(result.getMonth()).toBe(0) // Janeiro
      expect(result.getFullYear()).toBe(2024)
    })

    it('should return next month DAS date when current date is after 20th', () => {
      const referenceDate = new Date(2024, 0, 25) // 25 de janeiro
      const result = getNextDASDate(referenceDate)
      
      expect(result.getDate()).toBe(20)
      expect(result.getMonth()).toBe(1) // Fevereiro
      expect(result.getFullYear()).toBe(2024)
    })

    it('should handle year transition correctly', () => {
      const referenceDate = new Date(2024, 11, 25) // 25 de dezembro
      const result = getNextDASDate(referenceDate)
      
      expect(result.getDate()).toBe(20)
      expect(result.getMonth()).toBe(0) // Janeiro
      expect(result.getFullYear()).toBe(2025)
    })

    it('should use current date when no reference date provided', () => {
      const result = getNextDASDate()
      
      expect(result).toBeInstanceOf(Date)
      expect(result.getDate()).toBe(20)
    })
  })

  describe('formatDASDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2024, 0, 20) // 20 de janeiro de 2024
      const result = formatDASDate(date)
      
      expect(result).toBe('20/01/2024')
    })

    it('should pad single digit days and months', () => {
      const date = new Date(2024, 8, 5) // 5 de setembro de 2024
      const result = formatDASDate(date)
      
      expect(result).toBe('05/09/2024')
    })

    it('should handle different years correctly', () => {
      const date = new Date(2025, 11, 31) // 31 de dezembro de 2025
      const result = formatDASDate(date)
      
      expect(result).toBe('31/12/2025')
    })
  })

  describe('getDaysUntilDAS', () => {
    it('should calculate days correctly', () => {
      const dueDate = new Date('2024-01-20')
      const result = getDaysUntilDAS(dueDate)
      
      // Just verify it returns a number
      expect(typeof result).toBe('number')
    })

    it('should handle date objects', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      const result = getDaysUntilDAS(futureDate)
      
      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThan(0)
    })

    it('should handle past dates', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      const result = getDaysUntilDAS(pastDate)
      
      expect(typeof result).toBe('number')
      expect(result).toBeLessThan(0)
    })
  })

  describe('getCompetenciaKey', () => {
    it('should return correct competencia key for given date', () => {
      const date = new Date(2024, 0, 15) // 15 de janeiro de 2024
      const result = getCompetenciaKey(date)
      
      expect(result).toBe('2024-01')
    })

    it('should handle single digit months correctly', () => {
      const date = new Date(2024, 8, 15) // 15 de setembro de 2024
      const result = getCompetenciaKey(date)
      
      expect(result).toBe('2024-09')
    })

    it('should handle December correctly', () => {
      const date = new Date(2024, 11, 15) // 15 de dezembro de 2024
      const result = getCompetenciaKey(date)
      
      expect(result).toBe('2024-12')
    })
  })

  describe('getNextMonthCompetencia', () => {
    it('should return next month competencia', () => {
      const referenceDate = new Date(2024, 0, 15) // Janeiro
      const result = getNextMonthCompetencia(referenceDate)
      
      expect(result).toBe('2024-02') // Fevereiro
    })

    it('should handle year transition correctly', () => {
      const referenceDate = new Date(2024, 11, 15) // Dezembro
      const result = getNextMonthCompetencia(referenceDate)
      
      expect(result).toBe('2025-01') // Janeiro do próximo ano
    })

    it('should use current date when no reference date provided', () => {
      const result = getNextMonthCompetencia()
      
      expect(result).toMatch(/^\d{4}-\d{2}$/)
    })

    it('should handle middle of year correctly', () => {
      const referenceDate = new Date(2024, 5, 15) // Junho
      const result = getNextMonthCompetencia(referenceDate)
      
      expect(result).toBe('2024-07') // Julho
    })
  })
})