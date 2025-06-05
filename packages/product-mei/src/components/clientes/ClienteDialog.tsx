import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ClienteFormData } from '../../adapters/ClienteFormAdapter';
import { isValidName, isValidEmail, isValidPhone, formatPhone, formatDocument, isValidDocument } from '../../utils/validation';
import { AlertCircle } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface ClienteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: ClienteFormData) => void;
  cliente?: ClienteFormData;
}

export const ClienteDialog: React.FC<ClienteDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  cliente
}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clienteId, setClienteId] = useState<number>(0); // Armazenar o ID do cliente em edição
  
  // Estados para validação
  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [telefoneError, setTelefoneError] = useState('');
  const [cpfCnpjError, setCpfCnpjError] = useState('');

  useEffect(() => {
    if (isOpen) {
    if (cliente) {
        // Armazenar o ID do cliente em edição
        setClienteId(cliente.id || 0);
      setNome(cliente.nome);
      setEmail(cliente.email || '');
      setTelefone(cliente.telefone || '');
      setCpfCnpj(cliente.cpfCnpj || '');
      setEndereco(cliente.endereco || '');
      setObservacoes(cliente.observacoes || '');
      
      // Registrar o ID do cliente que está sendo editado
      console.log('Editando cliente com ID:', cliente.id, 'Tipo:', typeof cliente.id);
    } else {
        setClienteId(0);
      resetForm();
    }
    
    // Limpar erros ao abrir o diálogo
    resetErrors();
    } else {
      // Resetar o estado isLoading quando o diálogo é fechado
      setIsLoading(false);
    }
  }, [cliente, isOpen]);

  const resetForm = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setCpfCnpj('');
    setEndereco('');
    setObservacoes('');
  };
  
  const resetErrors = () => {
    setNomeError('');
    setEmailError('');
    setTelefoneError('');
    setCpfCnpjError('');
  };

  // Manipuladores de mudança com validação
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNome(value);
    
    if (value && !isValidName(value)) {
      setNomeError('Nome deve conter apenas letras e espaços');
    } else {
      setNomeError('');
    }
  };

  // Impedir entrada de caracteres não permitidos
  const handleNomeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite apenas letras, espaços, hífen, apóstrofe e caracteres especiais para nomes
    const regex = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/;
    const char = e.key;
    
    // Permitir teclas de controle como Backspace, Delete, etc.
    if (e.key.length > 1) return;
    
    if (!regex.test(char)) {
      e.preventDefault();
    }
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !isValidEmail(value)) {
      setEmailError('Email inválido');
    } else {
      setEmailError('');
    }
  };
  
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatPhone(value);
    setTelefone(formattedValue);
    
    if (value && !isValidPhone(value)) {
      setTelefoneError('Telefone inválido. Deve ter entre 10 e 11 dígitos');
    } else {
      setTelefoneError('');
    }
  };

  // Impedir entrada de caracteres não permitidos
  const handleTelefoneKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite apenas números, parênteses, hífen e espaço
    const regex = /^[0-9()\-\s]+$/;
    const char = e.key;
    
    // Permitir teclas de controle como Backspace, Delete, etc.
    if (e.key.length > 1) return;
    
    if (!regex.test(char)) {
      e.preventDefault();
    }
  };
  
  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Extrair apenas os dígitos numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Aplicar formatação apenas se tiver a quantidade correta de dígitos
    let formattedValue = value;
    if (numericValue.length === 11 || numericValue.length === 14) {
      formattedValue = formatDocument(numericValue);
      setCpfCnpjError(''); // Limpar erro se quantidade de dígitos for correta
    } else if (numericValue.length > 0) {
      // Se tiver dígitos mas não for a quantidade correta
      setCpfCnpjError('Digite 11 dígitos para CPF ou 14 dígitos para CNPJ');
      // Aplicar formatação parcial
      formattedValue = formatDocument(numericValue);
    } else {
      // Campo vazio
      setCpfCnpjError('');
    }
    
    setCpfCnpj(formattedValue);
  };

  // Impedir entrada de caracteres não permitidos
  const handleCpfCnpjKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite apenas números, pontos, hífen e barra
    const regex = /^[0-9.\-/]+$/;
    const char = e.key;
    
    // Permitir teclas de controle como Backspace, Delete, etc.
    if (e.key.length > 1) return;
    
    if (!regex.test(char)) {
      e.preventDefault();
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    resetErrors();
    
    // Validar nome (obrigatório)
    if (!nome.trim()) {
      setNomeError('Nome é obrigatório');
      isValid = false;
    } else if (!isValidName(nome)) {
      setNomeError('Nome deve conter apenas letras e espaços');
      isValid = false;
    }
    
    // Validar email (opcional)
    if (email && !isValidEmail(email)) {
      setEmailError('Email inválido');
      isValid = false;
    }
    
    // Validar telefone (obrigatório)
    if (!telefone) {
      setTelefoneError('Telefone é obrigatório');
      isValid = false;
    } else if (!isValidPhone(telefone)) {
      setTelefoneError('Telefone inválido. Deve ter entre 10 e 11 dígitos');
      isValid = false;
    }
    
    // Validar CPF/CNPJ (opcional)
    if (cpfCnpj) {
      const numericValue = cpfCnpj.replace(/\D/g, '');
      if (numericValue.length > 0 && numericValue.length !== 11 && numericValue.length !== 14) {
        setCpfCnpjError('Digite 11 dígitos para CPF ou 14 dígitos para CNPJ');
        isValid = false;
      }
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

    const novoCliente: ClienteFormData = {
      id: clienteId, // Usar o ID armazenado
      nome,
      email,
      telefone,
      cpfCnpj,
      endereco,
      observacoes,
      dataCadastro: cliente?.dataCadastro || new Date().toLocaleDateString()
    };

    onSave(novoCliente);
    // O componente pai gerenciará o estado de loading e fechamento do diálogo
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
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={handleNomeChange}
                onKeyPress={handleNomeKeyPress}
                placeholder="Nome completo"
                required
                className={nomeError ? "border-red-500" : ""}
              />
              {nomeError && (
                <div className="flex items-center text-red-600 text-xs mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {nomeError}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="email@exemplo.com"
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {emailError}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={handleTelefoneChange}
                  onKeyPress={handleTelefoneKeyPress}
                  placeholder="(00) 00000-0000"
                  required
                  className={telefoneError ? "border-red-500" : ""}
                />
                {telefoneError && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {telefoneError}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input
                id="cpfCnpj"
                value={cpfCnpj}
                onChange={handleCpfCnpjChange}
                onKeyPress={handleCpfCnpjKeyPress}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                className={cpfCnpjError ? "border-red-500" : ""}
              />
              {cpfCnpjError && (
                <div className="flex items-center text-red-600 text-xs mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {cpfCnpjError}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, bairro - Cidade/UF"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais sobre o cliente"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-emerald-800 hover:bg-emerald-700 text-white"
            >
              {isLoading ? 'Salvando...' : cliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 