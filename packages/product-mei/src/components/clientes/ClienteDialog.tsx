import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Cliente } from '../../models/Cliente';

interface ClienteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Cliente) => void;
  cliente?: Cliente;
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

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome);
      setEmail(cliente.email || '');
      setTelefone(cliente.telefone || '');
      setCpfCnpj(cliente.cpfCnpj || '');
      setEndereco(cliente.endereco || '');
      setObservacoes(cliente.observacoes || '');
    } else {
      resetForm();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const novoCliente: Cliente = {
      id: cliente?.id || 0,
      nome,
      email,
      telefone,
      cpfCnpj,
      endereco,
      observacoes,
      dataCadastro: cliente?.dataCadastro || new Date().toLocaleDateString()
    };

    setTimeout(() => {
      onSave(novoCliente);
      setIsLoading(false);
      onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
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
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input
                id="cpfCnpj"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="000.000.000-00"
              />
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : cliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 