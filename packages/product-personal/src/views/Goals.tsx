import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { GoalController } from '@/controllers/GoalController';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Goal } from '@/models/Goal';
import { Pencil, Trash, PlusCircle, Target, Coins } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    targetDate: '',
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressAmount, setProgressAmount] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    const data = GoalController.getGoals();
    setGoals(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.targetAmount || !formData.targetDate) {
      return;
    }

    const goalData = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
      startDate: new Date(formData.startDate),
      targetDate: new Date(formData.targetDate),
      description: formData.description
    };

    let success = false;
    
    if (editingId) {
      success = GoalController.updateGoal(editingId, goalData);
    } else {
      success = GoalController.createGoal(goalData);
    }

    if (success) {
      resetForm();
      loadGoals();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      targetDate: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleEdit = (goal: Goal) => {
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      startDate: format(goal.startDate, 'yyyy-MM-dd'),
      targetDate: format(goal.targetDate, 'yyyy-MM-dd'),
      description: goal.description || ''
    });
    setEditingId(goal.id);
  };

  const handleDelete = (id: string) => {
    const success = GoalController.deleteGoal(id);
    if (success) {
      loadGoals();
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const openProgressDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressAmount(goal.currentAmount.toString());
    setProgressDialogOpen(true);
  };

  const handleProgressUpdate = () => {
    if (selectedGoal && progressAmount) {
      const amount = parseFloat(progressAmount);
      if (!isNaN(amount) && amount >= 0) {
        const success = GoalController.updateGoalProgress(selectedGoal.id, amount);
        if (success) {
          setProgressDialogOpen(false);
          loadGoals();
        }
      }
    }
  };

  const calculateProgress = (goal: Goal) => {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
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
        <h1 className="text-2xl font-bold text-emerald-800">Objetivos Financeiros</h1>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-emerald-800 mb-4">
            {editingId ? 'Editar Objetivo' : 'Novo Objetivo'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Objetivo</Label>
                <Input
                  id="name"
                  placeholder="Ex: Viagem, Compra de um carro..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="targetAmount">Valor Alvo (R$)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Valor a ser atingido"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="currentAmount">Valor Atual (R$)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Valor já economizado (opcional)"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="targetDate">Data Alvo</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Detalhes sobre este objetivo..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="h-24"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-emerald-800 hover:bg-emerald-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                {editingId ? 'Atualizar' : 'Adicionar'} Objetivo
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
          <h2 className="text-lg font-medium text-emerald-800 mb-4">Meus Objetivos</h2>
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Você ainda não possui objetivos financeiros.</p>
              <p className="text-gray-500">Crie seu primeiro objetivo acima.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = calculateProgress(goal);
                const progressClass = progress >= 100 
                  ? 'bg-green-500' 
                  : progress >= 75 
                  ? 'bg-green-400' 
                  : progress >= 50 
                  ? 'bg-yellow-400' 
                  : progress >= 25 
                  ? 'bg-orange-400' 
                  : 'bg-red-400';
                
                return (
                  <div key={goal.id} className="border rounded-lg overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{goal.name}</h3>
                          <p className="text-sm text-gray-500">
                            Meta: {formatCurrency(goal.targetAmount)} até {format(goal.targetDate, 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openProgressDialog(goal)}
                          >
                            <Coins className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(goal)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(goal.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm mt-1 text-gray-600">{goal.description}</p>
                      )}
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso: {progress.toFixed(0)}%</span>
                          <span>
                            {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
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

      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Progresso</DialogTitle>
            <DialogDescription>
              Atualize o valor economizado para {selectedGoal?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="progressAmount">Valor Atual (R$)</Label>
            <Input
              id="progressAmount"
              type="number"
              step="0.01"
              min="0"
              value={progressAmount}
              onChange={(e) => setProgressAmount(e.target.value)}
            />
            
            {selectedGoal && (
              <div className="mt-4 text-sm">
                <div className="flex justify-between">
                  <span>Meta:</span>
                  <span>{formatCurrency(selectedGoal.targetAmount)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Valor anterior:</span>
                  <span>{formatCurrency(selectedGoal.currentAmount)}</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgressDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleProgressUpdate} className="bg-emerald-800 hover:bg-emerald-700">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Goals; 