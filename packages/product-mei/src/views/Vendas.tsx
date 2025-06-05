import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CalendarIcon, FileText, Plus, Search, Edit, Trash2, UserPlus, Users } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '../hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Venda } from '../models/Venda';
import { ClienteDialog } from '../components/clientes/ClienteDialog';
import { VendaDialog } from '../components/vendas/VendaDialog';
import { DeleteConfirmation } from '../components/ui/DeleteConfirmation';
import { ClienteController } from '../controllers/ClienteController';
import { VendaController } from '../controllers/VendaController';
import { ClienteFormData, adaptClienteFormToCreateDTO, adaptClienteFormToUpdateDTO } from '../adapters/ClienteFormAdapter';
import { adaptSupabaseClientesToModel } from '../adapters/ClienteAdapter';
import { adaptSupabaseVendasToModel, adaptModelVendaToCreateDTO, adaptModelVendaToUpdateDTO, convertStringValorToNumber } from '../adapters/VendaAdapter';
import { isValidMoneyValue, formatMoneyValue } from '../utils/validation';
import { AlertCircle } from 'lucide-react';

/**
 * Componente para gerenciamento de vendas do MEI
 */
const Vendas: React.FC = () => {
  // Estado para clientes
  const [clientes, setClientes] = useState<ClienteFormData[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteFormData | undefined>(undefined);
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [isDeleteClienteDialogOpen, setIsDeleteClienteDialogOpen] = useState(false);
  const [isLoadingClientes, setIsLoadingClientes] = useState(false);
  
  // Estado para vendas
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | undefined>(undefined);
  const [isVendaDialogOpen, setIsVendaDialogOpen] = useState(false);
  const [vendaSearchTerm, setVendaSearchTerm] = useState('');
  const [isDeleteVendaDialogOpen, setIsDeleteVendaDialogOpen] = useState(false);
  const [isLoadingVendas, setIsLoadingVendas] = useState(false);
  
  // Formulário de venda rápida
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [clienteId, setClienteId] = useState<number>(0);
  const [descricao, setDescricao] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('');
  const [comprovante, setComprovante] = useState<File | null>(null);
  
  // Estados para validação do formulário de venda rápida
  const [clienteIdError, setClienteIdError] = useState('');
  const [descricaoError, setDescricaoError] = useState('');
  const [valorError, setValorError] = useState('');
  const [formaPagamentoError, setFormaPagamentoError] = useState('');
  
  // Carregar clientes e vendas ao iniciar o componente
  useEffect(() => {
    fetchClientes();
    fetchVendas();
  }, []);
  
  // Função para buscar clientes do servidor
  const fetchClientes = async () => {
    setIsLoadingClientes(true);
    try {
      const data = await ClienteController.getAll();
      // Converte os clientes da API para o formato do formulário
      const clientesForm = adaptSupabaseClientesToModel(data);
      setClientes(clientesForm);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoadingClientes(false);
    }
  };

  // Função para buscar vendas do servidor
  const fetchVendas = async () => {
    setIsLoadingVendas(true);
    try {
      const data = await VendaController.getAll();
      
      // Verificar se há algum ID inválido
      if (data && data.length > 0) {
        const invalidIds = data.filter(v => !v.id || v.id === 'null' || v.id === 'undefined');
        if (invalidIds.length > 0) {
          console.warn('Vendas com IDs inválidos:', invalidIds);
        }
      }
      
      // Converte as vendas da API para o formato do modelo
      const vendasModel = adaptSupabaseVendasToModel(data);
      
      // Verificar se há NaN IDs após conversão
      const nanIds = vendasModel.filter(v => isNaN(v.id));
      if (nanIds.length > 0) {
        console.error('Vendas com IDs NaN após adaptação:', nanIds);
      }
      
      console.log('Vendas após adaptação:', vendasModel);
      setVendas(vendasModel);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    } finally {
      setIsLoadingVendas(false);
    }
  };
  
  // Filtros
  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(clienteSearchTerm.toLowerCase()) || 
    (cliente.email && cliente.email.toLowerCase().includes(clienteSearchTerm.toLowerCase())) ||
    (cliente.telefone && cliente.telefone.includes(clienteSearchTerm)) ||
    (cliente.cpfCnpj && cliente.cpfCnpj.includes(clienteSearchTerm))
  );

  const vendasFiltradas = vendas.filter(venda => 
    venda.clienteNome.toLowerCase().includes(vendaSearchTerm.toLowerCase()) || 
    venda.descricao.toLowerCase().includes(vendaSearchTerm.toLowerCase())
  );

  // Manipuladores para clientes
  const handleAddCliente = () => {
    setClienteSelecionado(undefined);
    setIsClienteDialogOpen(true);
  };

  const handleEditCliente = (cliente: ClienteFormData) => {
    setClienteSelecionado(cliente);
    setIsClienteDialogOpen(true);
  };

  const handleDeleteCliente = (cliente: ClienteFormData) => {
    setClienteSelecionado(cliente);
    setIsDeleteClienteDialogOpen(true);
  };

  const confirmDeleteCliente = async () => {
    if (clienteSelecionado && clienteSelecionado.id) {
      setIsLoading(true);
      try {
        console.log('Excluindo cliente com ID:', clienteSelecionado.id, 'Tipo:', typeof clienteSelecionado.id);
        // Converter id de number para string para o ClienteController
        const success = await ClienteController.delete(String(clienteSelecionado.id));
        if (success) {
          await fetchClientes(); // Recarregar a lista após excluir
          toast({
            title: 'Cliente excluído',
            description: 'O cliente foi excluído com sucesso.',
          });
        } else {
          console.error('Falha ao excluir cliente. ID:', clienteSelecionado.id);
          toast({
            title: 'Erro',
            description: 'Não foi possível excluir o cliente. Verifique se não há vendas associadas.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao excluir o cliente. Tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        setIsDeleteClienteDialogOpen(false);
      }
    }
  };

  const handleSaveCliente = async (cliente: ClienteFormData) => {
    setIsLoading(true);
    try {
      if (cliente.id) {
        // Atualizar cliente existente
        console.log('Atualizando cliente com ID:', cliente.id, 'Tipo:', typeof cliente.id);
        await ClienteController.update(String(cliente.id), adaptClienteFormToUpdateDTO(cliente));
      } else {
        // Criar novo cliente
        console.log('Criando novo cliente');
        await ClienteController.create(adaptClienteFormToCreateDTO(cliente));
      }
      
      // Recarregar a lista de clientes
      await fetchClientes();
      // Fechar o diálogo após salvar
      setIsClienteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o cliente. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manipuladores para vendas
  const handleAddVenda = () => {
    setVendaSelecionada(undefined);
    setIsVendaDialogOpen(true);
  };

  const handleEditVenda = (venda: Venda) => {
    setVendaSelecionada(venda);
    setIsVendaDialogOpen(true);
  };

  const handleDeleteVenda = (venda: Venda) => {
    setVendaSelecionada(venda);
    setIsDeleteVendaDialogOpen(true);
  };

  const confirmDeleteVenda = async () => {
    if (vendaSelecionada) {
      setIsLoading(true);
      try {
        console.log('Excluindo venda com ID:', vendaSelecionada.id, 'Tipo:', typeof vendaSelecionada.id);
        const success = await VendaController.delete(String(vendaSelecionada.id));
        if (success) {
          await fetchVendas(); // Recarregar a lista após excluir
          toast({
            title: 'Venda excluída',
            description: 'A venda foi excluída com sucesso.',
          });
        } else {
          console.error('Falha ao excluir venda. ID:', vendaSelecionada.id);
          toast({
            title: 'Erro',
            description: 'Não foi possível excluir a venda. Tente novamente.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao excluir a venda. Tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        setIsDeleteVendaDialogOpen(false);
      }
    }
  };

  const handleSaveVenda = async (venda: Venda) => {
    // Evitar processamento duplicado
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log('Salvando venda:', venda);
      
      if (venda.id === 0) {
        // Nova venda
        console.log('Criando nova venda');
        await VendaController.create(adaptModelVendaToCreateDTO(venda));
        toast({
          title: 'Venda registrada',
          description: 'A venda foi registrada com sucesso.',
        });
      } else {
        // Atualização de venda existente
        console.log('Atualizando venda existente. ID:', venda.id, 'Tipo:', typeof venda.id);
        const updateDTO = adaptModelVendaToUpdateDTO(venda);
        console.log('UpdateDTO:', updateDTO);
        await VendaController.update(String(venda.id), updateDTO);
        toast({
          title: 'Venda atualizada',
          description: 'A venda foi atualizada com sucesso.',
        });
      }
      
      // Recarregar a lista de vendas
      await fetchVendas();
      // Fechar o dialog após salvar
      setIsVendaDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a venda. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manipulador para o formulário de venda rápida
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setComprovante(e.target.files[0]);
    }
  };

  // Resetar erros de validação
  const resetFormErrors = () => {
    setClienteIdError('');
    setDescricaoError('');
    setValorError('');
    setFormaPagamentoError('');
  };
  
  // Manipuladores para validação do formulário de venda rápida
  const handleClienteIdChange = (value: string) => {
    const id = Number(value);
    setClienteId(id);
    
    if (!id) {
      setClienteIdError('Cliente é obrigatório');
    } else {
      setClienteIdError('');
    }
  };
  
  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescricao(value);
    
    if (!value.trim()) {
      setDescricaoError('Descrição é obrigatória');
    } else {
      setDescricaoError('');
    }
  };
  
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Permitir apenas números, vírgula e ponto
    const cleanValue = value.replace(/[^\d,.]/g, '');
    
    setValor(cleanValue);
    
    if (!cleanValue) {
      setValorError('Valor é obrigatório');
    } else if (!isValidMoneyValue(cleanValue)) {
      setValorError('Valor inválido. Use o formato 0,00');
    } else {
      setValorError('');
    }
  };
  
  // Impedir entrada de caracteres não permitidos no campo de valor
  const handleValorKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite apenas números, vírgula e ponto
    const regex = /^[0-9.,]+$/;
    const char = e.key;
    
    // Permitir teclas de controle como Backspace, Delete, etc.
    if (e.key.length > 1) return;
    
    // Verificar se já tem uma vírgula ou ponto e o usuário está tentando adicionar outro
    if ((char === ',' || char === '.') && (e.currentTarget.value.includes(',') || e.currentTarget.value.includes('.'))) {
      e.preventDefault();
      return;
    }
    
    // Verificar se já tem duas casas decimais após a vírgula/ponto
    if (char !== ',' && char !== '.') {
      const parts = e.currentTarget.value.split(/[,.]/);
      if (parts.length > 1 && parts[1].length >= 2) {
        e.preventDefault();
        return;
      }
    }
    
    if (!regex.test(char)) {
      e.preventDefault();
    }
  };
  
  const handleFormaPagamentoChange = (value: string) => {
    setFormaPagamento(value);
    
    if (!value) {
      setFormaPagamentoError('Forma de pagamento é obrigatória');
    } else {
      setFormaPagamentoError('');
    }
  };
  
  // Validar formulário de venda rápida
  const validateVendaRapidaForm = (): boolean => {
    let isValid = true;
    
    // Validar cliente
    if (!clienteId) {
      setClienteIdError('Cliente é obrigatório');
      isValid = false;
    }
    
    // Validar descrição
    if (!descricao.trim()) {
      setDescricaoError('Descrição é obrigatória');
      isValid = false;
    }
    
    // Validar valor
    if (!valor) {
      setValorError('Valor é obrigatório');
      isValid = false;
    } else if (!isValidMoneyValue(valor)) {
      setValorError('Valor inválido. Use o formato 0,00');
      isValid = false;
    }
    
    // Validar forma de pagamento
    if (!formaPagamento) {
      setFormaPagamentoError('Forma de pagamento é obrigatória');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Evitar processamento duplicado
    if (isLoading) return;
    
    // Validar formulário
    if (!validateVendaRapidaForm()) {
      toast({
        title: 'Erro de validação',
        description: 'Corrija os erros no formulário antes de continuar.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const clienteSelecionado = clientes.find(c => c.id === clienteId);
      
      // Criar objeto de venda no formato da API
      const vendaDTO = {
        cliente_id: clienteId ? String(clienteId) : undefined,
        cliente_nome: clienteSelecionado?.nome,
        data: format(date || new Date(), 'yyyy-MM-dd'),
        descricao,
        valor: Number(valor.replace(',', '.')),
        forma_pagamento: formaPagamento.toLowerCase(),
        comprovante: comprovante || undefined
      };
      
      // Enviar para a API
      await VendaController.create(vendaDTO);
      
      // Recarregar vendas
      await fetchVendas();
      
      toast({
        title: 'Venda registrada',
        description: 'A venda foi registrada com sucesso.',
      });
      
      // Resetar formulário
      setClienteId(0);
      setDescricao('');
      setValor('');
      setFormaPagamento('');
      setComprovante(null);
      resetFormErrors();
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a venda. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Formatar a data de cadastro
  const formatarDataCadastro = (data: string | undefined) => {
    if (!data) return '-';
    try {
      // Se a data estiver no formato ISO (YYYY-MM-DD), converter para DD/MM/YYYY
      if (data.includes('-')) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
      }
      return data;
    } catch (error) {
      return data;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Gerenciamento de Vendas</h1>
        </div>

        <Tabs defaultValue="vendas" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
          </TabsList>
          
          {/* Conteúdo da aba Vendas */}
          <TabsContent value="vendas" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Registrar Nova Venda</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente</Label>
                    <Select value={String(clienteId)} onValueChange={handleClienteIdChange}>
                      <SelectTrigger className={clienteIdError ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id || 0} value={String(cliente.id || 0)}>
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {clienteIdError && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {clienteIdError}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data">Data da Venda</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={descricao}
                    onChange={handleDescricaoChange}
                    placeholder="Descrição da venda"
                    className={descricaoError ? "border-red-500" : ""}
                  />
                  {descricaoError && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {descricaoError}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      value={valor}
                      onChange={handleValorChange}
                      onKeyPress={handleValorKeyPress}
                      placeholder="Ex: 350,00"
                      className={valorError ? "border-red-500" : ""}
                    />
                    {valorError && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {valorError}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                    <Select value={formaPagamento} onValueChange={handleFormaPagamentoChange}>
                      <SelectTrigger className={formaPagamentoError ? "border-red-500" : ""}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="cartao">Cartão de Crédito/Débito</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                    {formaPagamentoError && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {formaPagamentoError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comprovante">Comprovante (opcional)</Label>
                  <Input
                    id="comprovante"
                    type="file"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="bg-emerald-800 hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Registrar Venda'}
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Histórico de Vendas</h2>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar vendas..."
                      className="pl-8"
                      value={vendaSearchTerm}
                      onChange={(e) => setVendaSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleAddVenda}
                    className="bg-emerald-800 hover:bg-emerald-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Venda
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Cliente</th>
                      <th className="px-4 py-2 text-left">Data</th>
                      <th className="px-4 py-2 text-left">Descrição</th>
                      <th className="px-4 py-2 text-left">Valor</th>
                      <th className="px-4 py-2 text-left">Forma de Pagamento</th>
                      <th className="px-4 py-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingVendas ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                          Carregando vendas...
                        </td>
                      </tr>
                    ) : (
                      <>
                        {vendasFiltradas.map((venda, index) => (
                          <tr key={venda.id ? venda.id : `venda-${index}`} className="border-b">
                            <td className="px-4 py-3">{venda.clienteNome}</td>
                            <td className="px-4 py-3">{venda.data}</td>
                            <td className="px-4 py-3">{venda.descricao}</td>
                            <td className="px-4 py-3">{venda.valor}</td>
                            <td className="px-4 py-3">{venda.formaPagamento}</td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditVenda(venda)}
                                  title="Editar venda"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteVenda(venda)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Excluir venda"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {vendasFiltradas.length === 0 && !isLoadingVendas && (
                          <tr>
                            <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                              Nenhuma venda encontrada
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
          
          {/* Conteúdo da aba Clientes */}
          <TabsContent value="clientes" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Cadastro de Clientes</h2>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar clientes..."
                      className="pl-8"
                      value={clienteSearchTerm}
                      onChange={(e) => setClienteSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleAddCliente}
                    className="bg-emerald-800 hover:bg-emerald-700"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Cliente
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Telefone</th>
                      <th className="px-4 py-2 text-left">CPF/CNPJ</th>
                      <th className="px-4 py-2 text-left">Data de Cadastro</th>
                      <th className="px-4 py-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingClientes ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                          Carregando clientes...
                        </td>
                      </tr>
                    ) : (
                      <>
                        {clientesFiltrados.map((cliente, index) => (
                          <tr key={cliente.id ? cliente.id : `cliente-${index}`} className="border-b">
                            <td className="px-4 py-3">{cliente.nome}</td>
                            <td className="px-4 py-3">{cliente.email || '-'}</td>
                            <td className="px-4 py-3">{cliente.telefone || '-'}</td>
                            <td className="px-4 py-3">{cliente.cpfCnpj || '-'}</td>
                            <td className="px-4 py-3">{formatarDataCadastro(cliente.dataCadastro)}</td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditCliente(cliente)}
                                  title="Editar cliente"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteCliente(cliente)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Excluir cliente"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {clientesFiltrados.length === 0 && !isLoadingClientes && (
                          <tr>
                            <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                              Nenhum cliente encontrado
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogos */}
      <ClienteDialog 
        isOpen={isClienteDialogOpen}
        onClose={() => setIsClienteDialogOpen(false)}
        onSave={handleSaveCliente}
        cliente={clienteSelecionado}
      />

      <VendaDialog 
        isOpen={isVendaDialogOpen}
        onClose={() => setIsVendaDialogOpen(false)}
        onSave={handleSaveVenda}
        venda={vendaSelecionada}
        clientes={clientes}
      />

      <DeleteConfirmation 
        isOpen={isDeleteClienteDialogOpen}
        onClose={() => setIsDeleteClienteDialogOpen(false)}
        onDelete={confirmDeleteCliente}
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
      />

      <DeleteConfirmation 
        isOpen={isDeleteVendaDialogOpen}
        onClose={() => setIsDeleteVendaDialogOpen(false)}
        onDelete={confirmDeleteVenda}
        title="Excluir Venda"
        description="Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita."
      />
    </MainLayout>
  );
};

export default Vendas; 