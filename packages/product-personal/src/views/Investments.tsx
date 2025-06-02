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
import { Investment, InvestmentReturn } from '@/models/Investment';
import { 
  Pencil, 
  Trash, 
  PlusCircle, 
  TrendingUp, 
  DollarSign, 
  Calendar 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string, name: string, type: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    categoryId: '',
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

  useEffect(() => {
    loadInvestments();
    loadCategories();
  }, []);

  const loadInvestments = () => {
    const data = InvestmentController.getInvestments();
    setInvestments(data);
  };

  const loadCategories = () => {
    const data = CategoryController.getCategories();
    setCategories(data);
  };

  const loadReturnsForInvestment = (investmentId: string) => {
    setIsLoadingReturns(true);
    try {
      const returns = InvestmentController.getInvestmentReturns(investmentId);
      setInvestmentReturns(returns);
    } catch (error) {
      console.error('Erro ao carregar rendimentos:', error);
    } finally {
      setIsLoadingReturns(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.amount || !formData.categoryId) {
      return;
    }

    const investmentData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryId,
      description: formData.description
    };

    let success = false;
    
    if (editingId) {
      success = InvestmentController.updateInvestment(editingId, investmentData);
    } else {
      success = InvestmentController.createInvestment(investmentData);
    }

    if (success) {
      resetForm();
      loadInvestments();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      categoryId: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleEdit = (investment: Investment) => {
    setFormData({
      name: investment.name,
      amount: investment.amount.toString(),
      categoryId: investment.categoryId,
      description: investment.description || ''
    });
    setEditingId(investment.id);
  };

  const handleDelete = (id: string) => {
    const success = InvestmentController.deleteInvestment(id);
    if (success) {
      loadInvestments();
    }
  };

  const handleAddReturn = () => {
    if (!selectedInvestmentId || !returnData.amount || !returnData.date) {
      return;
    }

    const returnAmount = parseFloat(returnData.amount);
    if (isNaN(returnAmount) || returnAmount <= 0) {
      return;
    }

    const success = InvestmentController.addInvestmentReturn({
      investmentId: selectedInvestmentId,
      amount: returnAmount,
      date: returnData.date
    });

    if (success) {
      setReturnData({
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      setIsReturnDialogOpen(false);
      loadInvestments();
      if (selectedInvestmentId) {
        loadReturnsForInvestment(selectedInvestmentId);
      }
    }
  };

  const handleViewReturns = (investmentId: string) => {
    setSelectedInvestmentId(investmentId);
    loadReturnsForInvestment(investmentId);
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  };

  const getSelectedInvestment = () => {
    if (!selectedInvestmentId) return null;
    return investments.find(inv => inv.id === selectedInvestmentId);
  };

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
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData({...formData, categoryId: value})}
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
                          Categoria: {getCategoryName(investment.categoryId)}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:gap-4 mt-1">
                          <p className="text-sm">
                            <span className="text-gray-500">Valor investido:</span> {formatCurrency(investment.amount)}
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Rendimentos:</span> {formatCurrency(investment.totalReturns)}
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Total:</span> {formatCurrency(investment.amount + investment.totalReturns)}
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
                            <span className="animate-spin">⏳</span>
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
                                <p className="font-medium">{formatCurrency(ret.amount)}</p>
                                <p className="text-gray-500 text-xs">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  {formatDate(ret.date)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => {
                                  const success = InvestmentController.deleteInvestmentReturn(ret.id);
                                  if (success) {
                                    loadInvestments();
                                    loadReturnsForInvestment(investment.id);
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