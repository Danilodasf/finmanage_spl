import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const InvestmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.number().positive("Valor deve ser positivo"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
  totalReturns: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Investment = z.infer<typeof InvestmentSchema>;

export const InvestmentReturnSchema = z.object({
  id: z.string().uuid(),
  investmentId: z.string().uuid(),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.string(),
  createdAt: z.date()
});

export type InvestmentReturn = z.infer<typeof InvestmentReturnSchema>;

export const createInvestment = (data: Omit<Investment, 'id' | 'totalReturns' | 'createdAt' | 'updatedAt'>): Investment => {
  const now = new Date();
  return {
    id: uuidv4(),
    ...data,
    totalReturns: 0,
    createdAt: now,
    updatedAt: now
  };
};

export const updateInvestment = (investment: Investment, data: Partial<Omit<Investment, 'id' | 'totalReturns' | 'createdAt' | 'updatedAt'>>): Investment => {
  return {
    ...investment,
    ...data,
    updatedAt: new Date()
  };
};

export const createInvestmentReturn = (data: Omit<InvestmentReturn, 'id' | 'createdAt'>): InvestmentReturn => {
  return {
    id: uuidv4(),
    ...data,
    createdAt: new Date()
  };
}; 