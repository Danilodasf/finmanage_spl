import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Venda } from '../../models/Venda';
import { Cliente } from '../../models/Cliente';

interface VendaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (venda: Venda) => void;
  venda?: Venda;
  clientes: Cliente[];
}

export const VendaDialog: React.FC<VendaDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  venda,
  clientes
}) => {
  const [clienteId, setClienteId] = useState<number | string>('');
  const [data, setData] = useState<Date | undefined>(new Date());
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (venda) {
      setClienteId(venda.clienteId);
      // Converter string de data para objeto Date
      try {
        const dateParts = venda.data.split('/');
        if (dateParts.length === 3) {
          const parsedDate = new Date(
            parseInt(dateParts[2]), 
            parseInt(dateParts[1]) - 1, 
            parseInt(dateParts[0])
          );
          setData(parsedDate);
        }
      } catch (error) {
        console.error('Erro ao converter data:', error);
        setData(new Date());
      }
      setDescricao(venda.descricao);
      setValor(venda.valor.replace('R$ ', ''));
      setFormaPagamento(venda.formaPagamento.toLowerCase());
    } else {
      resetForm();
    }
  }, [venda, isOpen]);

  const resetForm = () => {
    setClienteId('');
    setData(new Date());
    setDescricao('');
    setValor('');
    setFormaPagamento('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const clienteSelecionado = clientes.find(c => c.id === Number(clienteId));

    const novaVenda: Venda = {
      id: venda?.id || 0,
      clienteId: Number(clienteId),
      clienteNome: clienteSelecionado?.nome || '',
      data: data ? format(data, 'dd/MM/yyyy') : new Date().toLocaleDateString(),
      descricao,
      valor: `R$ ${valor}`,
      formaPagamento: formaPagamento.charAt(0).toUpperCase() + formaPagamento.slice(1)
    };

    setTimeout(() => {
      onSave(novaVenda);
      setIsLoading(false);
      onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{venda ? 'Editar Venda' : 'Registrar Nova Venda'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select 
                value={clienteId.toString()} 
                onValueChange={(value) => setClienteId(Number(value))}
                required
              >
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
              <Label htmlFor="data">Data da Venda *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="data"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? format(data, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição da venda"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="Ex: 350,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento} required>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : venda ? 'Salvar Alterações' : 'Registrar Venda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 