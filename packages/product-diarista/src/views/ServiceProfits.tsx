import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Eye, FileText, Calendar, User } from 'lucide-react';
import jsPDF from 'jspdf';
import { Servico, Cliente, GastoServico, CreateGastoServicoDTO, CategoriaDiarista } from '../models/DiaristaModels';
import AddExpenseModal from '../components/AddExpenseModal';

// Interface removida - agora usando CreateGastoServicoDTO

const ServiceProfits: React.FC = () => {
  const [completedServices, setCompletedServices] = useState<Servico[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [expenses, setExpenses] = useState<GastoServico[]>([]);
  const [categories, setCategories] = useState<CategoriaDiarista[]>([]);
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Mock data - será substituído pela integração com Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados - apenas serviços com status 'paid'
      setCompletedServices([]);
      setClients([]);
      setExpenses([]);
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenExpenseModal = (service: Servico) => {
    setSelectedService(service);
    setShowExpenseModal(true);
  };

  const handleCloseExpenseModal = () => {
    setShowExpenseModal(false);
    setSelectedService(null);
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

  const getServiceExpenses = (serviceId: string): GastoServico[] => {
    return expenses.filter(expense => expense.servico_id === serviceId);
  };

  const calculateServiceProfit = (service: Servico): number => {
    const serviceExpenses = getServiceExpenses(service.id);
    const totalExpenses = serviceExpenses.reduce((sum, expense) => sum + expense.valor, 0);
    const transportCost = service.custo_transporte || 0;
    return service.valor - totalExpenses - transportCost;
  };

  const calculateTotalRevenue = (): number => {
    return completedServices.reduce((sum, service) => sum + service.valor, 0);
  };

  const calculateTotalExpenses = (): number => {
    const serviceExpenses = expenses.reduce((sum, expense) => sum + expense.valor, 0);
    const transportCosts = completedServices.reduce((sum, service) => sum + (service.custo_transporte || 0), 0);
    return serviceExpenses + transportCosts;
  };

  const calculateTotalProfit = (): number => {
    return calculateTotalRevenue() - calculateTotalExpenses();
  };

  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client?.nome || 'Cliente não encontrado';
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

  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório de Lucros por Serviço', 20, 30);
    
    // Data do relatório
    doc.setFontSize(12);
    doc.text(`Gerado em: ${formatDate(new Date())}`, 20, 45);
    
    // Resumo financeiro
    doc.setFontSize(14);
    doc.text('Resumo Financeiro', 20, 65);
    
    doc.setFontSize(12);
    doc.text(`Receita Total: ${formatCurrency(calculateTotalRevenue())}`, 20, 80);
    doc.text(`Gastos Totais: ${formatCurrency(calculateTotalExpenses())}`, 20, 95);
    doc.text(`Lucro Total: ${formatCurrency(calculateTotalProfit())}`, 20, 110);
    
    // Detalhes por serviço
    doc.setFontSize(14);
    doc.text('Detalhes por Serviço', 20, 130);
    
    let yPosition = 145;
    doc.setFontSize(10);
    
    completedServices.forEach((service, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const profit = calculateServiceProfit(service);
      const serviceExpenses = getServiceExpenses(service.id);
      const totalServiceExpenses = serviceExpenses.reduce((sum, exp) => sum + exp.valor, 0);
      
      doc.text(`${index + 1}. ${service.descricao}`, 20, yPosition);
      doc.text(`Cliente: ${getClientName(service.cliente_id)}`, 25, yPosition + 10);
      doc.text(`Data: ${formatDate(new Date(service.data))}`, 25, yPosition + 20);
      doc.text(`Receita: ${formatCurrency(service.valor)}`, 25, yPosition + 30);
      doc.text(`Gastos: ${formatCurrency(totalServiceExpenses + (service.custo_transporte || 0))}`, 25, yPosition + 40);
      doc.text(`Lucro: ${formatCurrency(profit)}`, 25, yPosition + 50);
      
      yPosition += 65;
    });
    
    doc.save('relatorio-lucros-servicos.pdf');
  };

  if (isLoading && completedServices.length === 0) {
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
        <h1 className="text-2xl font-bold text-emerald-800">Lucro por Serviço</h1>
        <button
          onClick={generatePDFReport}
          disabled={completedServices.length === 0}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span>Gerar Relatório PDF</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {typeof error === 'string' ? error : 'Erro inesperado'}
        </div>
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotalRevenue())}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gastos Totais</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(calculateTotalExpenses())}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Total</p>
              <p className={`text-2xl font-bold ${
                calculateTotalProfit() >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {formatCurrency(calculateTotalProfit())}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              calculateTotalProfit() >= 0 ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                calculateTotalProfit() >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Serviços Concluídos</h2>
        </div>
        {completedServices.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nenhum serviço concluído encontrado.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {completedServices.map((service) => {
              const profit = calculateServiceProfit(service);
              const serviceExpenses = getServiceExpenses(service.id);
              
              return (
                <div key={service.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{service.descricao}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(new Date(service.data))}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{getClientName(service.cliente_id)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Receita: {formatCurrency(service.valor)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            Lucro: {formatCurrency(profit)}
                          </span>
                        </div>
                      </div>
                      {serviceExpenses.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">{serviceExpenses.length} gasto(s) registrado(s)</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleOpenExpenseModal(service)}
                        className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Gasto</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setShowServiceDetails(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-2 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Detalhar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Gastos */}
      {showExpenseModal && selectedService && (
        <AddExpenseModal
          isOpen={showExpenseModal}
          onClose={handleCloseExpenseModal}
          onAddExpense={handleAddExpense}
          serviceId={selectedService.id}
          categories={categories}
          onAddCategory={(category) => setCategories(prev => [...prev, category])}
        />
      )}

      {/* Service Details Modal */}
      {showServiceDetails && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalhes do Serviço - {selectedService.descricao}
            </h3>
            
            {/* Service Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Data:</span>
                  <span className="ml-2">{formatDate(new Date(selectedService.data))}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Cliente:</span>
                  <span className="ml-2">{getClientName(selectedService.cliente_id)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Receita:</span>
                  <span className="ml-2 text-green-600 font-medium">{formatCurrency(selectedService.valor)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Lucro:</span>
                  <span className={`ml-2 font-medium ${
                    calculateServiceProfit(selectedService) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(calculateServiceProfit(selectedService))}
                  </span>
                </div>
              </div>
              {selectedService.custo_transporte && (
                <div className="mt-2 text-sm">
                  <span className="font-medium text-gray-700">Custo de locomoção:</span>
                  <span className="ml-2 text-red-600">{formatCurrency(selectedService.custo_transporte)}</span>
                </div>
              )}
            </div>

            {/* Expenses List */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Gastos Registrados</h4>
              {getServiceExpenses(selectedService.id).length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum gasto registrado para este serviço.</p>
              ) : (
                <div className="space-y-2">
                  {getServiceExpenses(selectedService.id).map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{expense.descricao}</p>
                        <p className="text-sm text-gray-600">
                          {expense.categoria} • {formatDate(new Date(expense.data))}
                        </p>
                      </div>
                      <span className="text-red-600 font-medium">{formatCurrency(expense.valor)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between items-center font-medium">
                      <span>Total de Gastos:</span>
                      <span className="text-red-600">
                        {formatCurrency(
                          getServiceExpenses(selectedService.id).reduce((sum, exp) => sum + exp.valor, 0) +
                          (selectedService.custo_transporte || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => {
                  setShowServiceDetails(false);
                  setSelectedService(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceProfits;