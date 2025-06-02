import { Business, businessRepository } from '../models/Business';

class BusinessController {
  /**
   * Retorna todos os negócios
   */
  public getBusinesses(): Business[] {
    return businessRepository.findAll();
  }

  /**
   * Retorna um negócio pelo ID
   */
  public getBusinessById(id: string): Business | undefined {
    return businessRepository.findById(id);
  }

  /**
   * Retorna um negócio pelo ID do proprietário
   */
  public getBusinessByOwnerId(ownerId: string): Business | undefined {
    return businessRepository.findByOwnerId(ownerId);
  }

  /**
   * Cria um novo negócio
   */
  public createBusiness(businessData: Omit<Business, 'id'>): Business {
    // Aqui poderíamos adicionar validações antes de criar o negócio
    // Por exemplo, validar o CNPJ
    return businessRepository.create(businessData);
  }

  /**
   * Atualiza um negócio existente
   */
  public updateBusiness(id: string, businessData: Partial<Business>): Business | undefined {
    return businessRepository.update(id, businessData);
  }

  /**
   * Remove um negócio
   */
  public deleteBusiness(id: string): boolean {
    return businessRepository.delete(id);
  }

  /**
   * Verifica se o CNPJ é válido (simplificado)
   */
  public validateCNPJ(cnpj: string): boolean {
    // Implementação simplificada - remover caracteres não numéricos
    const numericCNPJ = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (numericCNPJ.length !== 14) {
      return false;
    }
    
    // Em uma aplicação real, faria a validação completa do CNPJ
    // incluindo o cálculo dos dígitos verificadores
    
    return true;
  }
}

export const businessController = new BusinessController(); 