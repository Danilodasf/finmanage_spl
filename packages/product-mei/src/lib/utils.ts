import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Adicionar logs para depuração
console.log('Carregando utils.ts');
console.log('clsx disponível:', typeof clsx === 'function');
console.log('twMerge disponível:', typeof twMerge === 'function');

export function cn(...inputs: ClassValue[]) {
  console.log('Função cn chamada com inputs:', inputs);
  const result = twMerge(clsx(inputs));
  console.log('Resultado da função cn:', result);
  return result;
} 