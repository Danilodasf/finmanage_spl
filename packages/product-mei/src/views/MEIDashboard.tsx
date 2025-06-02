import React, { useState, useEffect } from 'react';
import { businessController } from '../controllers/BusinessController';
import { invoiceController } from '../controllers/InvoiceController';
import { Business } from '../models/Business';
import { Invoice, InvoiceStatus } from '../models/Invoice';

const MEIDashboard: React.FC = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  
  // Simulando um usuário logado
  const mockOwnerId = '123456';

  useEffect(() => {
    // Em um cenário real, buscaríamos os dados do usuário logado
    const userBusiness = businessController.getBusinessByOwnerId(mockOwnerId);
    if (userBusiness) {
      setBusiness(userBusiness);
      
      // Buscar as notas fiscais do negócio
      const businessInvoices = invoiceController.getInvoicesByBusinessId(userBusiness.id);
      setInvoices(businessInvoices);
      
      // Calcular a receita do mês atual
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const revenue = invoiceController.calculateRevenue(userBusiness.id, startOfMonth, endOfMonth);
      setMonthlyRevenue(revenue);
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard MEI</h1>

      {business ? (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">{business.tradeName}</h2>
            <p className="text-sm text-gray-600">CNPJ: {business.cnpj}</p>
            <p className="text-sm text-gray-600">{business.activity}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-2">Receita do Mês</h2>
              <p className="text-2xl font-bold text-green-600">
                R$ {monthlyRevenue.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-2">Notas Fiscais</h2>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Emitidas</p>
                  <p className="text-xl font-bold">
                    {invoices.filter(i => i.status === InvoiceStatus.ISSUED).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pagas</p>
                  <p className="text-xl font-bold text-green-600">
                    {invoices.filter(i => i.status === InvoiceStatus.PAID).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Últimas Notas Fiscais</h2>
            {invoices.length === 0 ? (
              <p className="text-gray-500">Nenhuma nota fiscal encontrada.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {invoices.slice(0, 5).map((invoice) => (
                  <li key={invoice.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(invoice.issueDate).toLocaleDateString()} • {invoice.clientName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {invoice.amount.toFixed(2)}</p>
                        <p className={`text-sm ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Cadastre seu MEI</h2>
          <p className="text-gray-600 mb-4">
            Você ainda não possui um MEI cadastrado. Cadastre seu negócio para começar a emitir notas fiscais.
          </p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Cadastrar MEI
          </button>
        </div>
      )}
    </div>
  );
};

// Funções auxiliares para exibição do status
function getStatusText(status: InvoiceStatus): string {
  switch (status) {
    case InvoiceStatus.DRAFT: return 'Rascunho';
    case InvoiceStatus.ISSUED: return 'Emitida';
    case InvoiceStatus.PAID: return 'Paga';
    case InvoiceStatus.CANCELED: return 'Cancelada';
    default: return '';
  }
}

function getStatusColor(status: InvoiceStatus): string {
  switch (status) {
    case InvoiceStatus.DRAFT: return 'text-gray-600';
    case InvoiceStatus.ISSUED: return 'text-yellow-600';
    case InvoiceStatus.PAID: return 'text-green-600';
    case InvoiceStatus.CANCELED: return 'text-red-600';
    default: return '';
  }
}

export default MEIDashboard; 