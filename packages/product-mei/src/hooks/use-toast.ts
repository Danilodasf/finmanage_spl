import { toast } from "@/components/ui/toast";

// Hook simplificado para evitar erros
export function useToast() {
  return {
    toasts: [],
  };
}

export { toast }; 