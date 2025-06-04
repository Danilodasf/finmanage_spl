import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CalendarIcon, FileText, Save, Edit, Trash2, CheckCircle, Calculator, AlertTriangle, Truck } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';

interface Pagamento {
  id: number;
  competencia: string;
  vencimento: string;
  valor: string;
  status: 'Pago' | 'Pendente';
  dataPagamento?: string;
}

/**
 * Componente para cadastro e gerenciamento do Imposto DAS
 */
const ImpostoDAS: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dataPagamento, setDataPagamento] = useState<Date | undefined>(undefined);
  const [competencia, setCompetencia] = useState<string | undefined>('');
  const [valor, setValor] = useState<string>('');
  const [numeroDas, setNumeroDas] = useState<string>('');
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [historicoPagamentos, setHistoricoPagamentos] = useState<Pagamento[]>([
    { id: 1, competencia: 'Janeiro/2023', vencimento: '20/02/2023', valor: 'R$ 65,00', status: 'Pago', dataPagamento: '18/02/2023' },
    { id: 2, competencia: 'Fevereiro/2023', vencimento: '20/03/2023', valor: 'R$ 65,00', status: 'Pago', dataPagamento: '15/03/2023' },
    { id: 3, competencia: 'Março/2023', vencimento: '20/04/2023', valor: 'R$ 65,00', status: 'Pendente' },
  ]);
  const [editandoPagamento, setEditandoPagamento] = useState<Pagamento | null>(null);
  
  // Estados para o diálogo de marcar como pago
  const [isMarcarComoPagoDialogOpen, setIsMarcarComoPagoDialogOpen] = useState(false);
  const [pagamentoParaMarcar, setPagamentoParaMarcar] = useState<number | null>(null);
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

  // Novo estado para controlar se o faturamento anual foi editado manualmente
  const [faturamentoAnualEditadoManualmente, setFaturamentoAnualEditadoManualmente] = useState(false);

  // Efeito para calcular o faturamento anual com base no mensal
  useEffect(() => {
    if (faturamentoMensal && !faturamentoAnualEditadoManualmente) {
      const valorMensal = parseFloat(faturamentoMensal.replace(/\./g, '').replace(',', '.'));
      if (!isNaN(valorMensal)) {
        const valorAnual = valorMensal * 12;
        setFaturamentoAnual(valorAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    }
  }, [faturamentoMensal]);

  // Função para lidar com a alteração do faturamento anual
  const handleFaturamentoAnualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFaturamentoAnual(e.target.value);
    setFaturamentoAnualEditadoManualmente(true);
  };

  // Função para calcular o DAS
  const calcularDAS = () => {
    const valorAnual = parseFloat(faturamentoAnual.replace(/\./g, '').replace(',', '.'));
    
    // Verificar se o faturamento anual ultrapassa o limite de MEI
    if (valorAnual > 81000) {
      setMostrarAlertaLimite(true);
    } else {
      setMostrarAlertaLimite(false);
    }

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setComprovante(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Determinar o status com base na presença da data de pagamento
    const status = dataPagamento ? 'Pago' : 'Pendente';
    const competenciaTexto = competencia ? 
      competencia === '01/2023' ? 'Janeiro/2023' : 
      competencia === '02/2023' ? 'Fevereiro/2023' : 
      competencia === '03/2023' ? 'Março/2023' : 'Abril/2023' : '';

    // Se estiver editando, atualiza o pagamento existente
    if (editandoPagamento) {
      setHistoricoPagamentos(historicoPagamentos.map(p => 
        p.id === editandoPagamento.id 
          ? {
              ...p,
              competencia: competenciaTexto,
              vencimento: date ? format(date, 'dd/MM/yyyy') : p.vencimento,
              valor: `R$ ${valor}`,
              status,
              dataPagamento: dataPagamento ? format(dataPagamento, 'dd/MM/yyyy') : undefined
            }
          : p
      ));

      toast({
        title: 'Pagamento atualizado',
        description: 'O pagamento do DAS foi atualizado com sucesso.',
      });
    } else {
      // Adiciona novo pagamento
      const novoPagamento: Pagamento = {
        id: Math.max(0, ...historicoPagamentos.map(p => p.id)) + 1,
        competencia: competenciaTexto,
        vencimento: date ? format(date, 'dd/MM/yyyy') : new Date().toLocaleDateString(),
        valor: `R$ ${valor}`,
        status,
        dataPagamento: dataPagamento ? format(dataPagamento, 'dd/MM/yyyy') : undefined
      };
      
      setHistoricoPagamentos([...historicoPagamentos, novoPagamento]);
      
      toast({
        title: 'Pagamento registrado',
        description: 'O pagamento do DAS foi registrado com sucesso.',
      });
    }

    // Resetar formulário
    setIsLoading(false);
    setValor('');
    setNumeroDas('');
    setComprovante(null);
    setDataPagamento(undefined);
    setEditandoPagamento(null);
  };

  const handleEditarPagamento = (pagamento: Pagamento) => {
    setEditandoPagamento(pagamento);
    setCompetencia(
      pagamento.competencia === 'Janeiro/2023' ? '01/2023' :
      pagamento.competencia === 'Fevereiro/2023' ? '02/2023' :
      pagamento.competencia === 'Março/2023' ? '03/2023' : '04/2023'
    );
    
    // Converter string de data para objeto Date
    const partesVencimento = pagamento.vencimento.split('/');
    if (partesVencimento.length === 3) {
      setDate(new Date(
        parseInt(partesVencimento[2]),
        parseInt(partesVencimento[1]) - 1,
        parseInt(partesVencimento[0])
      ));
    }
    
    if (pagamento.dataPagamento) {
      const partesPagamento = pagamento.dataPagamento.split('/');
      if (partesPagamento.length === 3) {
        setDataPagamento(new Date(
          parseInt(partesPagamento[2]),
          parseInt(partesPagamento[1]) - 1,
          parseInt(partesPagamento[0])
        ));
      }
    } else {
      setDataPagamento(undefined);
    }
    
    setValor(pagamento.valor.replace('R$ ', ''));
  };

  const handleDeletarPagamento = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este pagamento?')) {
      setHistoricoPagamentos(historicoPagamentos.filter(p => p.id !== id));
      toast({
        title: 'Pagamento excluído',
        description: 'O pagamento foi excluído com sucesso.',
      });
    }
  };

  const handleMarcarComoPago = (id: number) => {
    setPagamentoParaMarcar(id);
    setDataConfirmacaoPagamento(new Date());
    setIsMarcarComoPagoDialogOpen(true);
  };

  const confirmarPagamento = () => {
    if (pagamentoParaMarcar !== null && dataConfirmacaoPagamento) {
      setHistoricoPagamentos(historicoPagamentos.map(p => 
        p.id === pagamentoParaMarcar 
          ? { ...p, status: 'Pago', dataPagamento: format(dataConfirmacaoPagamento, 'dd/MM/yyyy') }
          : p
      ));
      
      toast({
        title: 'Pagamento confirmado',
        description: 'O pagamento foi marcado como pago com sucesso.',
      });

      // Resetar estados
      setIsMarcarComoPagoDialogOpen(false);
      setPagamentoParaMarcar(null);
      setDataConfirmacaoPagamento(new Date());
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoPagamento(null);
    setCompetencia('');
    setDate(new Date());
    setDataPagamento(undefined);
    setValor('');
    setNumeroDas('');
    setComprovante(null);
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="competencia">Competência</Label>
                    <Select value={competencia} onValueChange={setCompetencia}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mês/ano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01/2023">Janeiro/2023</SelectItem>
                        <SelectItem value="02/2023">Fevereiro/2023</SelectItem>
                        <SelectItem value="03/2023">Março/2023</SelectItem>
                        <SelectItem value="04/2023">Abril/2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vencimento">Data de Vencimento</Label>
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
                    <Label htmlFor="valor">Valor do DAS (R$)</Label>
                    <Input
                      id="valor"
                      type="text"
                      placeholder="Ex: 65,00"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero">Número do DAS</Label>
                    <Input
                      id="numero"
                      type="text"
                      placeholder="Número do documento"
                      value={numeroDas}
                      onChange={(e) => setNumeroDas(e.target.value)}
                    />
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
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="text-xs text-gray-500 mt-1">
                      Se não informada, o status será "Pendente"
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comprovante">Comprovante de Pagamento</Label>
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
                {historicoPagamentos.map((pagamento) => (
                  <tr key={pagamento.id} className="border-b">
                    <td className="px-4 py-3">{pagamento.competencia}</td>
                    <td className="px-4 py-3">{pagamento.vencimento}</td>
                    <td className="px-4 py-3">{pagamento.valor}</td>
                    <td className="px-4 py-3">{pagamento.dataPagamento || '-'}</td>
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
                        <Button variant="ghost" size="sm" title="Ver detalhes">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {historicoPagamentos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                      Nenhum pagamento registrado
                    </td>
                  </tr>
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
                    onChange={(e) => setFaturamentoMensal(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faturamentoAnual">Faturamento Anual (R$)</Label>
                  <Input
                    id="faturamentoAnual"
                    type="text"
                    placeholder="Ex: 60.000,00"
                    value={faturamentoAnual}
                    onChange={handleFaturamentoAnualChange}
                  />
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
    </MainLayout>
  );
};

export default ImpostoDAS; 