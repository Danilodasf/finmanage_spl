import { DIContainer, toast } from '../lib/core-exports';
import { VENDA_SERVICE } from '../lib/di/bootstrap';
import { SupabaseMeiVendaService, Venda, CreateVendaDTO, UpdateVendaDTO } from '../lib/services/SupabaseMeiVendaService';
import { getUuidFromNumericId } from '../lib/utils/uuidUtils';

/**
 * Controlador para gerenciamento de vendas
 * Utiliza injeção de dependência para acessar o serviço de vendas
 */
export class VendaController {
  private static getVendaService(): SupabaseMeiVendaService {
    return DIContainer.get<SupabaseMeiVendaService>(VENDA_SERVICE);
  }

  /**
   * Busca todas as vendas
   */
  static async getAll(): Promise<Venda[]> {
    try {
      const vendaService = this.getVendaService();
      const { data, error } = await vendaService.getAll();
      
      if (error) {
        console.error('Erro ao buscar vendas:', error);
        toast({
          title: 'Erro',
          description: `Não foi possível carregar as vendas: ${error.message}`,
          variant: 'destructive',
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as vendas',
        variant: 'destructive',
      });
      return [];
    }
  }
  
  /**
   * Busca uma venda pelo ID
   * @param id ID da venda
   */
  static async getById(id: string): Promise<Venda | null> {
    try {
      console.log(`VendaController.getById - Buscando venda ${id}`);
      
      // Converter ID numérico para UUID, se necessário
      let uuidId = id;
      if (!id.includes('-')) {
        // Parece ser um ID numérico, tentar converter para UUID
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            uuidId = uuid;
            console.log(`VendaController.getById - Convertendo ID numérico ${id} para UUID ${uuidId}`);
          } else {
            console.error(`VendaController.getById - Não foi possível encontrar UUID para o ID ${id}`);
            toast({
              title: 'Erro',
              description: `Não foi possível encontrar a venda com ID ${id}`,
              variant: 'destructive',
            });
            return null;
          }
        }
      }
      
      const vendaService = this.getVendaService();
      const { data, error } = await vendaService.getById(uuidId);
      
      if (error) {
        console.error(`Erro ao buscar venda ${id}:`, error);
        toast({
          title: 'Erro',
          description: `Não foi possível carregar os detalhes da venda: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar venda ${id}:`, error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da venda',
        variant: 'destructive',
      });
      return null;
    }
  }
  
  /**
   * Cria uma nova venda
   * @param venda Dados da venda
   */
  static async create(venda: CreateVendaDTO): Promise<Venda | null> {
    try {
      console.log('VendaController.create - Criando venda:', venda);
      
      // Converter ID do cliente de numérico para UUID, se necessário
      let vendaDto = { ...venda };
      
      if (venda.cliente_id && !venda.cliente_id.includes('-')) {
        // Parece ser um ID numérico, tentar converter para UUID
        const numericId = parseInt(venda.cliente_id);
        if (!isNaN(numericId)) {
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            vendaDto.cliente_id = uuid;
            console.log(`VendaController.create - Convertendo ID numérico do cliente ${venda.cliente_id} para UUID ${uuid}`);
          } else {
            console.error(`VendaController.create - Não foi possível encontrar UUID para o ID do cliente ${venda.cliente_id}`);
            toast({
              title: 'Erro',
              description: `Não foi possível encontrar o cliente com ID ${venda.cliente_id}`,
              variant: 'destructive',
            });
            return null;
          }
        }
      }
      
      const vendaService = this.getVendaService();
      const { data, error } = await vendaService.create(vendaDto);
      
      if (error) {
        console.error('Erro ao criar venda:', error);
        toast({
          title: 'Erro',
          description: `Não foi possível registrar a venda: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Venda registrada com sucesso',
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a venda',
        variant: 'destructive',
      });
      return null;
    }
  }
  
  /**
   * Atualiza uma venda existente
   * @param id ID da venda
   * @param venda Dados para atualização
   */
  static async update(id: string, venda: UpdateVendaDTO): Promise<Venda | null> {
    try {
      console.log(`VendaController.update - Atualizando venda ${id}:`, venda);
      
      // Converter ID da venda de numérico para UUID, se necessário
      let uuidId = id;
      if (!id.includes('-')) {
        // Parece ser um ID numérico, tentar converter para UUID
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            uuidId = uuid;
            console.log(`VendaController.update - Convertendo ID numérico ${id} para UUID ${uuidId}`);
          } else {
            console.error(`VendaController.update - Não foi possível encontrar UUID para o ID ${id}`);
            toast({
              title: 'Erro',
              description: `Não foi possível encontrar a venda com ID ${id}`,
              variant: 'destructive',
            });
            return null;
          }
        }
      }
      
      // Converter ID do cliente de numérico para UUID, se necessário
      let vendaDto = { ...venda };
      
      if (venda.cliente_id && !venda.cliente_id.includes('-')) {
        // Parece ser um ID numérico, tentar converter para UUID
        const numericId = parseInt(venda.cliente_id);
        if (!isNaN(numericId)) {
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            vendaDto.cliente_id = uuid;
            console.log(`VendaController.update - Convertendo ID numérico do cliente ${venda.cliente_id} para UUID ${uuid}`);
          } else {
            console.error(`VendaController.update - Não foi possível encontrar UUID para o ID do cliente ${venda.cliente_id}`);
            toast({
              title: 'Erro',
              description: `Não foi possível encontrar o cliente com ID ${venda.cliente_id}`,
              variant: 'destructive',
            });
            return null;
          }
        }
      }
      
      const vendaService = this.getVendaService();
      const { data, error } = await vendaService.update(uuidId, vendaDto);
      
      if (error) {
        console.error(`Erro ao atualizar venda ${id}:`, error);
        toast({
          title: 'Erro',
          description: `Não foi possível atualizar a venda: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Venda atualizada com sucesso',
      });
      
      return data;
    } catch (error) {
      console.error(`Erro ao atualizar venda ${id}:`, error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a venda',
        variant: 'destructive',
      });
      return null;
    }
  }
  
  /**
   * Remove uma venda
   * @param id ID da venda
   */
  static async delete(id: string): Promise<boolean> {
    try {
      console.log(`VendaController.delete - Excluindo venda ${id}`);
      
      // Converter ID da venda de numérico para UUID, se necessário
      let uuidId = id;
      if (!id.includes('-')) {
        // Parece ser um ID numérico, tentar converter para UUID
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          const uuid = getUuidFromNumericId(numericId);
          if (uuid) {
            uuidId = uuid;
            console.log(`VendaController.delete - Convertendo ID numérico ${id} para UUID ${uuidId}`);
          } else {
            console.error(`VendaController.delete - Não foi possível encontrar UUID para o ID ${id}`);
            toast({
              title: 'Erro',
              description: `Não foi possível encontrar a venda com ID ${id}`,
              variant: 'destructive',
            });
            return false;
          }
        }
      }
      
      const vendaService = this.getVendaService();
      const { success, error } = await vendaService.delete(uuidId);
      
      if (error) {
        console.error(`Erro ao excluir venda ${id}:`, error);
        toast({
          title: 'Erro',
          description: `Não foi possível excluir a venda: ${error.message}`,
          variant: 'destructive',
        });
        return false;
      }
      
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Venda excluída com sucesso',
        });
      }
      
      return success;
    } catch (error) {
      console.error(`Erro ao excluir venda ${id}:`, error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a venda',
        variant: 'destructive',
      });
      return false;
    }
  }
  
  /**
   * Busca vendas filtradas
   * @param filters Filtros a serem aplicados
   */
  static async getFiltered(filters: {
    cliente_id?: string;
    startDate?: string;
    endDate?: string;
    forma_pagamento?: string;
  }): Promise<Venda[]> {
    try {
      const vendaService = this.getVendaService();
      const { data, error } = await vendaService.getFiltered(filters);
      
      if (error) {
        console.error('Erro ao buscar vendas filtradas:', error);
        toast({
          title: 'Erro',
          description: `Não foi possível aplicar os filtros: ${error.message}`,
          variant: 'destructive',
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendas filtradas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aplicar os filtros',
        variant: 'destructive',
      });
      return [];
    }
  }
  
  /**
   * Calcula o total de vendas em um período
   * @param startDate Data inicial
   * @param endDate Data final
   */
  static async getTotalVendas(startDate?: string, endDate?: string): Promise<number> {
    try {
      const vendaService = this.getVendaService();
      const { total, error } = await vendaService.getTotalVendas(startDate, endDate);
      
      if (error) {
        console.error('Erro ao calcular total de vendas:', error);
        return 0;
      }
      
      return total;
    } catch (error) {
      console.error('Erro ao calcular total de vendas:', error);
      return 0;
    }
  }
} 