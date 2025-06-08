import React, { useState, useEffect } from 'react';
import { DICategoryController } from '../controllers/DICategoryController';
import { Category, CategoryType } from '../lib/core/services';

interface CategoryFormData {
  name: string;
  type: CategoryType;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: CategoryType.EXPENSE
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Criar instâncias dos controladores
  const categoryController = new DICategoryController();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const result = await categoryController.getAllCategories();
      if (result.data && !result.error) {
        setCategories(result.data);
      } else {
        setError(result.error || 'Erro ao carregar categorias');
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro inesperado ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Nome da categoria é obrigatório');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      
      if (editingId) {
        result = await categoryController.updateCategory(editingId, formData);
      } else {
        result = await categoryController.createCategory(formData);
      }

      if (result.success) {
        setFormData({ name: '', type: CategoryType.EXPENSE });
        setEditingId(null);
        await loadCategories();
      } else {
        setError(result.error || 'Erro ao salvar categoria');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      type: category.type
    });
    setEditingId(category.id);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    try {
      const result = await categoryController.deleteCategory(id);
      if (result.success) {
        await loadCategories();
      } else {
        setError(result.error || 'Erro ao excluir categoria');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', type: CategoryType.EXPENSE });
    setEditingId(null);
    setError(null);
  };

  const getTypeLabel = (type: CategoryType): string => {
    switch (type) {
      case CategoryType.INCOME:
        return 'Receita';
      case CategoryType.EXPENSE:
        return 'Despesa';
      case CategoryType.BOTH:
        return 'Ambos';
      default:
        return 'Desconhecido';
    }
  };

  const getTypeColor = (type: CategoryType): string => {
    switch (type) {
      case CategoryType.INCOME:
        return 'bg-blue-100 text-blue-800';
      case CategoryType.EXPENSE:
        return 'bg-red-100 text-red-800';
      case CategoryType.BOTH:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2 text-lg">Carregando categorias...</span>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Categorias</h1>
        </div>

        {/* Formulário de Nova/Editar Categoria */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Alimentação, Transporte, Salário..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={isSubmitting}
                >
                  <option value={CategoryType.EXPENSE}>Despesa</option>
                  <option value={CategoryType.INCOME}>Receita</option>
                  <option value={CategoryType.BOTH}>Ambos</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-emerald-800 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Salvando...' : (editingId ? 'Atualizar' : 'Adicionar')} Categoria
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Categorias */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Categorias Cadastradas</h2>
          </div>
          
          {categories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Nenhuma categoria cadastrada.</p>
              <p className="text-sm mt-1">Adicione sua primeira categoria usando o formulário acima!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {categories.map((category) => (
                <div key={category.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getTypeColor(category.type)
                      }`}>
                        {getTypeLabel(category.type)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(category)}
                      disabled={isSubmitting}
                      className="text-emerald-600 hover:text-emerald-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};

export default Categories;