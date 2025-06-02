import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { CategoryController } from '@/controllers/CategoryController';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/models/Category';
import { Pencil, Trash, PlusCircle } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'despesa' as 'receita' | 'despesa' | 'ambos'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const data = CategoryController.getCategories();
    setCategories(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    let success = false;
    
    if (editingId) {
      success = CategoryController.updateCategory(editingId, formData);
    } else {
      success = CategoryController.createCategory(formData);
    }

    if (success) {
      setFormData({ name: '', type: 'despesa' });
      setEditingId(null);
      loadCategories();
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      type: category.type
    });
    setEditingId(category.id);
  };

  const handleDelete = (id: string) => {
    const success = CategoryController.deleteCategory(id);
    if (success) {
      loadCategories();
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', type: 'despesa' });
    setEditingId(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'receita': return 'Receita';
      case 'despesa': return 'Despesa';
      case 'ambos': return 'Ambos';
      default: return type;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-800">Categorias</h1>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-emerald-800 mb-4">
            {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome da categoria"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value: 'receita' | 'despesa' | 'ambos') => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-emerald-800 hover:bg-emerald-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                {editingId ? 'Atualizar' : 'Adicionar'} Categoria
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
          <h2 className="text-lg font-medium text-emerald-800 mb-4">Categorias Cadastradas</h2>
          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-gray-500">Nenhuma categoria cadastrada.</p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      category.type === 'receita' 
                        ? 'bg-green-100 text-green-800'
                        : category.type === 'despesa'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getTypeLabel(category.type)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Categories; 