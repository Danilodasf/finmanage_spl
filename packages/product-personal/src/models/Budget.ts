import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.number().positive("Valor deve ser positivo"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  spentAmount: z.number().min(0, "Valor gasto não pode ser negativo"),
  period: z.enum(["mensal", "anual"]),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Budget = z.infer<typeof BudgetSchema>;

export const createBudget = (data: Omit<Budget, 'id' | 'spentAmount' | 'createdAt' | 'updatedAt'>): Budget => {
  const now = new Date();
  return {
    id: uuidv4(),
    ...data,
    spentAmount: 0,
    createdAt: now,
    updatedAt: now
  };
};

export const updateBudget = (budget: Budget, data: Partial<Omit<Budget, 'id' | 'spentAmount' | 'createdAt' | 'updatedAt'>>): Budget => {
  return {
    ...budget,
    ...data,
    updatedAt: new Date()
  };
}; 