import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2
} from 'lucide-react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { DITransactionController } from '../controllers/DITransactionController';
import { DICategoryController } from '../controllers/DICategoryController';
import { Transaction, Category, toast } from '../lib/core-exports';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface TransactionFormData {
  description: string;
  value: string;
  date: string;
  categoryId: string;
  type: 'receita' | 'despesa';
}

const TransactionsDI: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTransactionDialogOpen, setNewTransactionDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [transactionFormData, setTransactionFormData] = useState<TransactionFormData>({
    description: '',
    value: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    categoryId: '',
    type: 'receita'
  });
  
  // Filtro simples
  const [filterPeriod, setFilterPeriod] = useState<'todos' | 'mensal' | 'semanal' | 'diario'>('mensal');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsPageLoading(true);
    try {
      // Carregar transações
      const transactionsData = await DITransactionController.getTransactions();
      setTransactions(transactionsData);
      
      // Carregar categorias
      const categoriesData = await DICategoryController.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados das transações.",
        variant: "destructive",
      });
    } finally {
      setIsPageLoading(false);
    }
  };
  
  const filteredTransactions = () => {
    if (filterPeriod === 'todos') {
      return transactions;
    }
    
    const now = new Date();
    let startDate: Date;
    
    if (filterPeriod === 'mensal') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filterPeriod === 'semanal') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // ajuste para começar na segunda
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
    } else { // diário
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate;
    });
  };
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
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
        categoryId: transactionFormData.categoryId,
        type: transactionFormData.type
      };
      
      // Chamar o controller para atualizar a transação
      const success = await DITransactionController.updateTransaction(currentTransaction.id, updatedData);
      
      if (success) {
        // Atualizar a lista de transações
        await loadData();
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
        categoryId: transactionFormData.categoryId,
        type: transactionFormData.type
      };
      
      // Chamar o controller para criar a transação
      const success = await DITransactionController.createTransaction(newTransactionData);
      
      if (success) {
        // Atualizar a lista de transações
        await loadData();
        setNewTransactionDialogOpen(false);
        
        // Resetar o formulário
        setTransactionFormData({
          description: '',
          value: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          categoryId: '',
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
      const success = await DITransactionController.deleteTransaction(id);
      
      if (success) {
        // Atualizar a lista de transações
        await loadData();
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    } finally {
      // Remover estado de carregamento
      setIsLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    
    // Converter dados para o formato do formulário
    setTransactionFormData({
      description: transaction.description,
      value: transaction.value.toString(),
      date: transaction.date, // Já está no formato 'yyyy-MM-dd'
      categoryId: transaction.categoryId,
      type: transaction.type
    });
    
    setEditDialogOpen(true);
  };

  const openNewTransactionDialog = () => {
    setTransactionFormData({
      description: '',
      value: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      categoryId: '',
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
            <Select 
              value={filterPeriod} 
              onValueChange={(value: 'todos' | 'mensal' | 'semanal' | 'diario') => setFilterPeriod(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="mensal">Mês atual</SelectItem>
                <SelectItem value="semanal">Semana atual</SelectItem>
                <SelectItem value="diario">Hoje</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={openNewTransactionDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>
        
        {isPageLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-emerald-800">Carregando transações...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions().length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">Nenhuma transação encontrada para o período selecionado.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={openNewTransactionDialog}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar primeira transação
                </Button>
              </Card>
            ) : (
              filteredTransactions().map(transaction => (
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
                          {format(new Date(transaction.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-gray-500">
                          Categoria: {getCategoryName(transaction.categoryId)}
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
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {isLoading[transaction.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(transaction)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(transaction.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Dialog de edição */}
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
                value={transactionFormData.categoryId}
                onValueChange={(value) => 
                  setTransactionFormData({ ...transactionFormData, categoryId: value })
                }
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={isLoading[currentTransaction?.id || ''] || !transactionFormData.description || !transactionFormData.value || !transactionFormData.categoryId}
            >
              {isLoading[currentTransaction?.id || ''] && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de nova transação */}
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
                value={transactionFormData.categoryId}
                onValueChange={(value) => 
                  setTransactionFormData({ ...transactionFormData, categoryId: value })
                }
              >
                <SelectTrigger id="new-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewTransactionDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleNewTransactionSubmit}
              disabled={isLoading['new'] || !transactionFormData.description || !transactionFormData.value || !transactionFormData.categoryId}
            >
              {isLoading['new'] && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TransactionsDI; 