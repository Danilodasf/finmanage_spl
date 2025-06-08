import { describe, it, expect } from 'vitest'
import { cn } from '../src/lib/utils'

describe('cn utility function', () => {
  it('deve combinar classes CSS simples', () => {
    const result = cn('class1', 'class2', 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('deve lidar com valores undefined e null', () => {
    const result = cn('class1', undefined, 'class2', null, 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('deve lidar com valores booleanos condicionais', () => {
    const isActive = true
    const isDisabled = false
    
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    )
    
    expect(result).toBe('base-class active-class')
  })

  it('deve mesclar classes conflitantes do Tailwind CSS', () => {
    // O tailwind-merge deve resolver conflitos de classes
    const result = cn('p-4', 'p-2') // padding conflitante
    expect(result).toBe('p-2') // Deve manter apenas a última
  })

  it('deve lidar com objetos de classes condicionais', () => {
    const result = cn({
      'base-class': true,
      'conditional-class': true,
      'false-class': false
    })
    
    expect(result).toBe('base-class conditional-class')
  })

  it('deve lidar com arrays de classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('deve retornar string vazia para entrada vazia', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('deve lidar com casos complexos mistos', () => {
    const isButton = true
    const isPrimary = true
    const isDisabled = false
    
    const result = cn(
      'btn',
      {
        'btn-primary': isPrimary,
        'btn-disabled': isDisabled
      },
      isButton && 'interactive',
      ['rounded', 'shadow'],
      'hover:bg-blue-600'
    )
    
    expect(result).toContain('btn')
    expect(result).toContain('btn-primary')
    expect(result).toContain('interactive')
    expect(result).toContain('rounded')
    expect(result).toContain('shadow')
    expect(result).toContain('hover:bg-blue-600')
    expect(result).not.toContain('btn-disabled')
  })

  it('deve resolver conflitos de margin do Tailwind', () => {
    const result = cn('m-2', 'm-4', 'mx-6')
    // tailwind-merge deve resolver estes conflitos apropriadamente
    expect(result).toContain('mx-6')
    expect(result).toContain('m-4')
  })

  it('deve manter classes não conflitantes', () => {
    const result = cn('text-red-500', 'bg-blue-100', 'border-gray-300')
    expect(result).toBe('text-red-500 bg-blue-100 border-gray-300')
  })
})