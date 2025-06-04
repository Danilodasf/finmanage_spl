import React, { useState } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CalendarIcon, FileText, Plus, Search } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '../hooks/use-toast';

/**
 * Componente para gerenciamento de vendas do MEI
 */
const Vendas: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [cliente, setCliente] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('');
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [vendas, setVendas] = useState([
    { id: 1, cliente: 'João Silva', data: '10/05/2023', descricao: 'Consultoria de Marketing', valor: 'R$ 350,00', formaPagamento: 'PIX' },
    { id: 2, cliente: 'Maria Oliveira', data: '15/05/2023', descricao: 'Design de Logo', valor: 'R$ 500,00', formaPagamento: 'Transferência' },
    { id: 3, cliente: 'Carlos Santos', data: '22/05/2023', descricao: 'Desenvolvimento de Landing Page', valor: 'R$ 1.200,00', formaPagamento: 'Cartão' },
  ]);

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
      const novaVenda = {
        id: vendas.length + 1,
        cliente,
        data: format(date || new Date(), 'dd/MM/yyyy'),
        descricao,
        valor: `R$ ${valor}`,
        formaPagamento
      };

      setVendas([...vendas, novaVenda]);

      toast({
        title: 'Venda registrada',
        description: 'A venda foi registrada com sucesso.',
      });
      
      setIsLoading(false);
      // Resetar formulário
      setCliente('');
      setDescricao('');
      setValor('');
      setFormaPagamento('');
      setComprovante(null);
    }, 1500);
  };

  const vendasFiltradas = vendas.filter(venda => 
    venda.cliente.toLowerCase().includes(searchTerm.toLowerCase()) || 
    venda.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Gerenciamento de Vendas</h1>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Registrar Nova Venda</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  placeholder="Nome do cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                />
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
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar vendas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                    <td className="px-4 py-3">{venda.cliente}</td>
                    <td className="px-4 py-3">{venda.data}</td>
                    <td className="px-4 py-3">{venda.descricao}</td>
                    <td className="px-4 py-3">{venda.valor}</td>
                    <td className="px-4 py-3">{venda.formaPagamento}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
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
      </div>
    </MainLayout>
  );
};

export default Vendas; 