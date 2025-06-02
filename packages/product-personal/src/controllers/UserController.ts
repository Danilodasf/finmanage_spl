import { User, userRepository } from '../models/User';

class UserController {
  /**
   * Retorna todos os usuários
   */
  public getUsers(): User[] {
    return userRepository.findAll();
  }

  /**
   * Retorna um usuário pelo ID
   */
  public getUserById(id: string): User | undefined {
    return userRepository.findById(id);
  }

  /**
   * Cria um novo usuário
   */
  public createUser(userData: Omit<User, 'id'>): User {
    // Aqui poderíamos adicionar validações antes de criar o usuário
    return userRepository.create(userData);
  }

  /**
   * Atualiza um usuário existente
   */
  public updateUser(id: string, userData: Partial<User>): User | undefined {
    return userRepository.update(id, userData);
  }

  /**
   * Remove um usuário
   */
  public deleteUser(id: string): boolean {
    return userRepository.delete(id);
  }
}

export const userController = new UserController(); 