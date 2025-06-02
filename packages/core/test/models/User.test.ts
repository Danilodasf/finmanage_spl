import { describe, it, expect } from 'vitest';
import { User } from '../../src/models/User';

describe('User Model', () => {
  it('should validate a valid User object', () => {
    const user: User = {
      id: 'user-123',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '11987654321',
      photoUrl: 'https://example.com/photo.jpg',
      preferredCurrency: 'BRL'
    };

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name', 'João Silva');
    expect(user).toHaveProperty('email', 'joao@example.com');
    expect(user).toHaveProperty('phone', '11987654321');
    expect(user).toHaveProperty('photoUrl', 'https://example.com/photo.jpg');
    expect(user).toHaveProperty('preferredCurrency', 'BRL');
  });

  it('should handle optional properties', () => {
    const user: User = {
      id: 'user-456',
      name: 'Maria Santos',
      email: 'maria@example.com',
      preferredCurrency: 'BRL'
    };

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name', 'Maria Santos');
    expect(user).toHaveProperty('email', 'maria@example.com');
    expect(user).toHaveProperty('preferredCurrency', 'BRL');
    expect(user.phone).toBeUndefined();
    expect(user.photoUrl).toBeUndefined();
  });
}); 