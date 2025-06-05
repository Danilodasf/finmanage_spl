import { DIContainer, toast } from '../lib/core-exports';
import { CLIENTE_SERVICE } from '../lib/di/bootstrap';
import { SupabaseMeiClienteService, Cliente, CreateClienteDTO, UpdateClienteDTO } from '../lib/services/SupabaseMeiClienteService';

/**
 * Controlador para gerenciamento de clientes
 * Utiliza injeção de dependência para acessar o serviço de clientes
 */
export class ClienteController {
  private static getClienteService(): SupabaseMeiClienteService {
    return DIContainer.get<SupabaseMeiClienteService>(CLIENTE_SERVICE);
  }

  /**
   * Busca todos os clientes
   */
  static async getAll(): Promise<Cliente[]> {
    try {
      const clienteService = this.getClienteService();
      const { data, error } = await clienteService.getAll();
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        toast({
          title: 'Erro',
          description: `Não foi possível carregar os clientes: ${error.message}`,
          variant: 'destructive',
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os clientes',
        variant: 'destructive',
      });
      return [];
    }
  }
  
  /**
   * Busca um cliente pelo ID
   * @param id ID do cliente
   */
  static async getById(id: string): Promise<Cliente | null> {
    try {
      const clienteService = this.getClienteService();
      const { data, error } = await clienteService.getById(id);
      
      if (error) {
        console.error(`Erro ao buscar cliente ${id}:`, error);
        toast({
          title: 'Erro',
          description: `Não foi possível carregar os detalhes do cliente: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do cliente',
        variant: 'destructive',
      });
      return null;
    }
  }
  
  /**
   * Cria um novo cliente
   * @param cliente Dados do cliente
   */
  static async create(cliente: CreateClienteDTO): Promise<Cliente | null> {
    try {
      // Validar CPF/CNPJ
      if (cliente.cpf_cnpj) {
        const clienteService = this.getClienteService();
        const { exists, error: checkError } = await clienteService.checkCpfCnpjExists(cliente.cpf_cnpj);
        
        if (checkError) {
          console.error('Erro ao verificar CPF/CNPJ:', checkError);
        } else if (exists) {
          toast({
            title: 'Erro',
            description: 'Este CPF/CNPJ já está cadastrado para outro cliente',
            variant: 'destructive',
          });
          return null;
        }
      }
      
      const clienteService = this.getClienteService();
      const { data, error } = await clienteService.create(cliente);
      
      if (error) {
        console.error('Erro ao criar cliente:', error);
        toast({
          title: 'Erro',
          description: `Não foi possível cadastrar o cliente: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Cliente cadastrado com sucesso',
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar o cliente',
        variant: 'destructive',
      });
      return null;
    }
  }
  
  /**
   * Atualiza um cliente existente
   * @param id ID do cliente
   * @param cliente Dados para atualização
   */
  static async update(id: string, cliente: UpdateClienteDTO): Promise<Cliente | null> {
    try {
      // Validar CPF/CNPJ
      if (cliente.cpf_cnpj) {
        const clienteService = this.getClienteService();
        const { exists, error: checkError } = await clienteService.checkCpfCnpjExists(cliente.cpf_cnpj, id);
        
        if (checkError) {
          console.error('Erro ao verificar CPF/CNPJ:', checkError);
        } else if (exists) {
          toast({
            title: 'Erro',
            description: 'Este CPF/CNPJ já está cadastrado para outro cliente',
            variant: 'destructive',
          });
          return null;
        }
      }
      
      const clienteService = this.getClienteService();
      const { data, error } = await clienteService.update(id, cliente);
      
      if (error) {
        console.error(`Erro ao atualizar cliente ${id}:`, error);
        toast({
          title: 'Erro',
          description: `Não foi possível atualizar o cliente: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso',
      });
      
      return data;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o cliente',
        variant: 'destructive',
      });
      return null;
    }
  }
  
  /**
   * Remove um cliente
   * @param id ID do cliente
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const clienteService = this.getClienteService();
      const { success, error } = await clienteService.delete(id);
      
      if (error) {
        console.error(`Erro ao excluir cliente ${id}:`, error);
        toast({
          title: 'Erro',
          description: `Não foi possível excluir o cliente: ${error.message}`,
          variant: 'destructive',
        });
        return false;
      }
      
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Cliente excluído com sucesso',
        });
      }
      
      return success;
    } catch (error) {
      console.error(`Erro ao excluir cliente ${id}:`, error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cliente',
        variant: 'destructive',
      });
      return false;
    }
  }
  
  /**
   * Busca clientes por nome
   * @param nome Nome para pesquisa
   */
  static async searchByName(nome: string): Promise<Cliente[]> {
    try {
      const clienteService = this.getClienteService();
      const { data, error } = await clienteService.searchByName(nome);
      
      if (error) {
        console.error('Erro ao buscar clientes por nome:', error);
        toast({
          title: 'Erro',
          description: `Não foi possível realizar a pesquisa: ${error.message}`,
          variant: 'destructive',
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar clientes por nome:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível realizar a pesquisa',
        variant: 'destructive',
      });
      return [];
    }
  }
} 