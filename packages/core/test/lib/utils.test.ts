import { describe, it, expect } from 'vitest';
import { cn } from '../../src/lib/utils';

describe('Utils - Core', () => {
  it('deve mesclar classes corretamente', () => {
    const result = cn('text-red-500', 'bg-blue-200', 'p-4');
    expect(result).toBe('text-red-500 bg-blue-200 p-4');
  });
});