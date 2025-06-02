import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { DITransactionController } from '@/controllers/DITransactionController';
import { DICategoryController } from '@/controllers/DICategoryController';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Transaction, Category } from '@finmanage/core/services';
import { TrashIcon, CalendarDays, PlusCircle, LineChart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { DIContainer, TRANSACTION_SERVICE } from '@finmanage/core/di';

const TransactionsDI: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    type: 'despesa' as 'receita' | 'despesa',
    date: new Date().toISOString().split('T')[0],
    value: '',
    description: '',
    category_id: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string>('');

  // Verificar estado do container na montagem do componente
  useEffect(() => {
    try {
      // Verificar se o DIContainer está disponível
      if (!DIContainer) {
        setDiagnosticInfo(prev => prev + "\n• DIContainer não está disponível");
        console.error("DIContainer não está disponível");
      } else {
        setDiagnosticInfo(prev => prev + "\n• DIContainer está disponível");
        console.log("DIContainer está disponível");
        
        // Verificar se o serviço de transações está registrado
        const hasTransactionService = DIContainer.has(TRANSACTION_SERVICE);
        setDiagnosticInfo(prev => prev + `\n• Serviço TRANSACTION_SERVICE ${hasTransactionService ? 'está' : 'NÃO está'} registrado`);
        console.log(`Serviço TRANSACTION_SERVICE ${hasTransactionService ? 'está' : 'NÃO está'} registrado`);
        
        if (hasTransactionService) {
          try {
            const service = DIContainer.get(TRANSACTION_SERVICE);
            setDiagnosticInfo(prev => prev + "\n• Serviço obtido com sucesso");
            console.log("Serviço obtido com sucesso:", service);
          } catch (error) {
            setDiagnosticInfo(prev => prev + `\n• Erro ao obter serviço: ${error instanceof Error ? error.message : String(error)}`);
            console.error("Erro ao obter serviço:", error);
          }
        }
      }
    } catch (error) {
      setDiagnosticInfo(prev => prev + `\n• Erro ao verificar DIContainer: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Erro ao verificar DIContainer:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      console.log("Usuário autenticado, carregando dados...");
      setDiagnosticInfo(prev => prev + `\n• Usuário autenticado: ${user.id}`);
      loadTransactions();
      loadCategories();
      updateAvailableBalance();
    } else {
      console.log("Usuário não autenticado");
      setDiagnosticInfo(prev => prev + "\n• Usuário NÃO está autenticado");
    }
  }, [user]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando carregamento de transações...");
      setDiagnosticInfo(prev => prev + "\n• Tentando carregar transações...");
      const data = await DITransactionController.getTransactions();
      console.log("Transações carregadas:", data);
      setDiagnosticInfo(prev => prev + `\n• Transações carregadas: ${data.length}`);
      setTransactions(data);
      updateAvailableBalance();
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      setDiagnosticInfo(prev => prev + `\n• ERRO ao carregar transações: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando carregamento de categorias...");
      setDiagnosticInfo(prev => prev + "\n• Tentando carregar categorias...");
      const data = await DICategoryController.getCategories();
      
      // Log detalhado dos dados brutos das categorias
      console.log("Dados brutos das categorias recebidos:", JSON.stringify(data, null, 2));

      const validCategories = (data || []).filter(category => 
        category && 
        typeof category.id === 'string' && 
        category.id.trim() !== '' &&
        typeof category.name === 'string' && // Garantir que o nome também seja uma string válida
        category.name.trim() !== '' &&
        typeof category.type === 'string' // Garantir que o tipo seja uma string válida
      );
      
      console.log("Categorias válidas após filtro inicial:", JSON.stringify(validCategories, null, 2));
      setDiagnosticInfo(prev => prev + `\n• Categorias brutas: ${data ? data.length : 0}, Categorias válidas: ${validCategories.length}`);
      setCategories(validCategories);

    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setDiagnosticInfo(prev => prev + `\n• ERRO ao carregar categorias: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvailableBalance = async () => {
    try {
      console.log("Atualizando saldo disponível...");
      setDiagnosticInfo(prev => prev + "\n• Tentando atualizar saldo disponível...");
      const balance = await DITransactionController.getAvailableBalance();
      console.log("Saldo disponível:", balance);
      setDiagnosticInfo(prev => prev + `\n• Saldo disponível atualizado: ${balance}`);
      setAvailableBalance(balance);
    } catch (error) {
      console.error('Erro ao calcular saldo disponível:', error);
      setDiagnosticInfo(prev => prev + `\n• ERRO ao atualizar saldo: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id || !formData.value) {
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

    setIsLoading(true);
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para realizar esta operação.",
          variant: "destructive"
        });
        return;
      }

      console.log("Criando nova transação...", formData);
      setDiagnosticInfo(prev => prev + "\n• Tentando criar nova transação...");
      
      const success = await DITransactionController.createTransaction({
        type: formData.type,
        date: formData.date,
        value: parseFloat(formData.value),
        description: formData.description,
        category_id: formData.category_id,
        user_id: user.id,
        payment_method: 'cash' // Valor padrão, pode ser melhorado com um campo no formulário
      });

      if (success) {
        setDiagnosticInfo(prev => prev + "\n• Transação criada com sucesso");
        setFormData({
          type: 'despesa',
          date: new Date().toISOString().split('T')[0],
          value: '',
          description: '',
          category_id: ''
        });
        loadTransactions();
      } else {
        setDiagnosticInfo(prev => prev + "\n• Falha ao criar transação");
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      setDiagnosticInfo(prev => prev + `\n• ERRO ao criar transação: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erro",
        description: "Não foi possível criar a transação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      console.log(`Excluindo transação ${id}...`);
      setDiagnosticInfo(prev => prev + `\n• Tentando excluir transação ${id}...`);
      const success = await DITransactionController.deleteTransaction(id);
      if (success) {
        setDiagnosticInfo(prev => prev + "\n• Transação excluída com sucesso");
        loadTransactions();
      } else {
        setDiagnosticInfo(prev => prev + "\n• Falha ao excluir transação");
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      setDiagnosticInfo(prev => prev + `\n• ERRO ao excluir transação: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const filteredCategories = categories.filter(category => 
    category && // Adicionado para segurança
    typeof category.type === 'string' && // Adicionado para segurança
    (category.type === formData.type || category.type === 'ambos')
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Transações (DI)</h1>
          <div className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
            Usando Injeção de Dependências
          </div>
        </div>
        
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
                <Select value={formData.type} onValueChange={(value: 'receita' | 'despesa') => setFormData({...formData, type: value, category_id: ''})}>
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
                    <PopoverContent className="w-auto p-0">
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
                <Label htmlFor="value">Valor (R$)</Label>
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
                <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories
                      .filter(category => {
                        // Filtro robusto para garantir que category e category.id sejam válidos
                        const isCategoryValid = category && 
                                              typeof category.id === 'string' && 
                                              category.id.trim() !== '';
                        if (!isCategoryValid) {
                          console.warn('Categoria inválida ou com ID inválido sendo filtrada:', JSON.stringify(category));
                        }
                        return isCategoryValid;
                      })
                      .map((category) => {
                        // Log antes de renderizar o SelectItem
                        console.log(`Renderizando SelectItem: value="${category.id}", name="${category.name}"`);
                        return (
                          <SelectItem key={category.id} value={category.id.trim()}>
                            {category.name}
                          </SelectItem>
                        );
                      })}
                    {filteredCategories.filter(category => category && typeof category.id === 'string' && category.id.trim() !== '').length === 0 && (
                      <SelectItem value="no-category" disabled>
                        Nenhuma categoria disponível para o tipo selecionado.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição da transação"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="resize-none"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-800 hover:bg-emerald-700"
              disabled={isLoading}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {isLoading ? 'Processando...' : 'Adicionar Transação'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-emerald-800 mb-4">Transações Recentes</h2>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-500">Nenhuma transação encontrada.</p>
            ) : (
              transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-2 h-10 rounded-full mr-3 ${transaction.type === 'receita' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <h3 className="font-medium">{getCategoryName(transaction.category_id)}</h3>
                        <p className="text-sm text-gray-500">
                          {transaction.description || 'Sem descrição'} • {format(new Date(transaction.date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`font-bold mr-3 ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.value)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
          
          {transactions.length > 10 && (
            <div className="mt-4 flex justify-center">
              <Link to="/relatorios">
                <Button variant="outline" className="text-emerald-800">
                  <LineChart className="h-4 w-4 mr-2" />
                  Ver todas as transações
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default TransactionsDI; 