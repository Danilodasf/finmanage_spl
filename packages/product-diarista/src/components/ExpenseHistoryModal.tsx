import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Calendar, DollarSign, Tag } from 'lucide-react';
import { GastoServico, CategoriaDiarista, UpdateGastoServicoDTO } from '../models/DiaristaModels';
import { DIGastoController } from '../controllers/DIGastoController';
import { DICategoryController } from '../controllers/DICategoryController';

interface ExpenseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  onExpenseUpdated: () => void;
}

interface EditExpenseFormData {
  categoria_id: string;
  descricao: string;
  valor: string;
  data: string;
}

const ExpenseHistoryModal: React.FC<ExpenseHistoryModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  onExpenseUpdated
}) => {
  const [expenses, setExpenses] = useState<GastoServico[]>([]);
  const [categories, setCategories] = useState<CategoriaDiarista[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState<GastoServico | null>(null);
  const [editFormData, setEditFormData] = useState<EditExpenseFormData>({
    categoria_id: '',
    descricao: '',
    valor: '',
    data: ''
  });
  const [editValue, setEditValue] = useState('');

  const gastoController = new DIGastoController();
  const categoryController = new DICategoryController();

  useEffect(() => {
    if (isOpen) {
      loadExpenses();
      loadCategories();
    }
  }, [isOpen, serviceId]);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const result = await gastoController.getGastosByServico(serviceId);
      if (result.data && !result.error) {
        setExpenses(result.data);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error('Erro ao carregar gastos:', error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await categoryController.getAllCategories();
      if (result.data) {
        setCategories(result.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategories([]);
    }
  };

  const handleEditExpense = (expense: GastoServico) => {
    setEditingExpense(expense);
    setEditFormData({
      categoria_id: expense.categoria_id,
      descricao: expense.descricao,
      valor: expense.valor.toString(),
      data: expense.data
    });
    setEditValue(expense.valor.toFixed(2).replace('.', ','));
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setEditFormData({
      categoria_id: '',
      descricao: '',
      valor: '',
      data: ''
    });
    setEditValue('');
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    setIsLoading(true);
    try {
      const updateData: UpdateGastoServicoDTO = {
        categoria_id: editFormData.categoria_id,
        descricao: editFormData.descricao,
        valor: parseFloat(editFormData.valor),
        data: editFormData.data
      };

      const result = await gastoController.updateGasto(editingExpense.id, updateData);
      if (result.data) {
        await loadExpenses();
        handleCancelEdit();
        onExpenseUpdated();
      }
    } catch (error) {
      console.error('Erro ao atualizar gasto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este gasto?')) return;

    setIsLoading(true);
    try {
      const result = await gastoController.deleteGasto(expenseId);
      if (result.data !== undefined) {
        await loadExpenses();
        onExpenseUpdated();
      }
    } catch (error) {
      console.error('Erro ao excluir gasto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Histórico de Gastos - {serviceName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Carregando gastos...</div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum gasto adicional encontrado para este serviço.
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                  {editingExpense?.id === expense.id ? (
                    /* Edit Form */
                    <form onSubmit={handleUpdateExpense} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Categoria
                          </label>
                          <select
                            value={editFormData.categoria_id}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, categoria_id: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          >
                            <option value="">Selecione uma categoria</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor
                          </label>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => {
                              setEditValue(e.target.value);
                              setEditFormData(prev => ({ ...prev, valor: e.target.value.replace(',', '.') }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="0,00"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data
                          </label>
                          <input
                            type="date"
                            value={editFormData.data}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, data: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                          </label>
                          <input
                            type="text"
                            value={editFormData.descricao}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, descricao: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Descrição do gasto"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Display Mode */
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Tag className="h-4 w-4" />
                            <span>{getCategoryName(expense.categoria_id)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(expense.data)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium text-emerald-600">
                              {formatCurrency(expense.valor)}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-900 font-medium">{expense.descricao}</p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="p-2 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Editar gasto"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir gasto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseHistoryModal;