import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionController } from '@/controllers/TransactionController';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  date: Date;
  value: number;
  description: string;
  category: string;
}

interface TransactionFormData {
  description: string;
  value: string;
  date: string;
  category: string;
  type: 'receita' | 'despesa';
}

const Transactions: React.FC = () => {
  // Dados simulados para demonstração
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'receita',
      date: new Date(2023, 5, 15),
      value: 1500,
      description: 'Venda de produtos',
      category: 'Vendas'
    },
    {
      id: '2',
      type: 'despesa',
      date: new Date(2023, 5, 10),
      value: 350,
      description: 'Compra de materiais',
      category: 'Materiais'
    },
    {
      id: '3',
      type: 'receita',
      date: new Date(2023, 5, 5),
      value: 2000,
      description: 'Serviço de consultoria',
      category: 'Serviços'
    },
    {
      id: '4',
      type: 'despesa',
      date: new Date(2023, 5, 2),
      value: 800,
      description: 'Aluguel do escritório',
      category: 'Aluguel'
    }
  ]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTransactionDialogOpen, setNewTransactionDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [transactionFormData, setTransactionFormData] = useState<TransactionFormData>({
    description: '',
    value: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    type: 'receita'
  });
  
  // Filtro simples
  const [filterPeriod, setFilterPeriod] = useState<'todos' | 'mensal' | 'semanal' | 'diario'>('mensal');
  
  // Lista de categorias simulada
  const categories = ['Vendas', 'Materiais', 'Serviços', 'Aluguel', 'Impostos', 'Outros'];

  useEffect(() => {
    // Aplicar filtro simples
    let filtered = [...allTransactions];
    
    // Filtrar por período
    const today = new Date();
    
    switch (filterPeriod) {
      case 'diario':
        filtered = filtered.filter(t => {
          const transactionDate = new Date(t.date);
          return (
            transactionDate.getDate() === today.getDate() &&
            transactionDate.getMonth() === today.getMonth() &&
            transactionDate.getFullYear() === today.getFullYear()
          );
        });
        break;
      case 'semanal':
        const weekStart = new Date();
        weekStart.setDate(today.getDate() - 7);
        filtered = filtered.filter(t => t.date >= weekStart);
        break;
      case 'mensal':
        const monthStart = new Date();
        monthStart.setMonth(today.getMonth() - 1);
        filtered = filtered.filter(t => t.date >= monthStart);
        break;
      // case 'todos': não precisa de filtro
    }
    
    setTransactions(filtered);
  }, [allTransactions, filterPeriod]);

  const handleEdit = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setCurrentTransaction(transaction);
      setTransactionFormData({
        description: transaction.description,
        value: transaction.value.toString(),
        date: format(transaction.date, 'yyyy-MM-dd'),
        category: transaction.category,
        type: transaction.type
      });
      setEditDialogOpen(true);
    }
  };

  const handleEditSubmit = async () => {
    if (!currentTransaction) return;
    
    try {
      // Marcar transação específica como carregando
      setIsLoading(prev => ({ ...prev, [currentTransaction.id]: true }));
      
      const updatedData = {
        description: transactionFormData.description,
        value: parseFloat(transactionFormData.value),
        date: parse(transactionFormData.date, 'yyyy-MM-dd', new Date()),
        category: transactionFormData.category,
        type: transactionFormData.type
      };
      
      // Chamar o controller para atualizar a transação
      const success = await TransactionController.updateTransaction(currentTransaction.id, updatedData);
      
      if (success) {
        // Atualizar o estado com a transação editada
        const updatedTransactions = allTransactions.map(t => 
          t.id === currentTransaction.id 
            ? { ...t, ...updatedData } 
            : t
        );
        setAllTransactions(updatedTransactions);
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
    } finally {
      // Remover estado de carregamento
      setIsLoading(prev => ({ ...prev, [currentTransaction.id]: false }));
    }
  };

  const handleNewTransactionSubmit = async () => {
    try {
      setIsLoading(prev => ({ ...prev, new: true }));
      
      const newTransactionData = {
        description: transactionFormData.description,
        value: parseFloat(transactionFormData.value),
        date: parse(transactionFormData.date, 'yyyy-MM-dd', new Date()),
        category: transactionFormData.category,
        type: transactionFormData.type
      };
      
      // Chamar o controller para criar a transação
      const success = await TransactionController.createTransaction(newTransactionData);
      
      if (success) {
        // Adicionar a nova transação ao estado
        const newTransaction: Transaction = {
          ...newTransactionData,
          id: Math.random().toString(36).substring(2, 9) // ID temporário simulado
        };
        
        setAllTransactions(prev => [...prev, newTransaction]);
        setNewTransactionDialogOpen(false);
        
        // Resetar o formulário
        setTransactionFormData({
          description: '',
          value: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          category: '',
          type: 'receita'
        });
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, new: false }));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Marcar transação específica como carregando
      setIsLoading(prev => ({ ...prev, [id]: true }));
      
      // Chamar o controller para excluir a transação
      const success = await TransactionController.deleteTransaction(id);
      
      if (success) {
        // Atualizar o estado removendo a transação excluída
        const updatedTransactions = allTransactions.filter(transaction => transaction.id !== id);
        setAllTransactions(updatedTransactions);
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    } finally {
      // Remover estado de carregamento
      setIsLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const openNewTransactionDialog = () => {
    setTransactionFormData({
      description: '',
      value: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      type: 'receita'
    });
    setNewTransactionDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Transações MEI</h1>
          
          <div className="flex space-x-4">
            <Select value={filterPeriod} onValueChange={(value: 'todos' | 'mensal' | 'semanal' | 'diario') => setFilterPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="diario">Diário</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              className="bg-emerald-800 hover:bg-emerald-700"
              onClick={openNewTransactionDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {transactions.map(transaction => (
            <Card key={transaction.id} className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`rounded-full p-2 mr-4 ${
                    transaction.type === 'receita' ? 'bg-blue-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'receita' ? (
                      <ArrowUpRight className="h-5 w-5 text-blue-600" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{transaction.description}</h3>
                    <p className="text-sm text-gray-500">
                      {format(transaction.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-gray-500">
                      Categoria: {transaction.category}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <p className={`font-bold mr-4 ${
                    transaction.type === 'receita' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'receita' ? '+' : '-'} R$ {transaction.value.toFixed(2)}
                  </p>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleEdit(transaction.id)}
                        disabled={isLoading[transaction.id]}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(transaction.id)}
                        disabled={isLoading[transaction.id]}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>{isLoading[transaction.id] ? 'Excluindo...' : 'Excluir'}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
          
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma transação encontrada.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Tipo</Label>
              <Select 
                value={transactionFormData.type}
                onValueChange={(value: 'receita' | 'despesa') => 
                  setTransactionFormData({ ...transactionFormData, type: value })
                }
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={transactionFormData.description}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-value">Valor (R$)</Label>
              <Input
                id="edit-value"
                type="number"
                step="0.01"
                value={transactionFormData.value}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, value: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={transactionFormData.date}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select 
                value={transactionFormData.category}
                onValueChange={(value) => setTransactionFormData({ ...transactionFormData, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditSubmit}
              className="bg-emerald-800 hover:bg-emerald-700"
              disabled={isLoading[currentTransaction?.id || '']}
            >
              {isLoading[currentTransaction?.id || ''] ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de nova transação */}
      <Dialog open={newTransactionDialogOpen} onOpenChange={setNewTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-type">Tipo</Label>
              <Select 
                value={transactionFormData.type}
                onValueChange={(value: 'receita' | 'despesa') => 
                  setTransactionFormData({ ...transactionFormData, type: value })
                }
              >
                <SelectTrigger id="new-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-description">Descrição</Label>
              <Input
                id="new-description"
                value={transactionFormData.description}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-value">Valor (R$)</Label>
              <Input
                id="new-value"
                type="number"
                step="0.01"
                value={transactionFormData.value}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, value: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-date">Data</Label>
              <Input
                id="new-date"
                type="date"
                value={transactionFormData.date}
                onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-category">Categoria</Label>
              <Select 
                value={transactionFormData.category}
                onValueChange={(value) => setTransactionFormData({ ...transactionFormData, category: value })}
              >
                <SelectTrigger id="new-category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTransactionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleNewTransactionSubmit}
              className="bg-emerald-800 hover:bg-emerald-700"
              disabled={isLoading.new}
            >
              {isLoading.new ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Transactions; 