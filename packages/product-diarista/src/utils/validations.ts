// Utilitários de validação para formulários

/**
 * Valida se um email tem formato válido
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida se um telefone tem formato válido (brasileiro)
 * Aceita formatos: (11) 99999-9999, 11999999999, +5511999999999
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+55\s?)?\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Formata um valor monetário para ter no máximo 2 casas decimais
 */
export const formatCurrency = (value: string): string => {
  // Remove caracteres não numéricos exceto vírgula e ponto
  let cleaned = value.replace(/[^0-9.,]/g, '');
  
  // Substitui vírgula por ponto
  cleaned = cleaned.replace(',', '.');
  
  // Se há mais de um ponto, mantém apenas o último
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
  }
  
  // Limita a 2 casas decimais
  if (cleaned.includes('.')) {
    const [integer, decimal] = cleaned.split('.');
    cleaned = integer + '.' + decimal.slice(0, 2);
  }
  
  return cleaned;
};

/**
 * Valida se um valor monetário é válido
 */
export const validateCurrency = (value: string): boolean => {
  const currencyRegex = /^\d+(\.\d{1,2})?$/;
  return currencyRegex.test(value) && parseFloat(value) >= 0;
};

/**
 * Formata um telefone brasileiro
 */
export const formatPhone = (phone: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Aplica a máscara baseada no tamanho
  if (cleaned.length <= 10) {
    // Telefone fixo: (11) 1234-5678
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    // Celular: (11) 91234-5678
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

/**
 * Limita o tamanho de um telefone
 */
export const limitPhoneLength = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.slice(0, 11); // Máximo 11 dígitos
};

/**
 * Valida se um campo obrigatório está preenchido
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida se um nome tem pelo menos 2 caracteres
 */
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

/**
 * Mensagens de erro padrão
 */
export const errorMessages = {
  required: 'Este campo é obrigatório',
  email: 'Digite um email válido',
  phone: 'Digite um telefone válido',
  currency: 'Digite um valor válido (ex: 10.50)',
  name: 'Nome deve ter pelo menos 2 caracteres',
  minLength: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  maxLength: (max: number) => `Deve ter no máximo ${max} caracteres`
};

/**
 * Hook personalizado para validação de formulários
 */
export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  phone?: boolean;
  currency?: boolean;
  name?: boolean;
  minLength?: number;
  maxLength?: number;
  custom?: (value: string) => boolean;
  customMessage?: string;
}

export const validateField = (value: string, rules: ValidationRule): string | null => {
  if (rules.required && !validateRequired(value)) {
    return errorMessages.required;
  }
  
  if (value && rules.email && !validateEmail(value)) {
    return errorMessages.email;
  }
  
  if (value && rules.phone && !validatePhone(value)) {
    return errorMessages.phone;
  }
  
  if (value && rules.currency && !validateCurrency(value)) {
    return errorMessages.currency;
  }
  
  if (value && rules.name && !validateName(value)) {
    return errorMessages.name;
  }
  
  if (value && rules.minLength && value.length < rules.minLength) {
    return errorMessages.minLength(rules.minLength);
  }
  
  if (value && rules.maxLength && value.length > rules.maxLength) {
    return errorMessages.maxLength(rules.maxLength);
  }
  
  if (value && rules.custom && !rules.custom(value)) {
    return rules.customMessage || 'Valor inválido';
  }
  
  return null;
};