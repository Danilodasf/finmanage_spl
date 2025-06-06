/**
 * Utilitários para cálculo de datas relacionadas ao DAS (Documento de Arrecadação do Simples Nacional)
 */

/**
 * Calcula a próxima data de vencimento do DAS
 * O DAS sempre vence no dia 20 do mês seguinte à competência
 * @param referenceDate Data de referência (opcional, padrão é hoje)
 * @returns Data do próximo vencimento do DAS
 */
export function getNextDASDate(referenceDate?: Date): Date {
  const now = referenceDate || new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Se hoje é dia 20 ou antes, o vencimento é neste mês
  // Se hoje é depois do dia 20, o vencimento é no próximo mês
  let dasMonth = currentMonth;
  let dasYear = currentYear;
  
  if (now.getDate() > 20) {
    dasMonth = currentMonth + 1;
    if (dasMonth > 11) {
      dasMonth = 0;
      dasYear = currentYear + 1;
    }
  }
  
  return new Date(dasYear, dasMonth, 20);
}

/**
 * Formata uma data do DAS para exibição
 * @param date Data a ser formatada
 * @returns String formatada no padrão DD/MM/AAAA
 */
export function formatDASDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Calcula quantos dias faltam para o vencimento do DAS
 * @param dasDate Data de vencimento do DAS
 * @param referenceDate Data de referência (opcional, padrão é hoje)
 * @returns Número de dias até o vencimento (negativo se já venceu)
 */
export function getDaysUntilDAS(dasDate: Date, referenceDate?: Date): number {
  const now = referenceDate || new Date();
  const timeDiff = dasDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Gera a chave de competência no formato AAAA-MM
 * @param date Data de referência
 * @returns String no formato AAAA-MM
 */
export function getCompetenciaKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Calcula a competência do próximo mês
 * @param referenceDate Data de referência (opcional, padrão é hoje)
 * @returns String no formato AAAA-MM para o próximo mês
 */
export function getNextMonthCompetencia(referenceDate?: Date): string {
  const now = referenceDate || new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let nextMonth = currentMonth + 1;
  let nextYear = currentYear;
  
  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear = currentYear + 1;
  }
  
  return `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}`;
}