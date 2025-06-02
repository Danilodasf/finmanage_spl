import { z } from 'zod';

export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa' | 'ambos' | 'investimento';
}

export interface CreateCategoryData {
  name: string;
  type: 'receita' | 'despesa' | 'ambos' | 'investimento';
}

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["receita", "despesa", "ambos", "investimento"]),
  createdAt: z.date(),
  updatedAt: z.date()
}); 