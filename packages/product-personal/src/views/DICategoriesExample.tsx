import React, { useState } from 'react';
import { Form, Button, Container, Table, Spinner, Alert } from 'react-bootstrap';
import { DIContainer } from '@core/di/DIContainer';
import { ICategoryController } from '@core/categories/controllers/ICategoryController';
import { CategoryDIAdapter } from '../adapters/CategoryDIAdapter';

const DICategoriesExample = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('despesa');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicializa o DIContainer
  const container = new DIContainer();

  // Registra o adaptador e obtém o controller
  container.register<ICategoryController>('categoryController', () => new CategoryDIAdapter());
  const categoryController = container.resolve<ICategoryController>('categoryController');

  // Estado local
  const { categories, isLoading, error } = categoryController;

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newCategoryName.trim()) {
      setErrorMessage('O nome da categoria é obrigatório.');
      return;
    }

    try {
      await categoryController.createCategory({
        name: newCategoryName,
        type: newCategoryType as any,
      });
      
      // Limpa o formulário após a criação
      setNewCategoryName('');
      setNewCategoryType('despesa');
    } catch (error) {
      setErrorMessage('Erro ao criar categoria. Tente novamente.');
      console.error('Erro ao criar categoria:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryController.deleteCategory(id);
    } catch (error) {
      setErrorMessage('Erro ao excluir categoria. Tente novamente.');
      console.error('Erro ao excluir categoria:', error);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Exemplo de Categorias com DI</h1>
      
      {errorMessage && (
        <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible>
          {errorMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger">
          Erro ao carregar categorias: {error.message}
        </Alert>
      )}
      
      <Form onSubmit={handleCreateCategory} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Nome da Categoria</Form.Label>
          <Form.Control
            type="text"
            placeholder="Digite o nome da categoria"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Tipo</Form.Label>
          <Form.Select
            value={newCategoryType}
            onChange={(e) => setNewCategoryType(e.target.value)}
          >
            <option value="despesa">Despesa</option>
            <option value="receita">Receita</option>
            <option value="ambos">Ambos</option>
            <option value="investimento">Investimento</option>
          </Form.Select>
        </Form.Group>
        
        <Button variant="primary" type="submit">
          Criar Categoria
        </Button>
      </Form>
      
      {isLoading ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.type}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center">
                  Nenhuma categoria encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default DICategoriesExample; 