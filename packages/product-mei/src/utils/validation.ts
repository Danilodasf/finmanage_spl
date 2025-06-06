/**
 * Utilitários de validação para formulários
 */

/**
 * Valida se uma string contém apenas letras, espaços e caracteres acentuados
 * @param value String a ser validada
 * @returns Verdadeiro se a string contém apenas letras e espaços
 */
export const isValidName = (value: string): boolean => {
  // Permite letras (incluindo acentuadas), espaços e hífen
  const nameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/;
  return nameRegex.test(value);
};

/**
 * Valida se uma string é um email válido
 * @param value Email a ser validado
 * @returns Verdadeiro se o email é válido
 */
export const isValidEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Valida se uma string é um número de telefone válido
 * @param value Telefone a ser validado
 * @returns Verdadeiro se o telefone é válido
 */
export const isValidPhone = (value: string): boolean => {
  // Remove caracteres não numéricos para verificação
  const numericValue = value.replace(/\D/g, '');
  // Verifica se tem entre 10 e 11 dígitos (com ou sem DDD)
  return numericValue.length >= 10 && numericValue.length <= 11;
};

/**
 * Formata um número de telefone para o padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 * @param value Telefone a ser formatado
 * @returns Telefone formatado
 */
export const formatPhone = (value: string): string => {
  // Remove caracteres não numéricos
  let numericValue = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  if (numericValue.length > 11) {
    numericValue = numericValue.substring(0, 11);
  }
  
  // Formata o telefone de acordo com a quantidade de dígitos
  if (numericValue.length <= 2) {
    return numericValue;
  } else if (numericValue.length <= 6) {
    return numericValue.replace(/(\d{2})(\d+)/, '($1) $2');
  } else if (numericValue.length <= 10) {
    return numericValue.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  } else {
    // Formato: (XX) XXXXX-XXXX
    return numericValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

/**
 * Valida se uma string é um CPF válido
 * @param value CPF a ser validado
 * @returns Verdadeiro se o CPF é válido
 */
export const isValidCPF = (value: string): boolean => {
  // Remove caracteres não numéricos
  const cpf = value.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

/**
 * Formata um CPF para o padrão XXX.XXX.XXX-XX
 * @param value CPF a ser formatado
 * @returns CPF formatado
 */
export const formatCPF = (value: string): string => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const cpf = numericValue.slice(0, 11);
  
  // Formata o CPF
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Valida se uma string é um CNPJ válido
 * @param value CNPJ a ser validado
 * @returns Verdadeiro se o CNPJ é válido
 */
export const isValidCNPJ = (value: string): boolean => {
  // Remove caracteres não numéricos
  const cnpj = value.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Validação dos dígitos verificadores
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  // Primeiro dígito verificador
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
};

/**
 * Formata um CNPJ para o padrão XX.XXX.XXX/XXXX-XX
 * @param value CNPJ a ser formatado
 * @returns CNPJ formatado
 */
export const formatCNPJ = (value: string): string => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  // Limita a 14 dígitos
  const cnpj = numericValue.slice(0, 14);
  
  // Formata o CNPJ
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Verifica se é CPF ou CNPJ e valida de acordo
 * @param value CPF ou CNPJ a ser validado
 * @returns Verdadeiro se o documento é válido
 */
export const isValidDocument = (value: string): boolean => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  // Simplificado: verifica apenas se tem 11 dígitos (CPF) ou 14 dígitos (CNPJ)
  return numericValue.length === 11 || numericValue.length === 14;
};

/**
 * Formata um documento (CPF ou CNPJ) de acordo com seu tamanho
 * @param value Documento a ser formatado
 * @returns Documento formatado
 */
export const formatDocument = (value: string): string => {
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  // Se não tiver dígitos suficientes, retorna sem formatação
  if (numericValue.length < 3) return numericValue;
  
  // Formata de acordo com o tamanho
  if (numericValue.length <= 11) {
    // Formatação progressiva para CPF
    if (numericValue.length <= 3) {
      return numericValue;
    } else if (numericValue.length <= 6) {
      return numericValue.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (numericValue.length <= 9) {
      return numericValue.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return formatCPF(numericValue);
    }
  } else {
    // Formatação progressiva para CNPJ
    if (numericValue.length <= 2) {
      return numericValue;
    } else if (numericValue.length <= 5) {
      return numericValue.replace(/(\d{2})(\d+)/, '$1.$2');
    } else if (numericValue.length <= 8) {
      return numericValue.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (numericValue.length <= 12) {
      return numericValue.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    } else {
      return formatCNPJ(numericValue);
    }
  }
};

/**
 * Valida se uma string é um valor monetário válido
 * @param value Valor monetário a ser validado
 * @returns Verdadeiro se o valor é válido
 */
export const isValidMoneyValue = (value: string): boolean => {
  // Remove R$ e espaços
  const cleanValue = value.replace(/[R$\s.]/g, '').replace(',', '.');
  
  // Verifica se é um número válido com até 2 casas decimais
  const moneyRegex = /^\d+(\.\d{1,2})?$/;
  return moneyRegex.test(cleanValue);
};

/**
 * Formata um valor para o formato monetário (R$ 1.234,56)
 * @param value Valor a ser formatado
 * @returns Valor formatado
 */
export const formatMoneyValue = (value: string): string => {
  // Remove caracteres não numéricos, exceto vírgula e ponto
  let cleanValue = value.replace(/[R$\s]/g, '');
  
  // Converte para número
  const numericValue = parseFloat(cleanValue.replace(',', '.'));
  
  // Se não for um número válido, retorna vazio
  if (isNaN(numericValue)) return '';
  
  // Formata o valor para o padrão brasileiro
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Converte um valor formatado em moeda para número
 * @param value Valor formatado (ex: "R$ 1.234,56")
 * @returns Valor numérico (ex: 1234.56)
 */
export const moneyValueToNumber = (value: string): number => {
  // Remove R$, pontos e espaços, e substitui vírgula por ponto
  const cleanValue = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};