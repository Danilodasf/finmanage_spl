import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { TransactionController } from '@/controllers/TransactionController';
import { CategoryController } from '@/controllers/CategoryController';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Transaction } from '@/models/Transaction';
import { Category } from '@/models/Category';
import { TrashIcon, CalendarDays, PlusCircle, LineChart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    type: 'despesa' as 'receita' | 'despesa',
    date: new Date().toISOString().split('T')[0],
    value: '',
    description: '',
    categoryId: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);

  useEffect(() => {
    loadTransactions();
    loadCategories();
    updateAvailableBalance();
  }, []);

  const loadTransactions = () => {
    const data = TransactionController.getTransactions();
    setTransactions(data);
    updateAvailableBalance();
  };

  const loadCategories = () => {
    const data = CategoryController.getCategories();
    setCategories(data);
  };

  const updateAvailableBalance = () => {
    const balance = TransactionController.getAvailableBalance();
    setAvailableBalance(balance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || !formData.value) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (formData.type === 'despesa') {
      const value = parseFloat(formData.value);
      if (value > availableBalance) {
        toast({
          title: "Saldo insuficiente",
          description: `Você não possui saldo suficiente. Saldo atual: ${formatCurrency(availableBalance)}`,
          variant: "destructive"
        });
        return;
      }
    }

    const success = TransactionController.createTransaction({
      type: formData.type,
      date: new Date(formData.date),
      value: parseFloat(formData.value),
      description: formData.description,
      categoryId: formData.categoryId
    });

    if (success) {
      setFormData({
        type: 'despesa',
        date: new Date().toISOString().split('T')[0],
        value: '',
        description: '',
        categoryId: ''
      });
      loadTransactions();
    }
  };

  const handleDelete = (id: string) => {
    const success = TransactionController.deleteTransaction(id);
    if (success) {
      loadTransactions();
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const filteredCategories = categories.filter(category => 
    category.type === formData.type || category.type === 'ambos'
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData({
        ...formData, 
        date: date.toISOString().split('T')[0]
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-800">Transações</h1>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
          <span className="font-medium">Saldo disponível:</span>
          <span className={`font-bold text-lg ${availableBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(availableBalance)}
          </span>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-emerald-800 mb-4">Nova Transação</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value: 'receita' | 'despesa') => setFormData({...formData, type: value, categoryId: ''})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Data</Label>
                <div className="flex flex-col space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-2 border-b">
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            if (!isNaN(newDate.getTime())) {
                              setSelectedDate(newDate);
                              setFormData({...formData, date: e.target.value});
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição da transação"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-700">
              Cadastrar Transação
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-emerald-800 mb-4">Transações Recentes</h2>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-500">Nenhuma transação cadastrada.</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.type === 'receita' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{getCategoryName(transaction.categoryId)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${
                      transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      R$ {transaction.value.toFixed(2)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Button onClick={() => setShowForm(true)} className="bg-emerald-800 hover:bg-emerald-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
          <Link to="/investments" className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <LineChart className="mr-2 h-4 w-4" />
              Investimentos
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Transactions; 