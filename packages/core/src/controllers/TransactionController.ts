
import { Transaction, CreateTransactionData } from '@/models/Transaction';
import { toast } from '@/hooks/use-toast';

/**
 * Controlador responsável por gerenciar operações relacionadas a transações
 * 
 * Este controlador utiliza localStorage para persistência de dados durante o desenvolvimento.
 * Em produção, será substituído por integração com Supabase ou outro banco de dados.
 * 
 * Funcionalidades:
 * - Criar, buscar e excluir transações
 * - Calcular resumos financeiros
 * - Gerenciar notificações de sucesso/erro
 */
export class TransactionController {
  /** Chave utilizada para armazenar transações no localStorage */
  private static storageKey = 'finmanage_transactions';

  /**
   * Busca todas as transações armazenadas no localStorage
   * 
   * @returns Array de transações ou array vazio se não houver dados
   */
  static getTransactions(): Transaction[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Cria uma nova transação no sistema
   * 
   * @param data - Dados da transação a ser criada
   * @returns true se a transação foi criada com sucesso, false caso contrário
   */
  static createTransaction(data: CreateTransactionData): boolean {
    try {
      // Busca todas as transações existentes
      const transactions = this.getTransactions();
      
      // Cria nova transação com ID único baseado no timestamp
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...data
      };

      // Adiciona a nova transação à lista e salva no localStorage
      transactions.push(newTransaction);
      localStorage.setItem(this.storageKey, JSON.stringify(transactions));
      
      // Exibe notificação de sucesso
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso!",
      });
      
      return true;
    } catch (error) {
      // Exibe notificação de erro em caso de falha
      toast({
        title: "Erro",
        description: "Erro ao criar transação.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Exclui uma transação específica do sistema
   * 
   * @param id - Identificador único da transação a ser excluída
   * @returns true se a transação foi excluída com sucesso, false caso contrário
   */
  static deleteTransaction(id: string): boolean {
    try {
      // Busca todas as transações existentes
      const transactions = this.getTransactions();
      
      // Filtra as transações removendo a que possui o ID especificado
      const filteredTransactions = transactions.filter(t => t.id !== id);
      
      // Salva a lista atualizada no localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(filteredTransactions));
      
      // Exibe notificação de sucesso
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
      
      return true;
    } catch (error) {
      // Exibe notificação de erro em caso de falha
      toast({
        title: "Erro",
        description: "Erro ao excluir transação.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Calcula o resumo financeiro baseado em todas as transações
   * 
   * Analisa todas as transações para calcular:
   * - Total de receitas (entradas)
   * - Total de despesas (saídas)
   * - Saldo atual (receitas - despesas)
   * 
   * @returns Objeto contendo receitas, despesas e saldo
   */
  static getSummary() {
    // Busca todas as transações para análise
    const transactions = this.getTransactions();
    
    // Calcula o total de receitas (entradas de dinheiro)
    const receitas = transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);
    
    // Calcula o total de despesas (saídas de dinheiro)
    const despesas = transactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);
    
    // Retorna o resumo financeiro completo
    return {
      receitas,
      despesas,
      saldo: receitas - despesas
    };
  }
  
  /**
   * Calcula o resumo financeiro filtrado por período (mês ou ano)
   * 
   * @param period - Período para filtrar as transações ('month' ou 'year')
   * @returns Objeto contendo receitas, despesas, saldo e lista de transações do período
   */
  static getFinancialSummary(period: 'month' | 'year' = 'month') {
    // Busca todas as transações disponíveis
    const transactions = this.getTransactions();
    const now = new Date();
    
    // Filtra transações baseado no período especificado
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      if (period === 'month') {
        // Para período mensal: mesmo mês e ano atual
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      } else {
        // Para período anual: mesmo ano atual
        return transactionDate.getFullYear() === now.getFullYear();
      }
    });

    // Calcula total de receitas no período
    const receitas = filtered
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);
    
    // Calcula total de despesas no período
    const despesas = filtered
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);

    // Retorna resumo financeiro do período com lista de transações
    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      transactions: filtered
    };
  }
}
