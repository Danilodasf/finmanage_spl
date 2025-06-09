import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Eye, FileText, Calendar, User } from 'lucide-react';
import jsPDF from 'jspdf';
import { Servico, Cliente, GastoServico, CreateGastoServicoDTO, CategoriaDiarista } from '../models/DiaristaModels';
import { DICategoryController } from '../controllers/DICategoryController';
import { DIServicoController } from '../controllers/DIServicoController';
import { DIClienteController } from '../controllers/DIClienteController';
import { DIGastoController } from '../controllers/DIGastoController';
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


  const [categoryController] = useState(() => new DICategoryController());
  const [servicoController] = useState(() => new DIServicoController());
  const [clienteController] = useState(() => new DIClienteController());
  const [gastoController] = useState(() => new DIGastoController());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar serviços concluídos
      const servicesResult = await servicoController.getServicosByStatus('concluido');
      if (servicesResult.error) {
        setError(`Erro ao carregar serviços: ${servicesResult.error}`);
        setCompletedServices([]);
      } else {
        setCompletedServices(servicesResult.data || []);
      }
      
      // Carregar clientes
      const clientsResult = await clienteController.getAllClientes();
      if (clientsResult.error) {
        setError(`Erro ao carregar clientes: ${clientsResult.error}`);
        setClients([]);
      } else {
        setClients(clientsResult.data || []);
      }
      
      // Carregar gastos
      const expensesResult = await gastoController.getAllGastos();
      if (expensesResult.error) {
        setError(`Erro ao carregar gastos: ${expensesResult.error}`);
        setExpenses([]);
      } else {
        setExpenses(expensesResult.data || []);
      }
      
      // Carregar categorias
      const categoriesResult = await categoryController.getAllCategories();
      if (categoriesResult.error) {
        setError(`Erro ao carregar categorias: ${categoriesResult.error}`);
      } else if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
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
      const result = await gastoController.createGasto(expenseData);
      
      if (result.error) {
        setError(`Erro ao adicionar gasto: ${result.error}`);
        return;
      }
      
      if (result.data) {
        setExpenses(prev => [...prev, result.data!]);
        console.log('Gasto adicionado com sucesso:', result.data);
      }
      
      handleCloseExpenseModal();
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
      setError('Erro ao adicionar gasto');
    }
  };

  const getServiceExpenses = (serviceId: string): GastoServico[] => {
    return expenses.filter(expense => expense.servico_id === serviceId);
  };

  const calculateServiceProfit = (service: any): number => {
    const serviceExpenses = getServiceExpenses(service.id);
    const totalExpenses = serviceExpenses.reduce((sum, expense) => sum + expense.valor, 0);
    return service.valor - totalExpenses;
  };

  const calculateTotalRevenue = (): number => {
    return completedServices.reduce((sum, service) => sum + service.valor, 0);
  };

  const calculateTotalExpenses = (): number => {
    const serviceExpenses = expenses.reduce((sum, expense) => sum + expense.valor, 0);
    return serviceExpenses;
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

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Configurações de cores e fontes
    const primaryColor = [34, 197, 94]; // emerald-500
    const secondaryColor = [75, 85, 99]; // gray-600
    const accentColor = [239, 68, 68]; // red-500
    
    // Cabeçalho com design melhorado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE LUCROS POR SERVIÇOS', 105, 15, { align: 'center' });
    
    // Data do relatório
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 15, 35);
    
    // Linha separadora
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(15, 40, 195, 40);
    
    let yPosition = 50;
    
    // Resumo financeiro com caixas coloridas
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO FINANCEIRO', 15, yPosition);
    yPosition += 15;
    
    // Caixa de receitas
    doc.setFillColor(220, 252, 231); // green-50
    doc.setDrawColor(...primaryColor);
    doc.rect(15, yPosition - 5, 85, 20, 'FD');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total de Receitas:', 20, yPosition + 3);
    doc.text(`R$ ${calculateTotalRevenue().toFixed(2)}`, 20, yPosition + 10);
    
    // Caixa de despesas
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(...accentColor);
    doc.rect(110, yPosition - 5, 85, 20, 'FD');
    doc.setTextColor(...accentColor);
    doc.text('Total de Despesas:', 115, yPosition + 3);
    doc.text(`R$ ${calculateTotalExpenses().toFixed(2)}`, 115, yPosition + 10);
    
    yPosition += 30;
    
    // Lucro líquido com destaque
    const lucroLiquido = calculateTotalRevenue() - calculateTotalExpenses();
    const lucroColor = lucroLiquido >= 0 ? primaryColor : accentColor;
    const lucroBackground = lucroLiquido >= 0 ? [220, 252, 231] : [254, 242, 242];
    
    doc.setFillColor(lucroBackground[0], lucroBackground[1], lucroBackground[2]);
    doc.setDrawColor(lucroColor[0], lucroColor[1], lucroColor[2]);
    doc.rect(15, yPosition - 5, 180, 20, 'FD');
    doc.setTextColor(lucroColor[0], lucroColor[1], lucroColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LUCRO LÍQUIDO:', 20, yPosition + 3);
    doc.text(`R$ ${lucroLiquido.toFixed(2)}`, 20, yPosition + 10);
    
    yPosition += 35;
    
    // Detalhes por serviço
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALHES POR SERVIÇO', 15, yPosition);
    yPosition += 15;
    
    // Cabeçalho da tabela
    doc.setFillColor(243, 244, 246); // gray-100
    doc.setDrawColor(...secondaryColor);
    doc.rect(15, yPosition - 5, 180, 12, 'FD');
    
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVIÇO', 20, yPosition + 2);
    doc.text('CLIENTE', 70, yPosition + 2);
    doc.text('RECEITA', 120, yPosition + 2);
    doc.text('DESPESAS', 145, yPosition + 2);
    doc.text('LUCRO', 175, yPosition + 2);
    
    yPosition += 15;
    
    // Dados dos serviços
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    completedServices.forEach((service, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const serviceExpensesArray = getServiceExpenses(service.id);
      const serviceExpenses = serviceExpensesArray.reduce((sum, expense) => sum + expense.valor, 0);
      const serviceProfit = calculateServiceProfit(service.id);
      
      // Linha alternada
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251); // gray-50
        doc.rect(15, yPosition - 3, 180, 10, 'F');
      }
      
      doc.setTextColor(31, 41, 55); // gray-800
      doc.text(service.descricao.substring(0, 25), 20, yPosition + 2);
      
      const cliente = clients.find(c => c.id === service.cliente_id);
      doc.text(cliente ? cliente.nome.substring(0, 20) : 'N/A', 70, yPosition + 2);
      
      doc.setTextColor(...primaryColor);
      doc.text(`R$ ${service.valor.toFixed(2)}`, 120, yPosition + 2);
      
      doc.setTextColor(...accentColor);
      doc.text(`R$ ${serviceExpenses.toFixed(2)}`, 145, yPosition + 2);
      
      const profitColor = serviceProfit >= 0 ? primaryColor : accentColor;
      doc.setTextColor(...profitColor);
      doc.text(`R$ ${serviceProfit.toFixed(2)}`, 175, yPosition + 2);
      
      yPosition += 12;
    });
    
    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 285, 210, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('FinManage Diarista - Sistema de Gestão Financeira', 15, 292);
      doc.text(`Página ${i} de ${pageCount}`, 195, 292, { align: 'right' });
    }
    
    doc.save(`relatorio-lucros-servicos-${new Date().toISOString().split('T')[0]}.pdf`);
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
          onClick={generatePDF}
          disabled={completedServices.length === 0}
          className="flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
                          getServiceExpenses(selectedService.id).reduce((sum, exp) => sum + exp.valor, 0)
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