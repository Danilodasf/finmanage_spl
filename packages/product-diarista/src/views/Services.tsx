import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, User, MapPin, Plus, Edit, Trash2, Receipt, History } from 'lucide-react';
import { Cliente, Servico, CreateClienteDTO, CreateServicoDTO, GastoServico, CreateGastoServicoDTO, CategoriaDiarista } from '../models/DiaristaModels';
import { DICategoryController } from '../controllers/DICategoryController';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import AddExpenseModal from '../components/AddExpenseModal';
import ExpenseHistoryModal from '../components/ExpenseHistoryModal';
import { useFormValidation, useCurrencyInput, usePhoneInput } from '../hooks/useFormValidation';
import { validateEmail, validatePhone, validateCurrency, errorMessages } from '../utils/validations';
import { DIClienteController } from '../controllers/DIClienteController';
import { DIServicoController } from '../controllers/DIServicoController';
import { DITransactionController } from '../controllers/DITransactionController';
import { DIGastoController } from '../controllers/DIGastoController';
import { useAuthContext } from '../hooks/useAuth';

// Interfaces removidas - agora usando as importadas de DiaristaModels.ts

interface ServiceFormData {
  data: string;
  valor: string;
  cliente_id: string;
  status: 'em_andamento' | 'concluido' | 'cancelado';
  descricao: string;
  localizacao: string;
}

interface ClientFormData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  localizacao: string;
}

const Services: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [services, setServices] = useState<Servico[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [expenses, setExpenses] = useState<GastoServico[]>([]);
  const [categories, setCategories] = useState<CategoriaDiarista[]>([]);
  const [activeTab, setActiveTab] = useState<'services' | 'clients'>('services');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Servico | null>(null);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedServiceForExpense, setSelectedServiceForExpense] = useState<string | null>(null);
  const [showExpenseHistoryModal, setShowExpenseHistoryModal] = useState(false);
  const [selectedServiceForHistory, setSelectedServiceForHistory] = useState<{ id: string; name: string } | null>(null);

  // Instanciar controladores DI
  const clienteController = new DIClienteController();
  const transactionController = new DITransactionController();
  const servicoController = new DIServicoController();
  const categoryController = new DICategoryController();
  const gastoController = new DIGastoController();
  
  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>({
    data: new Date().toISOString().split('T')[0],
    valor: '',
    cliente_id: '',
    status: 'em_andamento',
    descricao: '',
    localizacao: ''
  });
  
  const [serviceValue, setServiceValue] = useCurrencyInput('');

  const [clientFormData, setClientFormData] = useState<ClientFormData>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    localizacao: ''
  });
  
  const [clientPhone, setClientPhone] = usePhoneInput('');
  const [clientFormErrors, setClientFormErrors] = useState<{[key: string]: string}>({});

  // Mock data - será substituído pela integração com Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar dados usando controladores DI
      const [servicosResult, clientesResult, gastosResult] = await Promise.all([
        servicoController.getAllServicos(),
        clienteController.getAllClientes(),
        gastoController.getAllGastos()
      ]);

      if (servicosResult.error) {
        console.error('Erro ao carregar serviços:', servicosResult.error);
      } else {
        setServices(servicosResult.data);
      }

      if (clientesResult.error) {
        console.error('Erro ao carregar clientes:', clientesResult.error);
      } else {
        setClients(clientesResult.data);
      }

      if (gastosResult.error) {
        console.error('Erro ao carregar gastos:', gastosResult.error);
        setExpenses([]);
      } else {
        setExpenses(gastosResult.data || []);
      }

      // Carregar categorias
     const categoryController = new DICategoryController();
     const categoriesResult = await categoryController.getAllCategories();
     if (categoriesResult.data) {
       setCategories(categoriesResult.data);
     }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!isAuthenticated || !user) {
        setError('Você precisa estar logado para criar um serviço');
        return;
      }

      const serviceData: CreateServicoDTO = {
        data: new Date(serviceFormData.data).toISOString().split('T')[0],
        valor: parseFloat(serviceFormData.valor),
        cliente_id: serviceFormData.cliente_id,
        status: serviceFormData.status,
        descricao: serviceFormData.descricao,
        localizacao: serviceFormData.localizacao,
        user_id: user.id
      };

      if (editingService) {
        // Verificar se o status mudou para concluído
        const wasCompleted = editingService.status === 'concluido';
        const isNowCompleted = serviceData.status === 'concluido';
        
        // Atualizar serviço existente
        const result = await servicoController.updateServico(editingService.id, serviceData);
        
        if (result.error) {
          setError(result.error);
          return;
        }

        // Criar transação se o serviço foi marcado como concluído
        if (!wasCompleted && isNowCompleted) {
          await createTransactionForService(result.data!);
        }
        // Remover transação se o serviço deixou de estar concluído
        else if (wasCompleted && !isNowCompleted) {
          await removeTransactionForService(editingService.id);
        }
        // Atualizar transação se o serviço já estava concluído e o valor mudou
        else if (wasCompleted && isNowCompleted && editingService.valor !== serviceData.valor) {
          await updateTransactionForService(result.data!);
        }

        // Atualizar lista local
        setServices(prev => prev.map(s => s.id === editingService.id ? result.data! : s));
        setEditingService(null);
        
        console.log('Serviço atualizado com sucesso:', result.data);
      } else {
        // Criar novo serviço
        const result = await servicoController.createServico(serviceData);
        
        if (result.error) {
          setError(result.error);
          return;
        }

        // Criar transação se o serviço foi criado como concluído
        if (serviceData.status === 'concluido') {
          await createTransactionForService(result.data!);
        }

        // Adicionar à lista local
        setServices(prev => [...prev, result.data!]);
        
        console.log('Serviço criado com sucesso:', result.data);
      }

      // Resetar formulário
      setServiceFormData({
          data: new Date().toISOString().split('T')[0],
          valor: '',
          cliente_id: '',
          status: 'em_andamento',
          descricao: '',
          localizacao: ''
        });
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      setError('Erro ao salvar serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const clienteData: CreateClienteDTO = {
        nome: clientFormData.nome,
        email: clientFormData.email,
        telefone: clientFormData.telefone,
        endereco: clientFormData.endereco,
        localizacao: clientFormData.localizacao
      };
      
      if (editingClient) {
        // Atualizar cliente existente
        const result = await clienteController.updateCliente(editingClient.id, clienteData);
        
        if (result.error) {
          setError(result.error);
          return;
        }

        // Atualizar lista local
        setClients(prev => prev.map(c => c.id === editingClient.id ? result.data! : c));
        setEditingClient(null);
        
        console.log('Cliente atualizado com sucesso:', result.data);
      } else {
        // Criar novo cliente
        const result = await clienteController.createCliente(clienteData);
        
        if (result.error) {
          setError(result.error);
          return;
        }

        // Adicionar à lista local
        setClients(prev => [...prev, result.data!]);
        
        console.log('Cliente criado com sucesso:', result.data);
      }

      // Reset form
      setClientFormData({
        nome: '',
        email: '',
        telefone: '',
        endereco: '',
        localizacao: ''
      });
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setError('Erro ao salvar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditService = (service: Servico) => {
    setEditingService(service);
    const valorFormatado = service.valor.toString().replace('.', ',');
    setServiceFormData({
      data: service.data,
      valor: service.valor.toString(),
      cliente_id: service.cliente_id,
      status: service.status,
      descricao: service.descricao,
      localizacao: service.localizacao
    });
    setServiceValue(valorFormatado);
  };

  const handleEditClient = (client: Cliente) => {
    setEditingClient(client);
    setClientFormData({
      nome: client.nome,
      email: client.email,
      telefone: client.telefone,
      endereco: client.endereco,
      localizacao: client.localizacao
    });
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        const result = await servicoController.deleteServico(id);
        
        if (result.error) {
          setError(result.error);
          return;
        }

        // Remover da lista local
        setServices(prev => prev.filter(s => s.id !== id));
        console.log('Serviço excluído com sucesso');
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        setError('Erro ao excluir serviço');
      }
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const result = await clienteController.deleteCliente(id);
        
        if (result.error) {
          setError(result.error);
          return;
        }

        // Remover da lista local
        setClients(prev => prev.filter(c => c.id !== id));
        console.log('Cliente excluído com sucesso');
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        setError('Erro ao excluir cliente');
      }
    }
  };

  const handleOpenExpenseModal = (serviceId: string) => {
    setSelectedServiceForExpense(serviceId);
    setShowExpenseModal(true);
  };

  const handleCloseExpenseModal = () => {
    setShowExpenseModal(false);
    setSelectedServiceForExpense(null);
  };

  const handleOpenExpenseHistoryModal = (serviceId: string, serviceName: string) => {
    setSelectedServiceForHistory({ id: serviceId, name: serviceName });
    setShowExpenseHistoryModal(true);
  };

  const handleCloseExpenseHistoryModal = () => {
    setShowExpenseHistoryModal(false);
    setSelectedServiceForHistory(null);
  };

  const handleExpenseUpdated = () => {
    // Recarregar dados se necessário
    loadData();
  };

  const handleAddExpense = async (expenseData: CreateGastoServicoDTO) => {
    try {
      const result = await gastoController.createGasto(expenseData);
      
      if (result.error) {
        setError(`Erro ao adicionar gasto: ${result.error}`);
        return;
      }
      
      if (result.data) {
        setExpenses(prev => [...prev, result.data!]);
        console.log('Gasto adicionado com sucesso:', result.data);
        
        // Criar transação de despesa
        const transactionData = {
          user_id: user!.id,
          tipo: 'expense' as const,
          valor: expenseData.valor,
          descricao: expenseData.descricao,
          category_id: expenseData.categoria_id,
          data: expenseData.data
        };
        
        const transactionResult = await transactionController.createTransaction(transactionData);
        if (transactionResult.error) {
          console.error('Erro ao criar transação de despesa:', transactionResult.error);
        }
      }
      
      handleCloseExpenseModal();
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
      setError('Erro ao adicionar gasto');
    }
  };

  // Função para criar transação quando serviço é concluído
  const createTransactionForService = async (servico: any) => {
    if (!user) return;

    try {
      // Buscar a categoria "Serviços Realizados"
      const categoriesResult = await categoryController.getCategoriesByType('income');
      let servicosRealizadosCategoryId = null;
      
      if (categoriesResult.data) {
        const servicosRealizadosCategory = categoriesResult.data.find(
          cat => cat.name === 'Serviços Realizados'
        );
        servicosRealizadosCategoryId = servicosRealizadosCategory?.id;
      }

      // Se a categoria não existe, criar ela automaticamente
      if (!servicosRealizadosCategoryId) {
        console.log('Categoria "Serviços Realizados" não encontrada, criando automaticamente...');
        const createCategoryResult = await categoryController.createCategory({
          name: 'Serviços Realizados',
          type: 'income'
        });
        
        if (createCategoryResult.data) {
          servicosRealizadosCategoryId = createCategoryResult.data.id;
          console.log('Categoria "Serviços Realizados" criada com sucesso:', servicosRealizadosCategoryId);
        } else {
          console.error('Erro ao criar categoria "Serviços Realizados":', createCategoryResult.error);
          return;
        }
      }

      const transactionData = {
        type: 'income' as const,
        value: servico.valor,
        date: new Date(servico.data),
        description: `Serviço realizado - ${servico.descricao}`,
        category_id: servicosRealizadosCategoryId,
        servico_id: servico.id,
        user_id: user!.id
      };

      const result = await transactionController.createTransaction(transactionData);
      if (result.error) {
        console.error('Erro ao criar transação para serviço:', result.error);
      } else {
        console.log('Transação criada automaticamente para serviço concluído:', result.data);
      }
    } catch (error) {
      console.error('Erro ao criar transação para serviço:', error);
    }
  };

  // Função para remover transação quando serviço deixa de estar concluído
  const removeTransactionForService = async (servicoId: string) => {
    try {
      // Buscar transação relacionada ao serviço
      const allTransactions = await transactionController.getAllTransactions();
      if (allTransactions.error) {
        console.error('Erro ao buscar transações:', allTransactions.error);
        return;
      }

      const relatedTransaction = allTransactions.data?.find(
        (transaction: any) => transaction.servico_id === servicoId
      );

      if (relatedTransaction) {
        const result = await transactionController.deleteTransaction(relatedTransaction.id);
        if (result.error) {
          console.error('Erro ao remover transação do serviço:', result.error);
        } else {
          console.log('Transação removida automaticamente:', relatedTransaction.id);
        }
      }
    } catch (error) {
      console.error('Erro ao remover transação do serviço:', error);
    }
  };

  // Função para atualizar transação quando valor do serviço concluído muda
  const updateTransactionForService = async (servico: any) => {
    try {
      // Buscar transação relacionada ao serviço
      const allTransactions = await transactionController.getAllTransactions();
      if (allTransactions.error) {
        console.error('Erro ao buscar transações:', allTransactions.error);
        return;
      }

      const relatedTransaction = allTransactions.data?.find(
        (transaction: any) => transaction.servico_id === servico.id
      );

      if (relatedTransaction) {
        const updatedTransactionData = {
          ...relatedTransaction,
          value: servico.valor,
          date: new Date(servico.data),
          description: `Serviço realizado - ${servico.descricao}`
        };

        const result = await transactionController.updateTransaction(
          relatedTransaction.id,
          updatedTransactionData
        );
        if (result.error) {
          console.error('Erro ao atualizar transação do serviço:', result.error);
        } else {
          console.log('Transação atualizada automaticamente:', result.data);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar transação do serviço:', error);
    }
  };

  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client?.nome || 'Cliente não encontrado';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (isLoading && services.length === 0 && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-800">Serviços</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Serviços
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'clients'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Clientes
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {typeof error === 'string' ? error : 'Erro inesperado'}
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Service Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
            <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  value={serviceFormData.data}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, data: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="text"
                  value={serviceValue}
                  onChange={(e) => {
                    setServiceValue(e.target.value);
                    setServiceFormData(prev => ({ ...prev, valor: e.target.value.replace(',', '.') }));
                  }}
                  onBlur={() => {
                    if (serviceValue && !validateCurrency(serviceValue.replace(',', '.'))) {
                      // Mostrar erro se necessário
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  value={serviceFormData.cliente_id}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, cliente_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={serviceFormData.status}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, status: e.target.value as 'em_andamento' | 'concluido' | 'cancelado' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >

                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={serviceFormData.descricao}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Descrição do serviço"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local do Serviço
                </label>
                <input
                  type="text"
                  value={serviceFormData.localizacao}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Endereço onde o serviço será realizado"
                  required
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>{editingService ? 'Atualizar' : 'Criar'} Serviço</span>
                </button>
                {editingService && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingService(null);
                      setServiceFormData({
                        data: new Date().toISOString().split('T')[0],
                        valor: '',
                        cliente_id: '',
                        status: 'em_andamento',
                        descricao: '',
                        localizacao: ''
                      });
                      setServiceValue('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Services List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Histórico de Serviços</h2>
            </div>
            {services.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhum serviço cadastrado ainda.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {services.map((service) => (
                  <div key={service.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{service.descricao}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(service.status)
                          }`}>
                            {getStatusLabel(service.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(service.data)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatCurrency(service.valor)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{getClientName(service.cliente_id)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{service.localizacao}</span>
                          </div>
                        </div>
                        {/* Gastos adicionais serão exibidos aqui se necessário */}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleOpenExpenseModal(service.id)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Adicionar gastos adicionais"
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenExpenseHistoryModal(service.id, service.descricao || 'Serviço')}
                          className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Histórico de gastos adicionais"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditService(service)}
                          className="p-2 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          {/* Client Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <form onSubmit={handleClientSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={clientFormData.nome}
                  onChange={(e) => setClientFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={clientFormData.email}
                  onChange={(e) => {
                    setClientFormData(prev => ({ ...prev, email: e.target.value }));
                    // Limpa erro quando usuário digita
                    if (clientFormErrors.email) {
                      setClientFormErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  onBlur={() => {
                    if (clientFormData.email && !validateEmail(clientFormData.email)) {
                      setClientFormErrors(prev => ({ ...prev, email: errorMessages.email }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    clientFormErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {clientFormErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{clientFormErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => {
                    setClientPhone(e.target.value);
                    setClientFormData(prev => ({ ...prev, telefone: e.target.value.replace(/\D/g, '') }));
                    // Limpa erro quando usuário digita
                    if (clientFormErrors.telefone) {
                      setClientFormErrors(prev => ({ ...prev, telefone: '' }));
                    }
                  }}
                  onBlur={() => {
                    const cleanPhone = clientPhone.replace(/\D/g, '');
                    if (cleanPhone && !validatePhone(cleanPhone)) {
                      setClientFormErrors(prev => ({ ...prev, telefone: errorMessages.phone }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    clientFormErrors.telefone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  required
                />
                {clientFormErrors.telefone && (
                  <p className="text-red-500 text-sm mt-1">{clientFormErrors.telefone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={clientFormData.endereco}
                  onChange={(e) => setClientFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>{editingClient ? 'Atualizar' : 'Criar'} Cliente</span>
                </button>
                {editingClient && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingClient(null);
                      setClientFormData({
                        nome: '',
                        email: '',
                        telefone: '',
                        endereco: '',
                        localizacao: ''
                      });
                      setClientPhone('');
                      setClientFormErrors({});
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Clients List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lista de Clientes</h2>
            </div>
            {clients.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhum cliente cadastrado ainda.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <div key={client.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{client.nome}</h3>
                      <div className="mt-1 space-y-1 text-sm text-gray-600">
                        <p>{client.email}</p>
                        <p>{client.telefone}</p>
                        <p className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{client.endereco}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="p-2 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modal de Gastos */}
      {showExpenseModal && selectedServiceForExpense && user && (
        <AddExpenseModal
          isOpen={showExpenseModal}
          onClose={handleCloseExpenseModal}
          onAddExpense={handleAddExpense}
          serviceId={selectedServiceForExpense}
          categories={categories}
          onAddCategory={(category) => setCategories(prev => [...prev, category])}
          userId={user.id}
        />
      )}

      {/* Modal de Histórico de Gastos */}
      {showExpenseHistoryModal && selectedServiceForHistory && (
        <ExpenseHistoryModal
          isOpen={showExpenseHistoryModal}
          onClose={handleCloseExpenseHistoryModal}
          serviceId={selectedServiceForHistory.id}
          serviceName={selectedServiceForHistory.name}
          onExpenseUpdated={handleExpenseUpdated}
        />
      )}
    </div>
  );
};

export default Services;