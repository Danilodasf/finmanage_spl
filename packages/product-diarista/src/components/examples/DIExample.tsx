/**
 * Componente de exemplo demonstrando o uso da injeção de dependências
 * Mostra como usar os hooks e controladores criados
 */

import React, { useState } from 'react';
import { useTransactions, useFinancialSummary } from '../../hooks/useTransactions';
import { useCategories, useCategoryStats } from '../../hooks/useCategories';
import { useAuth } from '../../hooks/useAuth';
import { TransactionType } from '../../lib/core/services';
import { TipoServicoDiarista } from '../../models/DiaristaModels';

// Componente principal de exemplo
export function DIExample() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Exemplo de Injeção de Dependências - Product Diarista
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AuthExample />
        <TransactionsExample />
        <CategoriesExample />
        <FinancialSummaryExample />
      </div>
    </div>
  );
}

// Exemplo de autenticação
function AuthExample() {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error, 
    profileStats,
    login, 
    register, 
    logout, 
    updateProfile,
    clearError 
  } = useAuth();
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', name: '' });
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    hourly_rate: 0
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(loginForm.email, loginForm.password);
    if (result.success) {
      setLoginForm({ email: '', password: '' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register(registerForm.email, registerForm.password, registerForm.name);
    if (result.success) {
      setRegisterForm({ email: '', password: '', name: '' });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile({
      name: profileForm.name || undefined,
      phone: profileForm.phone || undefined,
      hourly_rate: profileForm.hourly_rate > 0 ? profileForm.hourly_rate : undefined
    });
    if (result.success) {
      setProfileForm({ name: '', phone: '', hourly_rate: 0 });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Autenticação</h2>
      
      {loading && (
        <div className="text-blue-600 mb-4">Carregando...</div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}
      
      {!isAuthenticated ? (
        <div className="space-y-6">
          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            <h3 className="font-medium">Login</h3>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Entrar
            </button>
          </form>
          
          {/* Formulário de Registro */}
          <form onSubmit={handleRegister} className="space-y-4">
            <h3 className="font-medium">Registro</h3>
            <input
              type="text"
              placeholder="Nome"
              value={registerForm.name}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={registerForm.password}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Registrar
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-100 p-4 rounded">
            <h3 className="font-medium">Usuário Logado</h3>
            <p><strong>Nome:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            {user?.phone && <p><strong>Telefone:</strong> {user.phone}</p>}
            {user?.hourly_rate && <p><strong>Valor/hora:</strong> R$ {user.hourly_rate}</p>}
            {user?.rating && <p><strong>Avaliação:</strong> {user.rating}/5</p>}
          </div>
          
          {profileStats && (
            <div className="bg-blue-100 p-4 rounded">
              <h4 className="font-medium">Estatísticas do Perfil</h4>
              <p><strong>Completude:</strong> {profileStats.profileCompleteness}%</p>
              {profileStats.missingFields.length > 0 && (
                <p><strong>Campos faltando:</strong> {profileStats.missingFields.join(', ')}</p>
              )}
            </div>
          )}
          
          {/* Formulário de atualização de perfil */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="font-medium">Atualizar Perfil</h3>
            <input
              type="text"
              placeholder="Nome"
              value={profileForm.name}
              onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={profileForm.phone}
              onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Valor por hora"
              value={profileForm.hourly_rate || ''}
              onChange={(e) => setProfileForm(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Atualizar
            </button>
          </form>
          
          <button 
            onClick={logout}
            disabled={loading}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

// Exemplo de transações
function TransactionsExample() {
  const { 
    transactions, 
    loading, 
    error, 
    createTransaction, 
    deleteTransaction,
    refreshTransactions,
    clearError 
  } = useTransactions();
  
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: 0,
    type: 'income' as TransactionType,
    category_id: '',
    cliente: '',
    endereco: ''
  });

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createTransaction({
      description: newTransaction.description,
      amount: newTransaction.amount,
      type: newTransaction.type,
      category_id: newTransaction.category_id || undefined,
      cliente: newTransaction.cliente || undefined,
      endereco: newTransaction.endereco || undefined,
      date: new Date()
    });
    
    if (result.success) {
      setNewTransaction({
        description: '',
        amount: 0,
        type: 'income',
        category_id: '',
        cliente: '',
        endereco: ''
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Transações</h2>
      
      {loading && (
        <div className="text-blue-600 mb-4">Carregando...</div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Formulário para nova transação */}
      <form onSubmit={handleCreateTransaction} className="space-y-4 mb-6">
        <h3 className="font-medium">Nova Transação</h3>
        <input
          type="text"
          placeholder="Descrição"
          value={newTransaction.description}
          onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Valor"
          value={newTransaction.amount || ''}
          onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: Number(e.target.value) }))}
          className="w-full p-2 border rounded"
          min="0"
          step="0.01"
          required
        />
        <select
          value={newTransaction.type}
          onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value as TransactionType }))}
          className="w-full p-2 border rounded"
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>
        <input
          type="text"
          placeholder="Cliente"
          value={newTransaction.cliente}
          onChange={(e) => setNewTransaction(prev => ({ ...prev, cliente: e.target.value }))}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Endereço"
          value={newTransaction.endereco}
          onChange={(e) => setNewTransaction(prev => ({ ...prev, endereco: e.target.value }))}
          className="w-full p-2 border rounded"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Criar Transação
        </button>
      </form>
      
      {/* Lista de transações */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Transações ({transactions.length})</h3>
          <button 
            onClick={refreshTransactions}
            disabled={loading}
            className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
          >
            Atualizar
          </button>
        </div>
        
        {transactions.length === 0 ? (
          <p className="text-gray-500">Nenhuma transação encontrada</p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    R$ {transaction.amount.toFixed(2)} - {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </p>
                  {transaction.cliente && (
                    <p className="text-sm text-gray-600">Cliente: {transaction.cliente}</p>
                  )}
                </div>
                <button 
                  onClick={() => deleteTransaction(transaction.id)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Deletar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Exemplo de categorias
function CategoriesExample() {
  const { 
    categories, 
    loading, 
    error, 
    createCategory, 
    createDefaultCategories,
    refreshCategories,
    clearError 
  } = useCategories();
  
  const { mostUsed } = useCategoryStats();
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'income' as TransactionType,
    service_type: 'limpeza_residencial' as TipoServicoDiarista
  });

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createCategory({
      name: newCategory.name,
      type: newCategory.type,
      service_type: newCategory.service_type
    });
    
    if (result.success) {
      setNewCategory({
        name: '',
        type: 'income',
        service_type: 'limpeza_residencial'
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Categorias</h2>
      
      {loading && (
        <div className="text-blue-600 mb-4">Carregando...</div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Botões de ação */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={createDefaultCategories}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Criar Padrão
        </button>
        <button 
          onClick={refreshCategories}
          disabled={loading}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Atualizar
        </button>
      </div>
      
      {/* Formulário para nova categoria */}
      <form onSubmit={handleCreateCategory} className="space-y-4 mb-6">
        <h3 className="font-medium">Nova Categoria</h3>
        <input
          type="text"
          placeholder="Nome da categoria"
          value={newCategory.name}
          onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
        <select
          value={newCategory.type}
          onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value as TransactionType }))}
          className="w-full p-2 border rounded"
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>
        <select
          value={newCategory.service_type}
          onChange={(e) => setNewCategory(prev => ({ ...prev, service_type: e.target.value as TipoServicoDiarista }))}
          className="w-full p-2 border rounded"
        >
          <option value="limpeza_residencial">Limpeza Residencial</option>
          <option value="limpeza_comercial">Limpeza Comercial</option>
          <option value="limpeza_pos_obra">Limpeza Pós-Obra</option>
          <option value="organizacao">Organização</option>
          <option value="passadoria">Passadoria</option>
          <option value="cuidados_especiais">Cuidados Especiais</option>
        </select>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Criar Categoria
        </button>
      </form>
      
      {/* Lista de categorias */}
      <div className="space-y-4">
        <h3 className="font-medium">Categorias ({categories.length})</h3>
        
        {categories.length === 0 ? (
          <p className="text-gray-500">Nenhuma categoria encontrada</p>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="border p-3 rounded">
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-gray-600">
                  {category.type === 'income' ? 'Receita' : 'Despesa'} - {category.service_type}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {/* Categorias mais usadas */}
        {mostUsed.length > 0 && (
          <div>
            <h4 className="font-medium text-sm">Mais Utilizadas</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {mostUsed.slice(0, 3).map((category) => (
                <span 
                  key={category.id} 
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Exemplo de resumo financeiro
function FinancialSummaryExample() {
  const { 
    totalReceitas, 
    totalDespesas, 
    saldo, 
    transacoesPendentes, 
    loading, 
    error, 
    refreshSummary 
  } = useFinancialSummary();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Resumo Financeiro</h2>
      
      {loading && (
        <div className="text-blue-600 mb-4">Carregando...</div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-medium text-green-800">Receitas</h3>
          <p className="text-2xl font-bold text-green-600">
            R$ {totalReceitas.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-red-100 p-4 rounded">
          <h3 className="font-medium text-red-800">Despesas</h3>
          <p className="text-2xl font-bold text-red-600">
            R$ {totalDespesas.toFixed(2)}
          </p>
        </div>
        
        <div className={`p-4 rounded ${saldo >= 0 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
          <h3 className={`font-medium ${saldo >= 0 ? 'text-blue-800' : 'text-yellow-800'}`}>
            Saldo
          </h3>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
            R$ {saldo.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-medium text-gray-800">Pendentes</h3>
          <p className="text-2xl font-bold text-gray-600">
            {transacoesPendentes}
          </p>
        </div>
      </div>
      
      <button 
        onClick={refreshSummary}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        Atualizar Resumo
      </button>
    </div>
  );
}