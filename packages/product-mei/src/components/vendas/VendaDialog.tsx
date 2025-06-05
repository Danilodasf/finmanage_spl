import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Venda } from '../../models/Venda';
import { ClienteFormData } from '../../adapters/ClienteFormAdapter';
import { isValidMoneyValue, formatMoneyValue } from '../../utils/validation';
import { toast } from '../../hooks/use-toast';

interface VendaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (venda: Venda) => void;
  venda?: Venda;
  clientes: ClienteFormData[];
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
  const [vendaId, setVendaId] = useState<number>(0); // Armazenar o ID da venda em edição
  
  // Estados para validação
  const [clienteIdError, setClienteIdError] = useState('');
  const [descricaoError, setDescricaoError] = useState('');
  const [valorError, setValorError] = useState('');
  const [formaPagamentoError, setFormaPagamentoError] = useState('');

  useEffect(() => {
    if (isOpen) {
    if (venda) {
        // Armazenar o ID da venda em edição
        setVendaId(venda.id);
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
      
      // Registrar o ID da venda que está sendo editada
      console.log('Editando venda com ID:', venda.id, 'Tipo:', typeof venda.id);
    } else {
        setVendaId(0);
      resetForm();
    }
    
    // Limpar erros ao abrir o diálogo
    resetErrors();
    } else {
      // Resetar o estado isLoading quando o diálogo é fechado
      setIsLoading(false);
    }
  }, [venda, isOpen]);

  const resetForm = () => {
    setClienteId('');
    setData(new Date());
    setDescricao('');
    setValor('');
    setFormaPagamento('');
  };
  
  const resetErrors = () => {
    setClienteIdError('');
    setDescricaoError('');
    setValorError('');
    setFormaPagamentoError('');
  };
  
  // Manipuladores de mudança com validação
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Permitir apenas números, vírgula e ponto
    const cleanValue = value.replace(/[^\d,.]/g, '');
    
    setValor(cleanValue);
    
    if (value && !isValidMoneyValue(value)) {
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
  
  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescricao(value);
    
    if (!value.trim()) {
      setDescricaoError('Descrição é obrigatória');
    } else {
      setDescricaoError('');
    }
  };
  
  const handleClienteChange = (value: string) => {
    setClienteId(Number(value));
    
    if (!value) {
      setClienteIdError('Cliente é obrigatório');
    } else {
      setClienteIdError('');
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

  const validateForm = (): boolean => {
    let isValid = true;
    resetErrors();
    
    // Validar cliente (obrigatório)
    if (!clienteId) {
      setClienteIdError('Cliente é obrigatório');
      isValid = false;
    }
    
    // Validar descrição (obrigatório)
    if (!descricao.trim()) {
      setDescricaoError('Descrição é obrigatória');
      isValid = false;
    }
    
    // Validar valor (obrigatório)
    if (!valor) {
      setValorError('Valor é obrigatório');
      isValid = false;
    } else if (!isValidMoneyValue(valor)) {
      setValorError('Valor inválido. Use o formato 0,00');
      isValid = false;
    }
    
    // Validar forma de pagamento (obrigatório)
    if (!formaPagamento) {
      setFormaPagamentoError('Forma de pagamento é obrigatória');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Evitar processamento duplicado
    if (isLoading) return;
    
    // Validar formulário
    if (!validateForm()) {
      toast({
        title: 'Erro de validação',
        description: 'Corrija os erros no formulário antes de continuar.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);

    const clienteSelecionado = clientes.find(c => c.id === Number(clienteId));

    const novaVenda: Venda = {
      id: vendaId, // Usar o ID armazenado
      clienteId: Number(clienteId),
      clienteNome: clienteSelecionado?.nome || '',
      data: data ? format(data, 'dd/MM/yyyy') : new Date().toLocaleDateString(),
      descricao,
      valor: `R$ ${valor}`,
      formaPagamento: formaPagamento.charAt(0).toUpperCase() + formaPagamento.slice(1)
    };

    console.log('Enviando venda para salvar:', novaVenda);
    
    onSave(novaVenda);
    // Não resetamos isLoading aqui, pois isso será feito pelo componente pai
  };

  // Adicionar um wrapper para o onClose que reseta o estado isLoading
  const handleClose = () => {
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{venda ? 'Editar Venda' : 'Registrar Nova Venda'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select 
                value={clienteId.toString()} 
                onValueChange={handleClienteChange}
                required
              >
                <SelectTrigger className={clienteIdError ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id || 0} value={(cliente.id || 0).toString()}>
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
              <Label htmlFor="data">Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {data ? (
                      format(data, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
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
                onChange={handleDescricaoChange}
                placeholder="Descrição do serviço ou produto"
                required
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
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  value={valor}
                  onChange={handleValorChange}
                  onKeyPress={handleValorKeyPress}
                  placeholder="Ex: 350,00"
                  required
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
                <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                <Select 
                  value={formaPagamento} 
                  onValueChange={handleFormaPagamentoChange} 
                  required
                >
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-emerald-800 hover:bg-emerald-700 text-white"
            >
              {isLoading ? 'Salvando...' : venda ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 