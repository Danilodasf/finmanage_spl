export interface Business {
  id: string;
  ownerId: string;
  cnpj: string;
  businessName: string;
  tradeName: string;
  activity: string;
  foundingDate: Date;
  phone: string;
  email: string;
  address: string;
}

// Simulação de repositório em memória
class BusinessRepository {
  private businesses: Business[] = [];

  public findAll(): Business[] {
    return this.businesses;
  }

  public findById(id: string): Business | undefined {
    return this.businesses.find(business => business.id === id);
  }

  public findByOwnerId(ownerId: string): Business | undefined {
    return this.businesses.find(business => business.ownerId === ownerId);
  }

  public create(business: Omit<Business, 'id'>): Business {
    const newBusiness = {
      ...business,
      id: Math.random().toString(36).substring(2, 9)
    };
    this.businesses.push(newBusiness);
    return newBusiness;
  }

  public update(id: string, businessData: Partial<Business>): Business | undefined {
    const index = this.businesses.findIndex(business => business.id === id);
    if (index === -1) return undefined;
    
    this.businesses[index] = { ...this.businesses[index], ...businessData };
    return this.businesses[index];
  }

  public delete(id: string): boolean {
    const index = this.businesses.findIndex(business => business.id === id);
    if (index === -1) return false;
    
    this.businesses.splice(index, 1);
    return true;
  }
}

export const businessRepository = new BusinessRepository(); 