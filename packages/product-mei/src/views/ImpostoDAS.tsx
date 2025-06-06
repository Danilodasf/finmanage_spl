import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CalendarIcon, FileText, Save, Edit, Trash2, CheckCircle, Calculator, AlertTriangle, Truck, AlertCircle } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { DeleteConfirmation } from '../components/ui/DeleteConfirmation';
import { isValidMoneyValue, formatMoneyValue } from '../utils/validation';
import { DIDASController } from '../controllers/DIDASController';
import { DASPayment } from '../lib/services/SupabaseMeiDASService';
import { SupabaseMeiTransactionService } from '../lib/services/SupabaseMeiTransactionService';

// Interface para o estado de exibição dos pagamentos na tabela
interface PagamentoDisplay extends Omit<DASPayment, 'valor'> {
  valor: string; // valor formatado como R$ XX,XX para exibição
}

/**
 * Componente para cadastro e gerenciamento do Imposto DAS
 */
const ImpostoDAS: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dataPagamento, setDataPagamento] = useState<Date | undefined>(undefined);
  const [competencia, setCompetencia] = useState<string | undefined>('');
  const [valor, setValor] = useState<string>(''); // Valor do input (string XX,XX)
  const [numeroDas, setNumeroDas] = useState<string>('');
  const [historicoPagamentos, setHistoricoPagamentos] = useState<PagamentoDisplay[]>([]);
  const [editandoPagamento, setEditandoPagamento] = useState<PagamentoDisplay | null>(null);
  
  // Estados para o diálogo de marcar como pago
  const [isMarcarComoPagoDialogOpen, setIsMarcarComoPagoDialogOpen] = useState(false);
  const [pagamentoParaMarcar, setPagamentoParaMarcar] = useState<string | null>(null); // Armazena o ID (string)
  const [dataConfirmacaoPagamento, setDataConfirmacaoPagamento] = useState<Date | undefined>(new Date());

  // Novos estados para o cálculo do DAS
  const [isCalculadoraOpen, setIsCalculadoraOpen] = useState(false);
  const [tipoAtividade, setTipoAtividade] = useState<string>('comercio');
  const [faturamentoMensal, setFaturamentoMensal] = useState<string>('');
  const [faturamentoAnual, setFaturamentoAnual] = useState<string>('');
  const [isMEICaminhoneiro, setIsMEICaminhoneiro] = useState<boolean>(false);
  const [resultadoCalculo, setResultadoCalculo] = useState<{
    inss: number;
    iss: number;
    icms: number;
    total: number;
  } | null>(null);
  const [mostrarAlertaLimite, setMostrarAlertaLimite] = useState(false);

  // Estados para validação
  const [valorError, setValorError] = useState('');
  const [numeroDasError, setNumeroDasError] = useState('');
  const [faturamentoMensalError, setFaturamentoMensalError] = useState('');
  const [faturamentoAnualError, setFaturamentoAnualError] = useState('');
  const [competenciaError, setCompetenciaError] = useState('');
  
  // Estados para verificação de saldo
  const [saldoDisponivel, setSaldoDisponivel] = useState<number>(0);
  const [mostrarAlertaSaldo, setMostrarAlertaSaldo] = useState(false);

  // Estados para o diálogo de confirmação de deleção
  const [isDeleteDASDialogOpen, setIsDeleteDASDialogOpen] = useState(false);
  const [dasParaDeletar, setDasParaDeletar] = useState<string | null>(null);

  // Função para carregar o saldo disponível
  const loadSaldoDisponivel = async () => {
    try {
      const transactionService = new SupabaseMeiTransactionService();
      const financialSummary = await transactionService.getFinancialSummary('month');
      setSaldoDisponivel(financialSummary.saldo);
    } catch (error) {
      console.error('Erro ao carregar saldo disponível:', error);
      setSaldoDisponivel(0);
    }
  };

  // Função para carregar os pagamentos
  const loadPayments = async () => {
    setIsPageLoading(true);
    const paymentsFromDB = await DIDASController.getAllPayments(); // paymentsFromDB é DASPayment[]
    setHistoricoPagamentos(paymentsFromDB.map(p => ({
      ...p,
      // Convertendo valor (number) para string formatada para exibição
      valor: `R$ ${p.valor.toFixed(2).replace('.', ',')}`,
    })));
    setIsPageLoading(false);
  };

  // Carregar pagamentos e saldo ao montar o componente
  useEffect(() => {
    loadPayments();
    loadSaldoDisponivel();
  }, []);

  // Verificar saldo quando o valor do DAS mudar
  useEffect(() => {
    if (valor && dataPagamento) {
      const valorNumerico = parseFloat(valor.replace('.', '').replace(',', '.'));
      
      // Se estiver editando, considerar o valor anterior para calcular saldo disponível
      let saldoParaVerificacao = saldoDisponivel;
      if (editandoPagamento && editandoPagamento.status === 'Pago') {
        const valorAnterior = parseFloat(editandoPagamento.valor.replace('R$ ', '').replace('.', '').replace(',', '.'));
        saldoParaVerificacao += valorAnterior; // Adicionar o valor anterior de volta ao saldo
      }
      
      setMostrarAlertaSaldo(valorNumerico > saldoParaVerificacao);
    } else {
      setMostrarAlertaSaldo(false);
    }
  }, [valor, dataPagamento, saldoDisponivel, editandoPagamento]);

  // Função para lidar com a alteração do faturamento mensal
  const handleFaturamentoMensalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir apenas números, vírgula e ponto
    const cleanValue = value.replace(/[^\d,.]/g, '');
    setFaturamentoMensal(cleanValue);
    if (cleanValue && !isValidMoneyValue(cleanValue)) {
      setFaturamentoMensalError('Valor inválido. Use o formato 0,00');
    } else {
      setFaturamentoMensalError('');
    }
  };

  // Função para lidar com a alteração do faturamento anual
  const handleFaturamentoAnualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir apenas números, vírgula e ponto
    const cleanValue = value.replace(/[^\d,.]/g, '');
    setFaturamentoAnual(cleanValue);
    if (cleanValue && !isValidMoneyValue(cleanValue)) {
      setFaturamentoAnualError('Valor inválido. Use o formato 0,00');
    } else {
      setFaturamentoAnualError('');
      // Verificar se ultrapassa o limite de faturamento do MEI
      if (isValidMoneyValue(cleanValue)) {
        const anualNumerico = Number(cleanValue.replace(',', '.'));
        setMostrarAlertaLimite(anualNumerico > 81000);
      }
    }
  };

  // Função para calcular o DAS
  const calcularDAS = () => {
    if (!validateCalculoForm()) {
      toast({
        title: 'Erro de validação',
        description: 'Corrija os erros no formulário antes de continuar.',
        variant: 'destructive'
      });
      return;
    }

    const valorAnual = parseFloat(faturamentoAnual.replace(/\./g, '').replace(',', '.'));
    
    // Valores atualizados do DAS para MEI em 2025
    let inss = isMEICaminhoneiro ? 182.16 : 75.90; // 12% ou 5% do salário mínimo de R$ 1.518,00
    let iss = 0;
    let icms = 0;

    // Ajustar valores conforme o tipo de atividade
    if (tipoAtividade === 'comercio') {
      icms = 1.00;
    } else if (tipoAtividade === 'servicos') {
      iss = 5.00;
    } else if (tipoAtividade === 'ambos') {
      iss = 5.00;
      icms = 1.00;
    }

    const total = inss + iss + icms;

    setResultadoCalculo({ inss, iss, icms, total });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePagamentoForm()) {
      toast({
        title: 'Erro de validação',
        description: 'Corrija os erros no formulário antes de continuar.',
        variant: 'destructive'
      });
      return;
    }
    setIsLoading(true);

    const statusForm: 'Pago' | 'Pendente' = dataPagamento ? 'Pago' : 'Pendente';
    const valorNumerico = parseFloat(valor.replace('.', '').replace(',', '.')); // Input é XX,XX ou X.XXX,XX

    // Verificar saldo se o pagamento estiver marcado como pago
    if (statusForm === 'Pago') {
      let saldoParaVerificacao = saldoDisponivel;
      
      // Se estiver editando, considerar o valor anterior
      if (editandoPagamento && editandoPagamento.status === 'Pago') {
        const valorAnterior = parseFloat(editandoPagamento.valor.replace('R$ ', '').replace('.', '').replace(',', '.'));
        saldoParaVerificacao += valorAnterior;
      }
      
      if (valorNumerico > saldoParaVerificacao) {
        toast({
          title: 'Saldo Insuficiente',
          description: `Saldo disponível: R$ ${saldoParaVerificacao.toFixed(2).replace('.', ',')}. Valor do DAS: R$ ${valorNumerico.toFixed(2).replace('.', ',')}. Não é possível registrar o pagamento.`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
    }

    const paymentData = {
      competencia: competencia || '',
      vencimento: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      valor: valorNumerico,
      numero_das: numeroDas || undefined,
      data_pagamento: dataPagamento ? format(dataPagamento, 'yyyy-MM-dd') : undefined,
      status: statusForm, // Corrigido para usar o tipo correto
    };

    console.log('ImpostoDAS - handleSubmit - Dados para salvar:', paymentData);

    let success = false;
    if (editandoPagamento && editandoPagamento.id) {
      console.log('ImpostoDAS - handleSubmit - Atualizando pagamento existente:', editandoPagamento.id);
      const updatedPayment = await DIDASController.updatePayment(editandoPagamento.id, paymentData);
      if (updatedPayment) {
        success = true;
        toast({
          title: 'Pagamento atualizado',
          description: 'O pagamento do DAS foi atualizado com sucesso.',
        });
      }
    } else {
      console.log('ImpostoDAS - handleSubmit - Criando novo pagamento');
      const newPayment = await DIDASController.createPayment(paymentData);
      console.log('ImpostoDAS - handleSubmit - Resultado da criação:', newPayment);
      if (newPayment) {
        success = true;
        toast({
          title: 'Pagamento registrado',
          description: 'O pagamento do DAS foi registrado com sucesso.',
        });
      }
    }

    if (success) {
      console.log('ImpostoDAS - handleSubmit - Operação bem-sucedida, recarregando pagamentos');
      await loadPayments(); // Recarregar lista
      await loadSaldoDisponivel(); // Recarregar saldo
      // Resetar formulário
      setValor('');
      setNumeroDas('');
      setDataPagamento(undefined);
      setDate(new Date());
      setCompetencia('');
      setEditandoPagamento(null);
    } else {
      console.error('ImpostoDAS - handleSubmit - Falha na operação');
    }
    setIsLoading(false);
  };

  const handleEditarPagamento = (pagamento: PagamentoDisplay) => {
    setEditandoPagamento(pagamento);
    setCompetencia(pagamento.competencia);

    if (pagamento.vencimento) {
        const [year, month, day] = pagamento.vencimento.split('-').map(Number);
        setDate(new Date(year, month - 1, day));
    } else {
        setDate(new Date());
    }

    if (pagamento.data_pagamento) {
        const [year, month, day] = pagamento.data_pagamento.split('-').map(Number);
        setDataPagamento(new Date(year, month - 1, day));
    } else {
      setDataPagamento(undefined);
    }
    // pagamento.valor é string "R$ XX,XX" vindo de PagamentoDisplay
    setValor(pagamento.valor.replace('R$ ', '')); // Input do formulário espera "XX,XX"
    setNumeroDas(pagamento.numero_das || '');
  };

  const handleDeletarPagamento = async (id: string) => {
    setDasParaDeletar(id);
    setIsDeleteDASDialogOpen(true);
  };

  // Nova função para confirmar a deleção
  const confirmDeleteDAS = async () => {
    if (!dasParaDeletar) return;
    
    setIsLoading(true);
    const success = await DIDASController.deletePayment(dasParaDeletar);
    if (success) {
      await loadPayments();
      await loadSaldoDisponivel();
      toast({
        title: 'Pagamento excluído',
        description: 'O pagamento foi excluído com sucesso.',
      });
    }
    setIsLoading(false);
    setIsDeleteDASDialogOpen(false);
    setDasParaDeletar(null);
  };

  const handleMarcarComoPago = (id: string) => { // ID agora é string
    setPagamentoParaMarcar(id); // pagamentoParaMarcar agora guarda string (id)
    setDataConfirmacaoPagamento(new Date());
    setIsMarcarComoPagoDialogOpen(true);
  };

  const confirmarPagamento = async () => {
    if (pagamentoParaMarcar !== null && dataConfirmacaoPagamento) {
      setIsLoading(true);
      const updatedPayment = await DIDASController.markAsPaid(
        pagamentoParaMarcar.toString(), // Enviar ID como string
        format(dataConfirmacaoPagamento, 'yyyy-MM-dd')
      );
      
      if (updatedPayment) {
        await loadPayments();
        await loadSaldoDisponivel(); // Recarregar saldo
        toast({
          title: 'Pagamento confirmado',
          description: 'O pagamento foi marcado como pago com sucesso.',
        });
      }

      // Resetar estados
      setIsMarcarComoPagoDialogOpen(false);
      setPagamentoParaMarcar(null);
      setDataConfirmacaoPagamento(new Date());
      setIsLoading(false);
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoPagamento(null);
    setCompetencia('');
    setDate(new Date());
    setDataPagamento(undefined);
    setValor('');
    setNumeroDas('');
  };

  // Manipuladores com validação
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Permitir apenas números, vírgula e ponto
    const cleanValue = value.replace(/[^\d,.]/g, '');
    
    setValor(cleanValue);
    
    if (cleanValue && !isValidMoneyValue(cleanValue)) {
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
  
  const handleNumeroDasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNumeroDas(value);
    
    // Validar que seja apenas números
    if (value && !/^\d+$/.test(value)) {
      setNumeroDasError('Número do DAS deve conter apenas dígitos');
    } else {
      setNumeroDasError('');
    }
  };
  
  // Impedir entrada de caracteres não permitidos no campo de número do DAS
  const handleNumeroDasKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite apenas números
    const regex = /^[0-9]+$/;
    const char = e.key;
    
    // Permitir teclas de controle como Backspace, Delete, etc.
    if (e.key.length > 1) return;
    
    if (!regex.test(char)) {
      e.preventDefault();
    }
  };
  
  // Impedir entrada de caracteres não permitidos no campo de faturamento mensal
  const handleFaturamentoMensalKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  
  // Impedir entrada de caracteres não permitidos no campo de faturamento anual
  const handleFaturamentoAnualKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  
  // Manipulador para o campo de competência
  const handleCompetenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Permitir apenas números e /
    value = value.replace(/[^\d/]/g, '');
    
    // Limitar a 7 caracteres (MM/YYYY)
    if (value.length > 7) {
      value = value.slice(0, 7);
    }
    
    // Formatar automaticamente para MM/YYYY
    if (value.length >= 2 && !value.includes('/')) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    // Validar o formato
    setCompetencia(value);
    
    const regex = /^(0[1-9]|1[0-2])\/\d{0,4}$/;
    if (value && !regex.test(value) && value.length >= 3) {
      setCompetenciaError('Formato inválido. Use MM/YYYY');
    } else {
      setCompetenciaError('');
    }
  };
  
  // Impedir entrada de caracteres não permitidos no campo de competência
  const handleCompetenciaKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir apenas números e /
    const regex = /^[0-9/]+$/;
    const char = e.key;
    
    // Permitir teclas de controle como Backspace, Delete, etc.
    if (e.key.length > 1) return;
    
    // Verificar se já tem uma / e o usuário está tentando adicionar outra
    if (char === '/' && e.currentTarget.value.includes('/')) {
      e.preventDefault();
      return;
    }
    
    if (!regex.test(char)) {
      e.preventDefault();
    }
  };
  
  // Validar formulário de pagamento
  const validatePagamentoForm = (): boolean => {
    let isValid = true;
    
    // Validar valor (obrigatório)
    if (!valor) {
      setValorError('Valor é obrigatório');
      isValid = false;
    } else if (!isValidMoneyValue(valor)) {
      setValorError('Valor inválido. Use o formato 0,00');
      isValid = false;
    }
    
    // Validar competência (obrigatório e formato MM/YYYY)
    if (!competencia) {
      setCompetenciaError('Competência é obrigatória');
      isValid = false;
    } else {
      const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
      if (!regex.test(competencia)) {
        setCompetenciaError('Formato inválido. Use MM/YYYY');
        isValid = false;
      }
    }
    
    // Validar número do DAS (obrigatório)
    if (!numeroDas) {
      setNumeroDasError('Número do DAS é obrigatório');
      isValid = false;
    } else if (!/^\d+$/.test(numeroDas)) {
      setNumeroDasError('Número do DAS deve conter apenas dígitos');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Validar formulário de cálculo
  const validateCalculoForm = (): boolean => {
    let isValid = true;
    
    // Validar faturamento mensal (obrigatório)
    if (!faturamentoMensal) {
      setFaturamentoMensalError('Faturamento mensal é obrigatório');
      isValid = false;
    } else if (!isValidMoneyValue(faturamentoMensal)) {
      setFaturamentoMensalError('Valor inválido. Use o formato 0,00');
      isValid = false;
    }
    
    // Validar faturamento anual (obrigatório)
    if (!faturamentoAnual) {
      setFaturamentoAnualError('Faturamento anual é obrigatório');
      isValid = false;
    } else if (!isValidMoneyValue(faturamentoAnual)) {
      setFaturamentoAnualError('Valor inválido. Use o formato 0,00');
      isValid = false;
    }
    
    return isValid;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Imposto DAS</h1>
          <Button 
            onClick={() => setIsCalculadoraOpen(true)}
            className="bg-emerald-800 hover:bg-emerald-700 flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calcular DAS
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">
                {editandoPagamento ? 'Editar Pagamento de DAS' : 'Cadastrar Pagamento de DAS'}
              </h2>
              
              {/* Alerta de saldo insuficiente */}
              {mostrarAlertaSaldo && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Saldo Insuficiente
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          Seu saldo atual (R$ {saldoDisponivel.toFixed(2).replace('.', ',')}) é insuficiente para pagar este DAS. 
                          Você pode registrar o pagamento como "Pendente" ou adicionar receitas antes de marcar como "Pago".
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="competencia">
                      Competência (MM/YYYY) <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="competencia"
                      type="text"
                      placeholder="Ex: 03/2023"
                      value={competencia}
                      onChange={handleCompetenciaChange}
                      onKeyPress={handleCompetenciaKeyPress}
                      className={competenciaError ? "border-red-500" : ""}
                      maxLength={7}
                      required
                    />
                    {competenciaError && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {competenciaError}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vencimento">
                      Data de Vencimento <span className="text-red-500">*</span>
                    </Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">
                      Valor do DAS (R$) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="valor"
                      type="text"
                      placeholder="Ex: 65,00"
                      value={valor}
                      onChange={handleValorChange}
                      onKeyPress={handleValorKeyPress}
                      className={valorError ? "border-red-500" : ""}
                      required
                    />
                    {valorError && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {valorError}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero">
                      Número do DAS <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="numero"
                      type="text"
                      placeholder="Número do documento"
                      value={numeroDas}
                      onChange={handleNumeroDasChange}
                      onKeyPress={handleNumeroDasKeyPress}
                      className={numeroDasError ? "border-red-500" : ""}
                      required
                    />
                    {numeroDasError && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {numeroDasError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataPagamento">Data de Pagamento (opcional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataPagamento ? format(dataPagamento, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dataPagamento}
                          onSelect={setDataPagamento}
                          initialFocus
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="text-xs text-gray-500 mt-1">
                      Se não informada, o status será "Pendente"
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-emerald-800 hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Salvando...' : editandoPagamento ? 'Salvar Alterações' : 'Registrar Pagamento'}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                  
                  {editandoPagamento && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleCancelarEdicao}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Informações Importantes</h2>
              <div className="space-y-3 text-sm">
                <p>O DAS (Documento de Arrecadação do Simples Nacional) deve ser pago mensalmente pelos MEIs até o dia 20 de cada mês.</p>
                <p>O valor atual do DAS para MEI em 2025 é de:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>R$ 76,90 para empresas do comércio ou indústria (R$ 75,90 de INSS + R$ 1,00 de ICMS)</li>
                  <li>R$ 80,90 para prestação de serviços (R$ 75,90 de INSS + R$ 5,00 de ISS)</li>
                  <li>R$ 81,90 para comércio e serviços (R$ 75,90 de INSS + R$ 1,00 de ICMS + R$ 5,00 de ISS)</li>
                </ul>
                <p className="mt-2">Para o MEI Caminhoneiro, o valor do INSS é de R$ 182,16 (12% do salário mínimo de R$ 1.518,00), com acréscimo dos tributos conforme a atividade.</p>
                <p className="pt-2 font-semibold">Benefícios do pagamento:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>Aposentadoria</li>
                  <li>Auxílio-doença</li>
                  <li>Salário-maternidade</li>
                  <li>Pensão por morte</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Histórico de Pagamentos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Competência</th>
                  <th className="px-4 py-2 text-left">Vencimento</th>
                  <th className="px-4 py-2 text-left">Valor</th>
                  <th className="px-4 py-2 text-left">Data Pagamento</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isPageLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                      Carregando pagamentos...
                    </td>
                  </tr>
                ) : historicoPagamentos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                      Nenhum pagamento registrado
                    </td>
                  </tr>
                ) : (
                  historicoPagamentos.map((pagamento) => {
                    return (
                      <tr key={pagamento.id} className="border-b">
                        <td className="px-4 py-3">{pagamento.competencia}</td>
                        <td className="px-4 py-3">{pagamento.vencimento ? format(new Date(pagamento.vencimento + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</td>
                        <td className="px-4 py-3">{pagamento.valor}</td>
                        <td className="px-4 py-3">{pagamento.data_pagamento ? format(new Date(pagamento.data_pagamento + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              pagamento.status === 'Pago'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {pagamento.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarPagamento(pagamento)}
                              title="Editar pagamento"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletarPagamento(pagamento.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Excluir pagamento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {pagamento.status === 'Pendente' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarcarComoPago(pagamento.id)}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Marcar como pago"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Diálogo para confirmar data de pagamento */}
      <Dialog open={isMarcarComoPagoDialogOpen} onOpenChange={setIsMarcarComoPagoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataPagamentoConfirmacao">Data de Pagamento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dataPagamentoConfirmacao"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataConfirmacaoPagamento ? format(dataConfirmacaoPagamento, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataConfirmacaoPagamento}
                    onSelect={setDataConfirmacaoPagamento}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarcarComoPagoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarPagamento} 
              className="bg-emerald-800 hover:bg-emerald-700"
              disabled={!dataConfirmacaoPagamento}
            >
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo da calculadora de DAS */}
      <Dialog open={isCalculadoraOpen} onOpenChange={setIsCalculadoraOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Calculadora de DAS</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipoAtividade">Tipo de Atividade</Label>
                <Select value={tipoAtividade} onValueChange={setTipoAtividade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de atividade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comercio">Comércio</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="ambos">Comércio e Serviços</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="meiCaminhoneiro" 
                  checked={isMEICaminhoneiro} 
                  onCheckedChange={(checked) => setIsMEICaminhoneiro(checked === true)}
                />
                <Label 
                  htmlFor="meiCaminhoneiro" 
                  className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                >
                  <Truck className="h-4 w-4" /> MEI Caminhoneiro (alíquota de 12% do salário mínimo)
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faturamentoMensal">Faturamento Mensal (R$)</Label>
                  <Input
                    id="faturamentoMensal"
                    type="text"
                    placeholder="Ex: 5.000,00"
                    value={faturamentoMensal}
                    onChange={handleFaturamentoMensalChange}
                    onKeyPress={handleFaturamentoMensalKeyPress}
                    className={faturamentoMensalError ? "border-red-500" : ""}
                  />
                  {faturamentoMensalError && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {faturamentoMensalError}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faturamentoAnual">Faturamento Anual (R$)</Label>
                  <Input
                    id="faturamentoAnual"
                    type="text"
                    placeholder="Ex: 60.000,00"
                    value={faturamentoAnual}
                    onChange={handleFaturamentoAnualChange}
                    onKeyPress={handleFaturamentoAnualKeyPress}
                    className={faturamentoAnualError ? "border-red-500" : ""}
                  />
                  {faturamentoAnualError && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {faturamentoAnualError}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="button" 
                  className="bg-emerald-800 hover:bg-emerald-700 w-full"
                  onClick={calcularDAS}
                >
                  Calcular Imposto Devido
                </Button>
              </div>

              {mostrarAlertaLimite && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Limite de faturamento excedido</AlertTitle>
                  <AlertDescription>
                    O faturamento anual ultrapassa o limite de R$ 81.000,00 para MEI. 
                    Recomendamos migrar sua empresa para ME (Microempresa).
                  </AlertDescription>
                </Alert>
              )}

              {resultadoCalculo && (
                <div className="mt-4 p-4 border rounded-md bg-gray-50">
                  <h3 className="text-lg font-medium mb-2">Resultado do Cálculo</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>
                        {isMEICaminhoneiro 
                          ? 'INSS (12% do salário mínimo de R$ 1.518,00):' 
                          : 'INSS (5% do salário mínimo de R$ 1.518,00):'}
                      </span>
                      <span>R$ {resultadoCalculo.inss.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ISS:</span>
                      <span>R$ {resultadoCalculo.iss.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ICMS:</span>
                      <span>R$ {resultadoCalculo.icms.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                      <span>Total do DAS:</span>
                      <span>R$ {resultadoCalculo.total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCalculadoraOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação de deleção */}
      <DeleteConfirmation
        isOpen={isDeleteDASDialogOpen}
        onClose={() => {
          setIsDeleteDASDialogOpen(false);
          setDasParaDeletar(null);
        }}
        onDelete={confirmDeleteDAS}
        title="Excluir Pagamento DAS"
        description="Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita e também excluirá a transação associada."
      />
    </MainLayout>
  );
};

export default ImpostoDAS;