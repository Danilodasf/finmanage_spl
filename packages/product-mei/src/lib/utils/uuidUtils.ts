// Mapeamento de UUIDs para IDs numéricos para compatibilidade
const uuidToIdMap = new Map<string, number>();
let nextNumericId = 1;

/**
 * Gera ou recupera um ID numérico a partir de um UUID
 */
export function getNumericIdFromUuid(uuid: string): number {
  // Se já existe um ID mapeado para este UUID, retorná-lo
  if (uuidToIdMap.has(uuid)) {
    return uuidToIdMap.get(uuid) || 0;
  }
  
  // Caso contrário, criar um novo ID numérico
  const numericId = nextNumericId++;
  uuidToIdMap.set(uuid, numericId);
  console.log(`Mapeamento criado: UUID ${uuid} -> ID ${numericId}`);
  return numericId;
}

/**
 * Recupera o UUID original a partir de um ID numérico
 */
export function getUuidFromNumericId(numericId: number): string | undefined {
  for (const [uuid, id] of uuidToIdMap.entries()) {
    if (id === numericId) {
      return uuid;
    }
  }
  return undefined;
}

/**
 * Registra um mapeamento de UUID para ID numérico
 */
export function registerUuidMapping(uuid: string, numericId: number): void {
  uuidToIdMap.set(uuid, numericId);
  console.log(`Mapeamento registrado: UUID ${uuid} -> ID ${numericId}`);
  
  // Atualizar o próximo ID se necessário
  if (numericId >= nextNumericId) {
    nextNumericId = numericId + 1;
  }
}

/**
 * Verifica se uma string é um UUID válido
 */
export function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
} 