import { Diarista, diaristaRepository } from '../models/Diarista';

class DiaristaController {
  /**
   * Retorna todos os diaristas
   */
  public getDiaristas(): Diarista[] {
    return diaristaRepository.findAll();
  }

  /**
   * Retorna um diarista pelo ID
   */
  public getDiaristaById(id: string): Diarista | undefined {
    return diaristaRepository.findById(id);
  }

  /**
   * Cria um novo diarista
   */
  public createDiarista(diaristaData: Omit<Diarista, 'id'>): Diarista {
    // Aqui poderíamos adicionar validações antes de criar o diarista
    return diaristaRepository.create(diaristaData);
  }

  /**
   * Atualiza um diarista existente
   */
  public updateDiarista(id: string, diaristaData: Partial<Diarista>): Diarista | undefined {
    return diaristaRepository.update(id, diaristaData);
  }

  /**
   * Remove um diarista
   */
  public deleteDiarista(id: string): boolean {
    return diaristaRepository.delete(id);
  }

  /**
   * Adiciona uma especialidade ao diarista
   */
  public addSpecialty(id: string, specialty: string): Diarista | undefined {
    const diarista = this.getDiaristaById(id);
    if (!diarista) return undefined;

    const specialties = [...diarista.specialties];
    if (!specialties.includes(specialty)) {
      specialties.push(specialty);
    }

    return this.updateDiarista(id, { specialties });
  }

  /**
   * Remove uma especialidade do diarista
   */
  public removeSpecialty(id: string, specialty: string): Diarista | undefined {
    const diarista = this.getDiaristaById(id);
    if (!diarista) return undefined;

    const specialties = diarista.specialties.filter(s => s !== specialty);
    return this.updateDiarista(id, { specialties });
  }
}

export const diaristaController = new DiaristaController(); 