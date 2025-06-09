import React, { useState, useEffect } from 'react';
import { DITransactionController } from '../controllers/DITransactionController';
import { DICategoryController } from '../controllers/DICategoryController';
import { Transaction, TransactionType, Category } from '../lib/core/services';
import { useCurrencyInput } from '../hooks/useFormValidation';
import { validateCurrency, errorMessages } from '../utils/validations';

interface TransactionFormData {
  type: TransactionType;
  date: string;
  amount: string;
  description: string;
  categoryId: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    categoryId: ''
  });
  
  const [transactionValue, setTransactionValue] = useCurrencyInput('');
  const [valueError, setValueError] = useState<string>('');

  // Instâncias dos controladores
  const [transactionController] = useState(() => new DITransactionController());
  const [categoryController] = useState(() => new DICategoryController());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Carregar transações
      const transactionsResult = await transactionController.getAllTransactions();
      if (transactionsResult.error) {
        setError(`Erro ao carregar transações: ${transactionsResult.error}`);
      } else if (transactionsResult.data) {
        setTransactions(transactionsResult.data);
      }

      // Carregar categorias
      const categoriesResult = await categoryController.getAllCategories();
      if (categoriesResult.error) {
        setError(`Erro ao carregar categorias: ${categoriesResult.error}`);
      } else if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || !formData.amount || !formData.description) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const transactionData = {
        type: formData.type,
        value: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date),
        category_id: formData.categoryId
      };

      let result;
      if (editingTransactionId) {
        // Editando transação existente
        result = await transactionController.updateTransaction(editingTransactionId, transactionData);
      } else {
        // Criando nova transação
        result = await transactionController.createTransaction(transactionData);
      }
      
      if (result.data && !result.error) {
        // Resetar formulário
        setFormData({
          type: TransactionType.EXPENSE,
          date: new Date().toISOString().split('T')[0],
          amount: '',
          description: '',
          categoryId: ''
        });
        setTransactionValue('');
        setValueError('');
        setEditingTransactionId(null);
        
        // Recarregar transações
        await loadData();
      } else {
        setError(result.error || (editingTransactionId ? 'Erro ao atualizar transação' : 'Erro ao criar transação'));
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    try {
      const result = await transactionController.deleteTransaction(id);
      if (result.success) {
        await loadData();
      } else {
        setError(result.error || 'Erro ao excluir transação');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id);
    setFormData({
      type: transaction.type as TransactionType,
      date: new Date(transaction.date).toISOString().split('T')[0],
      amount: transaction.value.toString(),
      description: transaction.description,
      categoryId: transaction.category_id
    });
    setTransactionValue(transaction.value.toString());
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2 text-lg">Carregando transações...</span>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Transações</h1>
        </div>

        {/* Formulário de Nova Transação */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingTransactionId ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            {editingTransactionId && (
              <button
                type="button"
                onClick={() => {
                  setEditingTransactionId(null);
                  setFormData({
                    type: TransactionType.EXPENSE,
                    date: new Date().toISOString().split('T')[0],
                    amount: '',
                    description: '',
                    categoryId: ''
                  });
                  setTransactionValue('');
                  setValueError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancelar Edição
              </button>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {typeof error === 'string' ? error : 'Erro inesperado'}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value={TransactionType.EXPENSE}>Despesa</option>
                <option value={TransactionType.INCOME}>Receita</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$) *
              </label>
              <input
                type="text"
                value={transactionValue}
                onChange={(e) => {
                  setTransactionValue(e.target.value);
                  setFormData(prev => ({ ...prev, amount: e.target.value.replace(',', '.') }));
                  // Limpa erro quando usuário digita
                  if (valueError) {
                    setValueError('');
                  }
                }}
                onBlur={() => {
                  const cleanValue = transactionValue.replace(',', '.');
                  if (cleanValue && !validateCurrency(cleanValue)) {
                    setValueError(errorMessages.currency);
                  } else if (!cleanValue) {
                    setValueError(errorMessages.required);
                  }
                }}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
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
                Categoria *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                &nbsp;
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-800 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvando...' : (editingTransactionId ? 'Atualizar' : 'Adicionar')}
              </button>
            </div>

            <div className="md:col-span-2 lg:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                placeholder="Descreva a transação..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </form>
        </div>

        {/* Lista de Transações */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Histórico de Transações</h2>
          </div>
          
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Nenhuma transação encontrada.</p>
              <p className="text-sm mt-1">Adicione sua primeira transação usando o formulário acima!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCategoryName(transaction.category_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === TransactionType.INCOME
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === TransactionType.INCOME ? 'text-blue-600' : 'text-red-600'}>
                          {transaction.type === TransactionType.INCOME ? '+' : '-'}
                          {formatCurrency(transaction.value)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-emerald-600 hover:text-emerald-900 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
};

export default Transactions;