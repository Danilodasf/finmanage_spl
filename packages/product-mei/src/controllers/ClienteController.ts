import { DIContainer, toast } from '../lib/core-exports';
import { CLIENTE_SERVICE } from '../lib/di/bootstrap';
import { SupabaseMeiClienteService, Cliente, CreateClienteDTO, UpdateClienteDTO } from '../lib/services/SupabaseMeiClienteService';
import { getUuidFromNumericId } from '../lib/utils/uuidUtils';

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
      console.log(`ClienteController.getById - Buscando cliente ${id}`);
      
      // Converter ID numérico para UUID, se necessário
      let uuidId = id;
      if (!id.includes('-')) {
        // Parece ser um ID numérico, tentar converter para UUID
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            uuidId = uuid;
            console.log(`ClienteController.getById - Convertendo ID numérico ${id} para UUID ${uuidId}`);
          } else {
            console.error(`ClienteController.getById - Não foi possível encontrar UUID para o ID ${id}`);
            return null;
          }
        }
      }
      
      const clienteService = this.getClienteService();
      const { data, error } = await clienteService.getById(uuidId);
      
      if (error) {
        console.error(`Erro ao buscar cliente ${id}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
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
          const errorMsg = 'Este CPF/CNPJ já está cadastrado para outro cliente';
          console.error(errorMsg);
          toast({
            title: 'Erro',
            description: errorMsg,
            variant: 'destructive',
          });
          throw new Error(errorMsg);
        }
      }
      
      const clienteService = this.getClienteService();
      console.log('ClienteController.create - Enviando dados para o serviço:', cliente);
      const { data, error } = await clienteService.create(cliente);
      
      if (error) {
        console.error('Erro ao criar cliente:', error);
        const errorMsg = `Não foi possível cadastrar o cliente: ${error.message}`;
        toast({
          title: 'Erro',
          description: errorMsg,
          variant: 'destructive',
        });
        throw new Error(errorMsg);
      }
      
      if (!data) {
        const errorMsg = 'Não foi possível cadastrar o cliente: resposta vazia do servidor';
        console.error(errorMsg);
        toast({
          title: 'Erro',
          description: errorMsg,
          variant: 'destructive',
        });
        throw new Error(errorMsg);
      }
      
      console.log('Cliente criado com sucesso:', data);
      toast({
        title: 'Sucesso',
        description: 'Cliente cadastrado com sucesso',
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      const errorMsg = error instanceof Error 
        ? `Não foi possível cadastrar o cliente: ${error.message}`
        : 'Não foi possível cadastrar o cliente';
      
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
      throw error; // Propagar o erro para que seja tratado no componente
    }
  }
  
  /**
   * Atualiza um cliente existente
   * @param id ID do cliente
   * @param cliente Dados para atualização
   */
  static async update(id: string, cliente: UpdateClienteDTO): Promise<Cliente | null> {
    try {
      console.log(`ClienteController.update - Atualizando cliente ${id}:`, cliente);
      
      // Converter ID numérico para UUID, se necessário
      let uuidId = id;
      if (!id.includes('-')) {
        // Parece ser um ID numérico, tentar converter para UUID
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            uuidId = uuid;
            console.log(`ClienteController.update - Convertendo ID numérico ${id} para UUID ${uuidId}`);
          } else {
            console.error(`ClienteController.update - Não foi possível encontrar UUID para o ID ${id}`);
            toast({
              title: 'Erro',
              description: `Não foi possível encontrar o cliente com ID ${id}`,
              variant: 'destructive',
            });
            return null;
          }
        }
      }
      
      // Validar CPF/CNPJ
      if (cliente.cpf_cnpj) {
        const clienteService = this.getClienteService();
        const { exists, error: checkError } = await clienteService.checkCpfCnpjExists(cliente.cpf_cnpj, uuidId);
        
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
      const { data, error } = await clienteService.update(uuidId, cliente);
      
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
      console.log(`ClienteController.delete - Excluindo cliente ${id}`);
      
      // Converter ID numérico para UUID, se necessário
      let uuidId = id;
      if (!id.includes('-')) {
        // Parece ser um ID numérico, tentar converter para UUID
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            uuidId = uuid;
            console.log(`ClienteController.delete - Convertendo ID numérico ${id} para UUID ${uuidId}`);
          } else {
            console.error(`ClienteController.delete - Não foi possível encontrar UUID para o ID ${id}`);
            toast({
              title: 'Erro',
              description: `Não foi possível encontrar o cliente com ID ${id}`,
              variant: 'destructive',
            });
            return false;
          }
        }
      }
      
      const clienteService = this.getClienteService();
      const { success, error } = await clienteService.delete(uuidId);
      
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