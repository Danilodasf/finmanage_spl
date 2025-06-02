import { describe, it, expect } from 'vitest';
import { cn } from '../../src/lib/utils';

describe('Utils - cn function', () => {
  it('should merge classes correctly', () => {
    const result = cn('text-red-500', 'bg-blue-200', 'p-4');
    expect(result).toBe('text-red-500 bg-blue-200 p-4');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isPrimary = false;

    const result = cn(
      'btn',
      isActive && 'btn-active',
      isPrimary && 'btn-primary'
    );

    expect(result).toBe('btn btn-active');
    expect(result).not.toContain('btn-primary');
  });

  it('should handle empty inputs', () => {
    const result = cn('', null, undefined, 'valid-class');
    expect(result).toBe('valid-class');
  });
}); 