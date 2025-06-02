import React, { useState } from 'react';
import { transactionController } from '../controllers/TransactionController';
import { PaymentMethod, TransactionType } from '../models/Transaction';

const TransactionForm: React.FC = () => {
  // Simulando um usuário logado
  const mockUserId = '123456';
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: TransactionType.EXPENSE,
    category: '',
    paymentMethod: PaymentMethod.CASH
  });
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validação básica
      if (!formData.description || !formData.amount || !formData.category) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      const amountValue = parseFloat(formData.amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setError('O valor deve ser um número maior que zero.');
        return;
      }
      
      // Criando a transação
      transactionController.createTransaction({
        userId: mockUserId,
        description: formData.description,
        amount: amountValue,
        date: new Date(formData.date),
        type: formData.type as TransactionType,
        category: formData.category,
        paymentMethod: formData.paymentMethod as PaymentMethod
      });
      
      // Reset form e mostrar mensagem de sucesso
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: TransactionType.EXPENSE,
        category: '',
        paymentMethod: PaymentMethod.CASH
      });
      
      setError('');
      setIsSuccess(true);
      
      // Esconder mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError('Ocorreu um erro ao salvar a transação.');
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nova Transação</h1>
      
      {isSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Transação adicionada com sucesso!
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Descrição
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Ex: Compra de supermercado"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
            Valor (R$)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            step="0.01"
            min="0.01"
            placeholder="0.00"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            Data
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Tipo
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={TransactionType.INCOME}>Receita</option>
            <option value={TransactionType.EXPENSE}>Despesa</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            Categoria
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Ex: Alimentação, Transporte, Salário"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
            Método de Pagamento
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={PaymentMethod.CASH}>Dinheiro</option>
            <option value={PaymentMethod.CREDIT_CARD}>Cartão de Crédito</option>
            <option value={PaymentMethod.DEBIT_CARD}>Cartão de Débito</option>
            <option value={PaymentMethod.BANK_TRANSFER}>Transferência Bancária</option>
            <option value={PaymentMethod.PIX}>PIX</option>
          </select>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Salvar Transação
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm; 