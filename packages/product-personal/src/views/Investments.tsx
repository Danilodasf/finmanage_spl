import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { InvestmentController } from '@/controllers/InvestmentController';
import { CategoryController } from '@/controllers/CategoryController';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Investment, InvestmentReturn } from '@/lib/services/InvestmentService';
import { 
  Pencil, 
  Trash, 
  PlusCircle, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/lib/AuthContext';

const Investments: React.FC = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string, name: string, type: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category_id: '',
    description: ''
  });
  const [returnData, setReturnData] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [investmentReturns, setInvestmentReturns] = useState<InvestmentReturn[]>([]);
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInvestments();
      loadCategories();
    }
  }, [user]);

  const loadInvestments = async () => {
    setIsLoading(true);
    try {
      const data = await InvestmentController.getInvestments();
      setInvestments(data);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await CategoryController.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadReturnsForInvestment = async (investmentId: string) => {
    setIsLoadingReturns(true);
    try {
      const returns = await InvestmentController.getInvestmentReturns(investmentId);
      setInvestmentReturns(returns);
    } catch (error) {
      console.error('Erro ao carregar rendimentos:', error);
    } finally {
      setIsLoadingReturns(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.amount || !formData.category_id || !user) {
      return;
    }

    const investmentData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      category_id: formData.category_id,
      description: formData.description,
      user_id: user.id
    };

    let success = false;
    
    if (editingId) {
      success = await InvestmentController.updateInvestment(editingId, investmentData);
    } else {
      success = await InvestmentController.createInvestment(investmentData);
    }

    if (success) {
      resetForm();
      await loadInvestments();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      category_id: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleEdit = (investment: Investment) => {
    setFormData({
      name: investment.name,
      amount: investment.amount.toString(),
      category_id: investment.category_id || '',
      description: investment.description || ''
    });
    setEditingId(investment.id);
  };

  const handleDelete = async (id: string) => {
    const success = await InvestmentController.deleteInvestment(id);
    if (success) {
      await loadInvestments();
    }
  };

  const handleAddReturn = async () => {
    if (!selectedInvestmentId || !returnData.amount || !returnData.date || !user) {
      return;
    }

    const returnAmount = parseFloat(returnData.amount);
    if (isNaN(returnAmount) || returnAmount <= 0) {
      return;
    }

    const success = await InvestmentController.addInvestmentReturn({
      investment_id: selectedInvestmentId,
      amount: returnAmount,
      date: returnData.date,
      user_id: user.id
    });

    if (success) {
      setReturnData({
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      setIsReturnDialogOpen(false);
      await loadInvestments();
      if (selectedInvestmentId) {
        await loadReturnsForInvestment(selectedInvestmentId);
      }
    }
  };

  const handleViewReturns = async (investmentId: string) => {
    setSelectedInvestmentId(investmentId);
    await loadReturnsForInvestment(investmentId);
  };

  const handleOpenReturnDialog = (investmentId: string) => {
    setSelectedInvestmentId(investmentId);
    setIsReturnDialogOpen(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  };

  const getSelectedInvestment = () => {
    if (!selectedInvestmentId) return null;
    return investments.find(inv => inv.id === selectedInvestmentId);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-lg">Carregando investimentos...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-800">Investimentos</h1>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-emerald-800 mb-4">
            {editingId ? 'Editar Investimento' : 'Novo Investimento'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Investimento</Label>
                <Input
                  id="name"
                  placeholder="Ex: Tesouro Direto, Ações, CDB..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Valor Investido (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Valor investido"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma categoria disponível.</p>
                ) : (
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData({...formData, category_id: value})}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Detalhes sobre este investimento..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="h-24"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-emerald-800 hover:bg-emerald-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                {editingId ? 'Atualizar' : 'Adicionar'} Investimento
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-emerald-800 mb-4">Meus Investimentos</h2>
          {investments.length === 0 ? (
            <div className="text-center py-8">
              <p className="mt-2 text-gray-500">Você ainda não possui investimentos cadastrados.</p>
              <p className="text-gray-500">Crie seu primeiro investimento acima.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => (
                <div key={investment.id} className="border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{investment.name}</h3>
                        <p className="text-sm text-gray-500">
                          Categoria: {getCategoryName(investment.category_id)}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:gap-4 mt-1">
                          <p className="text-sm">
                            <span className="text-gray-500">Valor investido:</span> {formatCurrency(investment.amount)}
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Rendimentos:</span> {formatCurrency(investment.total_returns || 0)}
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Total:</span> {formatCurrency(investment.amount + (investment.total_returns || 0))}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReturnDialog(investment.id)}
                          className="text-emerald-600 border-emerald-600"
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Adicionar Rendimento</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReturns(investment.id)}
                          title="Ver histórico de rendimentos"
                          disabled={isLoadingReturns && selectedInvestmentId === investment.id}
                        >
                          {isLoadingReturns && selectedInvestmentId === investment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <DollarSign className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(investment)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(investment.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {investment.description && (
                      <p className="text-sm mt-1 text-gray-600">{investment.description}</p>
                    )}
                  </div>

                  {selectedInvestmentId === investment.id && (
                    <div className="bg-gray-50 border-t p-3">
                      <h4 className="font-medium text-sm mb-2">Histórico de Rendimentos</h4>
                      {investmentReturns.length > 0 ? (
                        <div className="space-y-2">
                          {investmentReturns.map((ret) => (
                            <div key={ret.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                              <div>
                                <p className="font-medium">{formatCurrency(Number(ret.amount))}</p>
                                <p className="text-gray-500 text-xs">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  {formatDate(ret.date)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={async () => {
                                  const success = await InvestmentController.deleteInvestmentReturn(ret.id);
                                  if (success && investment.id) {
                                    await loadInvestments();
                                    await loadReturnsForInvestment(investment.id);
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Nenhum rendimento registrado ainda.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal para adicionar rendimento */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Rendimento</DialogTitle>
            <DialogDescription>
              Adicione um novo rendimento para {getSelectedInvestment()?.name || "o investimento"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="return-amount">Valor do Rendimento (R$)</Label>
              <Input
                id="return-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Valor do rendimento"
                value={returnData.amount}
                onChange={(e) => setReturnData({...returnData, amount: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="return-date">Data do Rendimento</Label>
              <Input
                id="return-date"
                type="date"
                value={returnData.date}
                onChange={(e) => setReturnData({...returnData, date: e.target.value})}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsReturnDialogOpen(false)}>Cancelar</Button>
            <Button type="button" onClick={handleAddReturn} className="bg-emerald-800 hover:bg-emerald-700">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Investments; 