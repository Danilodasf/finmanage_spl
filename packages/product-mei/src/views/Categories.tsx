import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { DICategoryController } from '../controllers/DICategoryController';
import { Category } from '../lib/core-exports';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Omit<Category, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    type: 'receita'
  });

  useEffect(() => {
    async function initialize() {
      // Garantir que existam categorias padrão
      await DICategoryController.ensureDefaultCategories();
      // Carregar categorias
      await loadCategories();
    }
    initialize();
  }, []);

  const loadCategories = async () => {
    setIsPageLoading(true);
    try {
      const data = await DICategoryController.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setCurrentCategory(category);
      setCategoryFormData({
        name: category.name,
        type: category.type
      });
      setEditDialogOpen(true);
    }
  };

  const handleEditSubmit = async () => {
    console.log('==== BOTÃO EDITAR CLICADO ====');
    console.log('handleEditSubmit - INÍCIO DA FUNÇÃO');
    
    if (!currentCategory) {
      console.log('handleEditSubmit - currentCategory é null, retornando');
      return;
    }
    
    console.log('[Categories.tsx] handleEditSubmit - currentCategory:', currentCategory);
    console.log('[Categories.tsx] handleEditSubmit - categoryFormData:', categoryFormData);
    try {
      // Marcar categoria específica como carregando
      setIsLoading(prev => ({ ...prev, [currentCategory.id]: true }));
      
      // Chamar o controller para atualizar a categoria
      const success = await DICategoryController.updateCategory(currentCategory.id, categoryFormData);
      
      if (success) {
        // Atualizar o estado com a categoria editada
        setCategories(categories.map(c => 
          c.id === currentCategory.id 
            ? { ...c, ...categoryFormData } 
            : c
        ));
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    } finally {
      // Remover estado de carregamento
      setIsLoading(prev => ({ ...prev, [currentCategory.id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Marcar categoria específica como carregando
      setIsLoading(prev => ({ ...prev, [id]: true }));
      
      // Chamar o controller para excluir a categoria
      const success = await DICategoryController.deleteCategory(id);
      
      if (success) {
        // Atualizar o estado removendo a categoria excluída
        setCategories(categories.filter(category => category.id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    } finally {
      // Remover estado de carregamento
      setIsLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleNewCategorySubmit = async () => {
    console.log('==== BOTÃO NOVA CATEGORIA CLICADO ====');
    console.log('handleNewCategorySubmit - INÍCIO DA FUNÇÃO');
    console.log('[Categories.tsx] handleNewCategorySubmit - categoryFormData:', categoryFormData);
    try {
      setIsLoading(prev => ({ ...prev, new: true }));
      
      // Chamar o controller para criar a categoria
      const success = await DICategoryController.createCategory(categoryFormData);
      
      if (success) {
        // Recarregar categorias para obter a nova categoria com ID correto
        await loadCategories();
        setNewCategoryDialogOpen(false);
        
        // Resetar o formulário
        setCategoryFormData({
          name: '',
          type: 'receita'
        });
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, new: false }));
    }
  };

  const openNewCategoryDialog = () => {
    setCategoryFormData({
      name: '',
      type: 'receita'
    });
    setNewCategoryDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Categorias MEI</h1>
          
          <Button 
            className="bg-emerald-800 hover:bg-emerald-700"
            onClick={openNewCategoryDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        {isPageLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map(category => (
              <Card key={category.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      Tipo: {category.type === 'receita' ? 'Receita' : 
                            category.type === 'despesa' ? 'Despesa' : 'Ambos'}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(category.id)}
                      disabled={isLoading[category.id]}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(category.id)}
                      disabled={isLoading[category.id]}
                    >
                      <Trash2 className="h-4 w-4" />
                      {isLoading[category.id] && <span className="ml-2">...</span>}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {categories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma categoria encontrada.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modal de edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Tipo</Label>
              <Select 
                value={categoryFormData.type}
                onValueChange={(value: 'receita' | 'despesa' | 'ambos' | 'investimento') => 
                  setCategoryFormData({ ...categoryFormData, type: value })
                }
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                try {
                  console.log('Botão Salvar Alterações clicado');
                  handleEditSubmit();
                } catch (error) {
                  console.error('ERRO NO BOTÃO SALVAR ALTERAÇÕES:', error);
                }
              }}
              className="bg-emerald-800 hover:bg-emerald-700"
              disabled={isLoading[currentCategory?.id || '']}
            >
              {isLoading[currentCategory?.id || ''] ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de nova categoria */}
      <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-name">Nome</Label>
              <Input
                id="new-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-type">Tipo</Label>
              <Select 
                value={categoryFormData.type}
                onValueChange={(value: 'receita' | 'despesa' | 'ambos' | 'investimento') => 
                  setCategoryFormData({ ...categoryFormData, type: value })
                }
              >
                <SelectTrigger id="new-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                try {
                  console.log('Botão Salvar clicado');
                  handleNewCategorySubmit();
                } catch (error) {
                  console.error('ERRO NO BOTÃO SALVAR:', error);
                }
              }}
              className="bg-emerald-800 hover:bg-emerald-700"
              disabled={isLoading.new}
            >
              {isLoading.new ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Categories; 