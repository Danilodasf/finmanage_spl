import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CategoriaDiarista, GastoServico, CreateGastoServicoDTO } from '../models/DiaristaModels';
import { useDI } from '../hooks/useDI';
import { useCurrencyInput } from '../hooks/useFormValidation';
import { validateCurrency, errorMessages } from '../utils/validations';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: CreateGastoServicoDTO) => void;
  serviceId: string;
  categories: CategoriaDiarista[];
  onCreateCategory?: (categoryName: string) => Promise<CategoriaDiarista | null>;
  userId: string;
}

interface ExpenseFormData {
  descricao: string;
  valor: string;
  categoria_id: string;
  data: string;
}

interface CategoryFormData {
  nome: string;
  descricao: string;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  serviceId,
  categories,
  onCreateCategory,
  userId
}) => {
  const [expenseFormData, setExpenseFormData] = useState<ExpenseFormData>({
    descricao: '',
    valor: '',
    categoria_id: '',
    data: new Date().toISOString().split('T')[0]
  });
  
  const [expenseValue, setExpenseValue] = useCurrencyInput('');
  const [valueError, setValueError] = useState<string>('');

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    nome: '',
    descricao: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Filtrar apenas categorias de despesa
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const resetForms = () => {
    setExpenseFormData({
      descricao: '',
      valor: '',
      categoria_id: '',
      data: new Date().toISOString().split('T')[0]
    });
    setExpenseValue('');
    setValueError('');
    setCategoryFormData({
      nome: '',
      descricao: ''
    });
    setShowCategoryForm(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseFormData.descricao || !expenseFormData.valor || !expenseFormData.categoria_id) {
      return;
    }

    setIsLoading(true);
    try {
      const newExpense: CreateGastoServicoDTO = {
        servico_id: serviceId,
        user_id: userId,
        categoria_id: expenseFormData.categoria_id,
        descricao: expenseFormData.descricao,
        valor: parseFloat(expenseFormData.valor),
        data: expenseFormData.data
      };

      onAddExpense(newExpense);
      resetForms();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.nome || !onCreateCategory) {
      return;
    }

    setIsLoading(true);
    try {
      const newCategory = await onCreateCategory(categoryFormData.nome);
      if (newCategory) {
        setExpenseFormData(prev => ({ ...prev, categoria_id: newCategory.id }));
        setShowCategoryForm(false);
        setCategoryFormData({ nome: '', descricao: '' });
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Adicionar Gasto Adicional
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!showCategoryForm ? (
          <form onSubmit={handleSubmitExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <Input
                type="text"
                value={expenseFormData.descricao}
                onChange={(e) => setExpenseFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Ex: Combustível, Material de limpeza..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$)
              </label>
              <input
                type="text"
                value={expenseValue}
                onChange={(e) => {
                  setExpenseValue(e.target.value);
                  setExpenseFormData(prev => ({ ...prev, valor: e.target.value.replace(',', '.') }));
                  // Limpa erro quando usuário digita
                  if (valueError) {
                    setValueError('');
                  }
                }}
                onBlur={() => {
                  const cleanValue = expenseValue.replace(',', '.');
                  if (cleanValue && !validateCurrency(cleanValue)) {
                    setValueError(errorMessages.currency);
                  } else if (!cleanValue) {
                    setValueError(errorMessages.required);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  valueError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0,00"
                required
              />
              {valueError && (
                <p className="text-red-500 text-sm mt-1">{valueError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <Input
                type="date"
                value={expenseFormData.data}
                onChange={(e) => setExpenseFormData(prev => ({ ...prev, data: e.target.value }))}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                {onCreateCategory && (
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(true)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Nova categoria
                  </button>
                )}
              </div>
              <select
                value={expenseFormData.categoria_id}
                onChange={(e) => setExpenseFormData(prev => ({ ...prev, categoria_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {expenseCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-400"
              >
                {isLoading ? 'Adicionando...' : 'Adicionar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitCategory} className="space-y-4">
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Nova Categoria de Despesa
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Categoria
              </label>
              <Input
                type="text"
                value={categoryFormData.nome}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Transporte, Material, Alimentação..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <Input
                type="text"
                value={categoryFormData.descricao}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição da categoria..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
              >
                {isLoading ? 'Criando...' : 'Criar Categoria'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCategoryForm(false)}
                className="flex-1"
              >
                Voltar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddExpenseModal;