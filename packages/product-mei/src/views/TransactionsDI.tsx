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
  Loader2,
  Wallet,
  AlertCircle,
  Calendar,
  X
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
  DialogDescription,
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
import { Alert, AlertDescription } from "../components/ui/alert";

interface TransactionFormData {
  description: string;
  value: string;
  date: string;
  categoryId: string;
  type: 'receita' | 'despesa';
}

interface FinancialSummary {
  receitas: number;
  despesas: number;
  saldo: number;
  transactions: Transaction[];
}

const TransactionsDI: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTransactionDialogOpen, setNewTransactionDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    transactions: []
  });
  const [upcomingPayments, setUpcomingPayments] = useState<Transaction[]>([]);
  const [showPaymentsAlert, setShowPaymentsAlert] = useState(true);
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
      
      // Carregar resumo financeiro
      const summary = await DITransactionController.getFinancialSummary('month');
      setFinancialSummary(summary);
      
      // Buscar pagamentos próximos do vencimento
      const upcoming = await DITransactionController.getUpcomingPayments();
      setUpcomingPayments(upcoming);
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
      
      // Verificar saldo se for uma despesa e o valor for maior que o original
      if (updatedData.type === 'despesa' && 
          (currentTransaction.type === 'receita' || 
           updatedData.value > currentTransaction.value)) {
        
        // Calcular diferença de valor
        let valorDiferenca = updatedData.value;
        if (currentTransaction.type === 'despesa') {
          valorDiferenca = updatedData.value - currentTransaction.value;
        }
        
        // Verificar se há saldo suficiente
        if (financialSummary.saldo < valorDiferenca) {
          toast({
            title: "Saldo insuficiente",
            description: `Você não possui saldo suficiente (R$ ${financialSummary.saldo.toFixed(2)}) para registrar esta despesa.`,
            variant: "destructive",
          });
          setIsLoading(prev => ({ ...prev, [currentTransaction.id]: false }));
          return;
        }
      }
      
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
      
      // Verificar saldo se for uma despesa
      if (newTransactionData.type === 'despesa' && financialSummary.saldo < newTransactionData.value) {
        toast({
          title: "Saldo insuficiente",
          description: `Você não possui saldo suficiente (R$ ${financialSummary.saldo.toFixed(2)}) para registrar esta despesa.`,
          variant: "destructive",
        });
        setIsLoading(prev => ({ ...prev, new: false }));
        return;
      }
      
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
            
            <Button onClick={openNewTransactionDialog} className="bg-emerald-800 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>
        
        {/* Alerta de Pagamentos Próximos */}
        {showPaymentsAlert && upcomingPayments.length > 0 && (
          <Alert className="bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-amber-600 mr-2" />
                <div>
                  <h3 className="font-medium text-amber-800">
                    {upcomingPayments.length === 1 
                      ? '1 pagamento próximo do vencimento' 
                      : `${upcomingPayments.length} pagamentos próximos do vencimento`}
                  </h3>
                  <AlertDescription className="text-amber-700">
                    Você tem pagamentos que vencem nos próximos 7 dias
                  </AlertDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-amber-700 border-amber-300 hover:bg-amber-100"
                  onClick={() => {
                    // Aqui poderia abrir um modal com detalhes dos pagamentos
                    toast({
                      title: "Pagamentos próximos",
                      description: `Você tem ${upcomingPayments.length} pagamentos nos próximos 7 dias.`,
                    });
                  }}
                >
                  Ver detalhes
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-amber-700 hover:bg-amber-100 h-8 w-8 p-0"
                  onClick={() => setShowPaymentsAlert(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Alert>
        )}
        
        {/* Resumo Financeiro */}
        <Card className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 shadow-md">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-full">
                  <Wallet className="h-6 w-6 text-emerald-700" />
                </div>
                <h2 className="text-lg font-medium text-emerald-800 ml-2">Saldo Disponível</h2>
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                R$ {financialSummary.saldo.toFixed(2)}
              </div>
            </div>
            
            <div className="h-0.5 bg-gradient-to-r from-emerald-200 to-transparent rounded-full my-2"></div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/60 rounded-lg p-3 shadow-sm">
                <div className="flex items-center mb-1">
                  <ArrowUpRight className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm font-medium text-emerald-700">Receitas</span>
                </div>
                <span className="text-xl font-semibold text-blue-600">+ R$ {financialSummary.receitas.toFixed(2)}</span>
              </div>
              <div className="bg-white/60 rounded-lg p-3 shadow-sm">
                <div className="flex items-center mb-1">
                  <ArrowDownLeft className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-emerald-700">Despesas</span>
                </div>
                <span className="text-xl font-semibold text-red-600">- R$ {financialSummary.despesas.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
        
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
                  {categories
                    .filter(category => category.type === transactionFormData.type)
                    .map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            {transactionFormData.type === 'despesa' && (
              <Alert className="bg-blue-50 border-blue-200">
                <Wallet className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Saldo disponível: <span className="font-medium">R$ {financialSummary.saldo.toFixed(2)}</span>
                </AlertDescription>
              </Alert>
            )}
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
            {transactionFormData.type === 'despesa' && (
              <DialogDescription className="flex items-center text-blue-600">
                <Wallet className="h-4 w-4 mr-1" />
                Saldo disponível: R$ {financialSummary.saldo.toFixed(2)}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-type">Tipo</Label>
              <Select 
                value={transactionFormData.type}
                onValueChange={(value: 'receita' | 'despesa') => 
                  setTransactionFormData({ ...transactionFormData, type: value, categoryId: '' })
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
              
              {transactionFormData.type === 'despesa' && 
               parseFloat(transactionFormData.value || '0') > financialSummary.saldo && (
                <div className="flex items-center text-red-600 text-xs mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  O valor excede o saldo disponível
                </div>
              )}
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
                  {categories
                    .filter(category => category.type === transactionFormData.type)
                    .map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            {transactionFormData.type === 'despesa' && (
              <Alert className="bg-blue-50 border-blue-200">
                <Wallet className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Saldo disponível: <span className="font-medium">R$ {financialSummary.saldo.toFixed(2)}</span>
                </AlertDescription>
              </Alert>
            )}
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
              disabled={
                isLoading['new'] || 
                !transactionFormData.description || 
                !transactionFormData.value || 
                !transactionFormData.categoryId ||
                (transactionFormData.type === 'despesa' && 
                 parseFloat(transactionFormData.value) > financialSummary.saldo)
              }
              className="bg-emerald-800 hover:bg-emerald-700"
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