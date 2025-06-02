import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const GoalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  targetAmount: z.number().positive("Valor alvo deve ser positivo"),
  currentAmount: z.number().min(0, "Valor atual não pode ser negativo"),
  startDate: z.date(),
  targetDate: z.date(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Goal = z.infer<typeof GoalSchema>;

export const createGoal = (data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal => {
  const now = new Date();
  return {
    id: uuidv4(),
    ...data,
    createdAt: now,
    updatedAt: now
  };
};

export const updateGoal = (goal: Goal, data: Partial<Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>>): Goal => {
  return {
    ...goal,
    ...data,
    updatedAt: new Date()
  };
}; 