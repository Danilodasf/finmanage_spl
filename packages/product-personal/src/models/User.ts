export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class UserModel {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  static validateRegisterData(data: RegisterData): string[] {
    const errors: string[] = [];

    if (!data.name.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!this.validateEmail(data.email)) {
      errors.push('Email inválido');
    }

    if (!this.validatePassword(data.password)) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (data.password !== data.confirmPassword) {
      errors.push('Senhas não coincidem');
    }

    return errors;
  }

  static validateLoginData(data: LoginCredentials): string[] {
    const errors: string[] = [];

    if (!this.validateEmail(data.email)) {
      errors.push('Email inválido');
    }

    if (!data.password) {
      errors.push('Senha é obrigatória');
    }

    return errors;
  }
}

// Simulação de repositório em memória
class UserRepository {
  private users: User[] = [];

  public findAll(): User[] {
    return this.users;
  }

  public findById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  public create(user: Omit<User, 'id'>): User {
    const newUser = {
      ...user,
      id: Math.random().toString(36).substring(2, 9)
    };
    this.users.push(newUser);
    return newUser;
  }

  public update(id: string, userData: Partial<User>): User | undefined {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;
    
    this.users[index] = { ...this.users[index], ...userData };
    return this.users[index];
  }

  public delete(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }
}

export const userRepository = new UserRepository(); 