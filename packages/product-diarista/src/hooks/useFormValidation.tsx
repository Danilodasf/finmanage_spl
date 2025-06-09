import { useState, useCallback } from 'react';
import { ValidationRule, validateField } from '../utils/validations';

export interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

export interface FormValidationConfig {
  [fieldName: string]: ValidationRule;
}

export interface UseFormValidationReturn {
  fields: { [fieldName: string]: FormField };
  errors: { [fieldName: string]: string | null };
  isValid: boolean;
  hasErrors: boolean;
  setValue: (fieldName: string, value: string) => void;
  setError: (fieldName: string, error: string | null) => void;
  validateField: (fieldName: string) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  touch: (fieldName: string) => void;
  touchAll: () => void;
}

export const useFormValidation = (
  initialValues: { [fieldName: string]: string },
  validationConfig: FormValidationConfig
): UseFormValidationReturn => {
  const [fields, setFields] = useState<{ [fieldName: string]: FormField }>(() => {
    const initialFields: { [fieldName: string]: FormField } = {};
    Object.keys(initialValues).forEach(fieldName => {
      initialFields[fieldName] = {
        value: initialValues[fieldName],
        error: null,
        touched: false
      };
    });
    return initialFields;
  });

  const setValue = useCallback((fieldName: string, value: string) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        error: null // Limpa o erro quando o valor muda
      }
    }));
  }, []);

  const setError = useCallback((fieldName: string, error: string | null) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error
      }
    }));
  }, []);

  const touch = useCallback((fieldName: string) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true
      }
    }));
  }, []);

  const touchAll = useCallback(() => {
    setFields(prev => {
      const newFields = { ...prev };
      Object.keys(newFields).forEach(fieldName => {
        newFields[fieldName] = {
          ...newFields[fieldName],
          touched: true
        };
      });
      return newFields;
    });
  }, []);

  const validateFieldByName = useCallback((fieldName: string): boolean => {
    const field = fields[fieldName];
    const rules = validationConfig[fieldName];
    
    if (!field || !rules) return true;
    
    const error = validateField(field.value, rules);
    setError(fieldName, error);
    
    return error === null;
  }, [fields, validationConfig, setError]);

  const validateAll = useCallback((): boolean => {
    let isFormValid = true;
    
    Object.keys(validationConfig).forEach(fieldName => {
      const isFieldValid = validateFieldByName(fieldName);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });
    
    touchAll();
    return isFormValid;
  }, [validationConfig, validateFieldByName, touchAll]);

  const reset = useCallback(() => {
    setFields(prev => {
      const resetFields: { [fieldName: string]: FormField } = {};
      Object.keys(prev).forEach(fieldName => {
        resetFields[fieldName] = {
          value: initialValues[fieldName] || '',
          error: null,
          touched: false
        };
      });
      return resetFields;
    });
  }, [initialValues]);

  // Computed values
  const errors = Object.keys(fields).reduce((acc, fieldName) => {
    acc[fieldName] = fields[fieldName].error;
    return acc;
  }, {} as { [fieldName: string]: string | null });

  const hasErrors = Object.values(fields).some(field => field.error !== null);
  const isValid = !hasErrors && Object.keys(validationConfig).every(fieldName => {
    const field = fields[fieldName];
    return field && validateField(field.value, validationConfig[fieldName]) === null;
  });

  return {
    fields,
    errors,
    isValid,
    hasErrors,
    setValue,
    setError,
    validateField: validateFieldByName,
    validateAll,
    reset,
    touch,
    touchAll
  };
};

// Hook específico para campos de valor monetário
export const useCurrencyInput = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);
  
  const handleChange = useCallback((inputValue: string) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    let cleaned = inputValue.replace(/[^0-9.,]/g, '');
    
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
    
    setValue(cleaned);
  }, []);
  
  return [value, handleChange] as const;
};

// Hook específico para campos de telefone
export const usePhoneInput = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);
  
  const handleChange = useCallback((inputValue: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = inputValue.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = cleaned.slice(0, 11);
    
    // Aplica a máscara
    let formatted = limited;
    if (limited.length >= 2) {
      if (limited.length <= 10) {
        // Telefone fixo: (11) 1234-5678
        formatted = limited.replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3');
      } else {
        // Celular: (11) 91234-5678
        formatted = limited.replace(/(\d{2})(\d{0,5})(\d{0,4})/, '($1) $2-$3');
      }
    }
    
    setValue(formatted.replace(/-$/, ''));
  }, []);
  
  return [value, handleChange] as const;
};