import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { BudgetController } from '@/controllers/BudgetController';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Budget } from '@/models/Budget';
import { Pencil, Trash, PlusCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string, name: string, type: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    categoryIds: [] as string[],
    period: 'mensal' as 'mensal' | 'anual',
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadBudgets();
    loadCategories();
  }, []);

  const loadBudgets = () => {
    const data = BudgetController.getBudgets();
    setBudgets(data);
  };

  const loadCategories = () => {
    const data = CategoryController.getCategories();
    // Filtrar apenas categorias de despesa
    const expenseCategories = data.filter(cat => cat.type === 'despesa' || cat.type === 'ambos');
    setCategories(expenseCategories);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.amount || !formData.categoryIds[0]) {
      return;
    }

    const budgetData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryIds[0],
      period: formData.period,
      description: formData.description
    };

    let success = false;
    
    if (editingId) {
      success = BudgetController.updateBudget(editingId, budgetData);
    } else {
      success = BudgetController.createBudget(budgetData);
    }

    if (success) {
      resetForm();
      loadBudgets();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      categoryIds: [],
      period: 'mensal',
      description: ''
    });
    setEditingId(null);
  };

  const handleEdit = (budget: Budget) => {
    setFormData({
      name: budget.name,
      amount: budget.amount.toString(),
      categoryIds: [budget.categoryId],
      period: budget.period,
      description: budget.description || ''
    });
    setEditingId(budget.id);
  };

  const handleDelete = (id: string) => {
    const success = BudgetController.deleteBudget(id);
    if (success) {
      loadBudgets();
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: [categoryId]
    }));
  };

  const calculateProgress = (budget: Budget) => {
    return Math.min(100, (budget.spentAmount / budget.amount) * 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-800">Orçamentos</h1>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-emerald-800 mb-4">
            {editingId ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Orçamento</Label>
                <Input
                  id="name"
                  placeholder="Ex: Despesas com alimentação, Gastos com transporte..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Valor do Orçamento (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Valor planejado"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label>Período</Label>
                <RadioGroup 
                  value={formData.period} 
                  onValueChange={(value: 'mensal' | 'anual') => setFormData({...formData, period: value})}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mensal" id="mensal" />
                    <Label htmlFor="mensal" className="cursor-pointer">Mensal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anual" id="anual" />
                    <Label htmlFor="anual" className="cursor-pointer">Anual</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="category">Categoria</Label>
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma categoria de despesa disponível.</p>
                ) : (
                  <Select 
                    value={formData.categoryIds[0] || ""} 
                    onValueChange={handleCategorySelect}
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
                  placeholder="Detalhes sobre este orçamento..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="h-24"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-emerald-800 hover:bg-emerald-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                {editingId ? 'Atualizar' : 'Adicionar'} Orçamento
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
          <h2 className="text-lg font-medium text-emerald-800 mb-4">Meus Orçamentos</h2>
          {budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="mt-2 text-gray-500">Você ainda não possui orçamentos cadastrados.</p>
              <p className="text-gray-500">Crie seu primeiro orçamento acima.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const progress = calculateProgress(budget);
                const progressClass = progress >= 100 
                  ? 'bg-red-500' 
                  : progress >= 75 
                  ? 'bg-orange-400' 
                  : progress >= 50 
                  ? 'bg-yellow-400' 
                  : 'bg-emerald-500';
                
                return (
                  <div key={budget.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{budget.name}</h3>
                          <p className="text-sm text-gray-500">
                            Orçamento {budget.period}: {formatCurrency(budget.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Categoria: {getCategoryName(budget.categoryId)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(budget)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(budget.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {budget.description && (
                        <p className="text-sm mt-1 text-gray-600">{budget.description}</p>
                      )}
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Utilizado: {progress.toFixed(0)}%</span>
                          <span>
                            {formatCurrency(budget.spentAmount)} de {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <Progress value={progress} className={progressClass} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default Budgets; 