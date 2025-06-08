import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, User, MapPin, Plus, Edit, Trash2, Receipt } from 'lucide-react';
import { Cliente, Servico, CreateClienteDTO, CreateServicoDTO, GastoServico, CreateGastoServicoDTO, CategoriaDiarista } from '../models/DiaristaModels';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import AddExpenseModal from '../components/AddExpenseModal';

// Interfaces removidas - agora usando as importadas de DiaristaModels.ts

interface ServiceFormData {
  data: string;
  valor: string;
  cliente_id: string;
  status: 'pendente' | 'pago' | 'cancelado';
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
  
  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>({
    data: new Date().toISOString().split('T')[0],
    valor: '',
    cliente_id: '',
    status: 'pendente',
    descricao: '',
    localizacao: ''
  });

  const [clientFormData, setClientFormData] = useState<ClientFormData>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    localizacao: ''
  });

  // Mock data - será substituído pela integração com Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados
      setServices([]);
      setClients([]);
    } catch (err) {
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
      const serviceData: CreateServicoDTO = {
        data: new Date(serviceFormData.data),
        valor: parseFloat(serviceFormData.valor),
        cliente_id: serviceFormData.cliente_id,
        status: serviceFormData.status,
        descricao: serviceFormData.descricao,
        localizacao: serviceFormData.localizacao,
        user_id: '1' // Temporário
      };

      if (editingService) {
        // Verificar mudança de status para gerenciar transações
        const oldStatus = editingService.status;
        const newStatus = serviceFormData.status;
        
        // Atualizar serviço existente
        const updatedService: Servico = {
          ...editingService,
          ...serviceData,
          updated_at: new Date()
        };
        setServices(prev => prev.map(s => s.id === editingService.id ? updatedService : s));
        
        // Gerenciar transações baseado na mudança de status
        if (oldStatus !== 'pago' && newStatus === 'pago') {
          // Criar transação de receita
          // await api.createTransaction({
          //   tipo: 'receita',
          //   valor: serviceData.valor,
          //   descricao: `Pagamento do serviço: ${serviceData.descricao}`,
          //   categoria_id: 'servicos', // categoria padrão para serviços
          //   data: serviceData.data,
          //   servico_id: editingService.id
          // });
          console.log('Transação de receita criada para o serviço:', editingService.id);
        } else if (oldStatus === 'pago' && newStatus === 'cancelado') {
          // Deletar transação de receita
          // await api.deleteTransactionByServiceId(editingService.id);
          console.log('Transação de receita deletada para o serviço:', editingService.id);
        }
        
        setEditingService(null);
      } else {
        // Criar novo serviço
        const newService: Servico = {
          id: Date.now().toString(),
          ...serviceData,
          created_at: new Date(),
          updated_at: new Date()
        };
        setServices(prev => [...prev, newService]);
        
        // Se o serviço já for criado como pago, criar transação de receita
        if (serviceData.status === 'pago') {
          // await api.createTransaction({
          //   tipo: 'receita',
          //   valor: serviceData.valor,
          //   descricao: `Pagamento do serviço: ${serviceData.descricao}`,
          //   categoria_id: 'servicos', // categoria padrão para serviços
          //   data: serviceData.data,
          //   servico_id: newService.id
          // });
          console.log('Transação de receita criada para o novo serviço:', newService.id);
        }
      }

      // Resetar formulário
      setServiceFormData({
        data: '',
        valor: '',
        cliente_id: '',
        status: 'pendente',
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
      const newClient: Cliente = {
        id: editingClient?.id || Date.now().toString(),
        user_id: 'current_user_id', // TODO: Obter do contexto de autenticação
        nome: clientFormData.nome,
        email: clientFormData.email,
        telefone: clientFormData.telefone,
        endereco: clientFormData.endereco,
        localizacao: clientFormData.localizacao,
        created_at: editingClient?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (editingClient) {
        setClients(prev => prev.map(c => c.id === editingClient.id ? newClient : c));
        setEditingClient(null);
      } else {
        setClients(prev => [...prev, newClient]);
      }

      // Reset form
      setClientFormData({
        nome: '',
        email: '',
        telefone: '',
        endereco: '',
        localizacao: ''
      });
    } catch (err) {
      setError('Erro ao salvar cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditService = (service: Servico) => {
    setEditingService(service);
    setServiceFormData({
      data: service.data,
      valor: service.valor.toString(),
      cliente_id: service.cliente_id,
      status: service.status,
      descricao: service.descricao,
      localizacao: service.localizacao
    });
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

  const handleDeleteService = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(prev => prev.filter(c => c.id !== id));
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

  const handleAddExpense = async (expenseData: CreateGastoServicoDTO) => {
    try {
      // Aqui você faria a chamada para a API para salvar o gasto
      // const newExpense = await api.createExpense(expenseData);
      
      // Por enquanto, vamos simular a criação do gasto
      const newExpense: GastoServico = {
        id: Date.now().toString(),
        servico_id: expenseData.servico_id,
        user_id: expenseData.user_id,
        descricao: expenseData.descricao,
        valor: expenseData.valor,
        categoria_id: expenseData.categoria_id,
        data: expenseData.data,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      setExpenses(prev => [...prev, newExpense]);
      
      // Criar transação de despesa
      // await api.createTransaction({
      //   tipo: 'despesa',
      //   valor: expenseData.valor,
      //   descricao: expenseData.descricao,
      //   categoria_id: expenseData.categoria_id,
      //   data: expenseData.data
      // });
      
      handleCloseExpenseModal();
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
      setError('Erro ao adicionar gasto');
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
          {error}
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
                  type="number"
                  step="0.01"
                  value={serviceFormData.valor}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, valor: e.target.value }))}
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
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
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
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
                        date: new Date().toISOString().split('T')[0],
                        value: '',
                        clientId: '',
                        status: 'pending',
                        description: '',
                        serviceLocation: ''
                      });
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
                  onChange={(e) => setClientFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={clientFormData.telefone}
                  onChange={(e) => setClientFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
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
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
                        name: '',
                        email: '',
                        phone: '',
                        address: ''
                      });
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
      {showExpenseModal && selectedServiceForExpense && (
        <AddExpenseModal
          isOpen={showExpenseModal}
          onClose={handleCloseExpenseModal}
          onAddExpense={handleAddExpense}
          serviceId={selectedServiceForExpense}
          categories={categories}
          onAddCategory={(category) => setCategories(prev => [...prev, category])}
        />
      )}
    </div>
  );
};

export default Services;