// Re-exportar o hook use-toast do core usando o arquivo de barril
import { toast as coreToast } from '../lib/core-exports';

// Hook simplificado para evitar erros
export function useToast() {
  return {
    toasts: [],
  };
}

// Hook simplificado de toast para o produto MEI
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const toast = (options: ToastOptions) => {
  console.log('Toast:', options);
  // Usar o toast do core
  coreToast(options);
}; 