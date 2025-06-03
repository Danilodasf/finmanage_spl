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