import React, { useState } from 'react';
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
import { Cliente, clientesMock } from '../models/Cliente';
import { Venda, vendasMock } from '../models/Venda';
import { ClienteDialog } from '../components/clientes/ClienteDialog';
import { VendaDialog } from '../components/vendas/VendaDialog';
import { DeleteConfirmation } from '../components/ui/DeleteConfirmation';

/**
 * Componente para gerenciamento de vendas do MEI
 */
const Vendas: React.FC = () => {
  // Estado para clientes
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | undefined>(undefined);
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [isDeleteClienteDialogOpen, setIsDeleteClienteDialogOpen] = useState(false);
  
  // Estado para vendas
  const [vendas, setVendas] = useState<Venda[]>(vendasMock);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | undefined>(undefined);
  const [isVendaDialogOpen, setIsVendaDialogOpen] = useState(false);
  const [vendaSearchTerm, setVendaSearchTerm] = useState('');
  const [isDeleteVendaDialogOpen, setIsDeleteVendaDialogOpen] = useState(false);
  
  // Formulário de venda rápida
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [clienteId, setClienteId] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('');
  const [comprovante, setComprovante] = useState<File | null>(null);
  
  // Filtros
  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(clienteSearchTerm.toLowerCase()) || 
    cliente.email.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
    cliente.telefone.includes(clienteSearchTerm)
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

  const handleEditCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setIsClienteDialogOpen(true);
  };

  const handleDeleteCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setIsDeleteClienteDialogOpen(true);
  };

  const confirmDeleteCliente = () => {
    if (clienteSelecionado) {
      setClientes(clientes.filter(c => c.id !== clienteSelecionado.id));
      toast({
        title: 'Cliente excluído',
        description: 'O cliente foi excluído com sucesso.',
      });
    }
  };

  const handleSaveCliente = (cliente: Cliente) => {
    if (cliente.id === 0) {
      // Novo cliente
      const novoCliente = {
        ...cliente,
        id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1
      };
      setClientes([...clientes, novoCliente]);
      toast({
        title: 'Cliente cadastrado',
        description: 'O cliente foi cadastrado com sucesso.',
      });
    } else {
      // Atualização de cliente existente
      setClientes(clientes.map(c => c.id === cliente.id ? cliente : c));
      toast({
        title: 'Cliente atualizado',
        description: 'Os dados do cliente foram atualizados com sucesso.',
      });
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

  const confirmDeleteVenda = () => {
    if (vendaSelecionada) {
      setVendas(vendas.filter(v => v.id !== vendaSelecionada.id));
      toast({
        title: 'Venda excluída',
        description: 'A venda foi excluída com sucesso.',
      });
    }
  };

  const handleSaveVenda = (venda: Venda) => {
    if (venda.id === 0) {
      // Nova venda
      const novaVenda = {
        ...venda,
        id: vendas.length > 0 ? Math.max(...vendas.map(v => v.id)) + 1 : 1
      };
      setVendas([...vendas, novaVenda]);
      toast({
        title: 'Venda registrada',
        description: 'A venda foi registrada com sucesso.',
      });
    } else {
      // Atualização de venda existente
      setVendas(vendas.map(v => v.id === venda.id ? venda : v));
      toast({
        title: 'Venda atualizada',
        description: 'Os dados da venda foram atualizados com sucesso.',
      });
    }
  };

  // Manipulador para o formulário de venda rápida
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setComprovante(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulando envio para API
    setTimeout(() => {
      const clienteSelecionado = clientes.find(c => c.id === Number(clienteId));
      
      const novaVenda: Venda = {
        id: vendas.length > 0 ? Math.max(...vendas.map(v => v.id)) + 1 : 1,
        clienteId: Number(clienteId),
        clienteNome: clienteSelecionado?.nome || '',
        data: format(date || new Date(), 'dd/MM/yyyy'),
        descricao,
        valor: `R$ ${valor}`,
        formaPagamento: formaPagamento.charAt(0).toUpperCase() + formaPagamento.slice(1)
      };

      setVendas([...vendas, novaVenda]);

      toast({
        title: 'Venda registrada',
        description: 'A venda foi registrada com sucesso.',
      });
      
      setIsLoading(false);
      // Resetar formulário
      setClienteId('');
      setDescricao('');
      setValor('');
      setFormaPagamento('');
      setComprovante(null);
    }, 1500);
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
                    <Select value={clienteId} onValueChange={setClienteId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id.toString()}>
                            {cliente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    placeholder="Descrição da venda"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      placeholder="Ex: 350,00"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                    <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                      <SelectTrigger>
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comprovante">Comprovante/Nota Fiscal (opcional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="comprovante"
                      type="file"
                      onChange={handleFileChange}
                    />
                    {comprovante && (
                      <div className="text-sm text-gray-500">
                        {comprovante.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="bg-emerald-800 hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Salvando...' : 'Registrar Venda'}
                    <Plus className="ml-2 h-4 w-4" />
                  </Button>
                </div>
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
                    {vendasFiltradas.map((venda) => (
                      <tr key={venda.id} className="border-b">
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
                    {vendasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                          Nenhuma venda encontrada
                        </td>
                      </tr>
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
                    {clientesFiltrados.map((cliente) => (
                      <tr key={cliente.id} className="border-b">
                        <td className="px-4 py-3">{cliente.nome}</td>
                        <td className="px-4 py-3">{cliente.email}</td>
                        <td className="px-4 py-3">{cliente.telefone}</td>
                        <td className="px-4 py-3">{cliente.cpfCnpj || '-'}</td>
                        <td className="px-4 py-3">{cliente.dataCadastro}</td>
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
                    {clientesFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                          Nenhum cliente encontrado
                        </td>
                      </tr>
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