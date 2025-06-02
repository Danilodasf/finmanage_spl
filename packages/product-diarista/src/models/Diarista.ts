export interface Diarista {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  specialties: string[];
}

// Repositório básico para Diarista
class DiaristaRepository {
  private diaristas: Diarista[] = [];

  public findAll(): Diarista[] {
    return this.diaristas;
  }

  public findById(id: string): Diarista | undefined {
    return this.diaristas.find(diarista => diarista.id === id);
  }

  public create(diarista: Omit<Diarista, 'id'>): Diarista {
    const newDiarista = {
      ...diarista,
      id: Math.random().toString(36).substring(2, 9)
    };
    this.diaristas.push(newDiarista);
    return newDiarista;
  }

  public update(id: string, diaristaData: Partial<Diarista>): Diarista | undefined {
    const index = this.diaristas.findIndex(diarista => diarista.id === id);
    if (index === -1) return undefined;
    
    this.diaristas[index] = { ...this.diaristas[index], ...diaristaData };
    return this.diaristas[index];
  }

  public delete(id: string): boolean {
    const index = this.diaristas.findIndex(diarista => diarista.id === id);
    if (index === -1) return false;
    
    this.diaristas.splice(index, 1);
    return true;
  }
}

export const diaristaRepository = new DiaristaRepository(); 