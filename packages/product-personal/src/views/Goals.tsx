import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { GoalController } from '@/controllers/GoalController';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Goal } from '@/lib/services/GoalService';
import { Pencil, Trash, PlusCircle, Target, Coins, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/lib/AuthContext';

const Goals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    target_date: '',
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressAmount, setProgressAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const data = await GoalController.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Erro ao carregar objetivos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.target_amount || !formData.target_date || !user) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const goalData = {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: formData.current_amount ? parseFloat(formData.current_amount) : 0,
        start_date: formData.start_date,
        target_date: formData.target_date,
        description: formData.description,
        user_id: user.id
      };

      let success = false;
      
      if (editingId) {
        // Para atualização, não precisamos enviar o user_id
        const { user_id, ...updateData } = goalData;
        success = await GoalController.updateGoal(editingId, updateData);
      } else {
        success = await GoalController.createGoal(goalData);
      }

      if (success) {
        resetForm();
        await loadGoals();
      }
    } catch (error) {
      console.error('Erro ao salvar objetivo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      target_date: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleEdit = (goal: Goal) => {
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount ? goal.current_amount.toString() : '0',
      start_date: goal.start_date,
      target_date: goal.target_date,
      description: goal.description || ''
    });
    setEditingId(goal.id);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const success = await GoalController.deleteGoal(id);
      if (success) {
        await loadGoals();
      }
    } catch (error) {
      console.error('Erro ao excluir objetivo:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const openProgressDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressAmount(goal.current_amount ? goal.current_amount.toString() : '0');
    setProgressDialogOpen(true);
  };

  const handleProgressUpdate = async () => {
    if (selectedGoal && progressAmount) {
      const amount = parseFloat(progressAmount);
      if (!isNaN(amount) && amount >= 0) {
        setIsUpdatingProgress(true);
        try {
          const success = await GoalController.updateGoalProgress(selectedGoal.id, amount);
          if (success) {
            setProgressDialogOpen(false);
            await loadGoals();
          }
        } catch (error) {
          console.error('Erro ao atualizar progresso:', error);
        } finally {
          setIsUpdatingProgress(false);
        }
      }
    }
  };

  const calculateProgress = (goal: Goal) => {
    const currentAmount = goal.current_amount || 0;
    return Math.min(100, (currentAmount / goal.target_amount) * 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-lg">Carregando objetivos...</span>
        </div>
      </MainLayout>
    );
  }

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
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="target_amount">Valor Alvo (R$)</Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Valor a ser atingido"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="current_amount">Valor Atual (R$)</Label>
                <Input
                  id="current_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Valor já economizado (opcional)"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="target_date">Data Alvo</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                  required
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1 bg-emerald-800 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingId ? 'Atualizando...' : 'Adicionando...'}
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {editingId ? 'Atualizar' : 'Adicionar'} Objetivo
                  </>
                )}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
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
                            Meta: {formatCurrency(goal.target_amount)} até {formatDate(goal.target_date)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openProgressDialog(goal)}
                            disabled={isDeleting === goal.id}
                          >
                            <Coins className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(goal)}
                            disabled={isDeleting === goal.id}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(goal.id)}
                            disabled={isDeleting === goal.id}
                          >
                            {isDeleting === goal.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
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
                            {formatCurrency(goal.current_amount || 0)} de {formatCurrency(goal.target_amount)}
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

        <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atualizar Progresso</DialogTitle>
              <DialogDescription>
                Atualize o valor atual economizado para o objetivo: {selectedGoal?.name}
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
                disabled={isUpdatingProgress}
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setProgressDialogOpen(false)}
                disabled={isUpdatingProgress}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleProgressUpdate}
                className="bg-emerald-800 hover:bg-emerald-700"
                disabled={isUpdatingProgress}
              >
                {isUpdatingProgress ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Goals; 