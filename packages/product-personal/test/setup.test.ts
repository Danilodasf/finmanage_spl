import { describe, it, expect } from 'vitest';

describe('Test Environment Setup', () => {
  it('should run tests successfully', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).toBe('test');
  });

  it('should handle truthiness checks', () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
  });
}); 