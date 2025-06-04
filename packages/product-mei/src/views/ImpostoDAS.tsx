import React, { useState } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CalendarIcon, FileText, Save } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '../hooks/use-toast';

/**
 * Componente para cadastro e gerenciamento do Imposto DAS
 */
const ImpostoDAS: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [competencia, setCompetencia] = useState<string | undefined>('');
  const [valor, setValor] = useState<string>('');
  const [numeroDas, setNumeroDas] = useState<string>('');
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [historicoPagamentos, setHistoricoPagamentos] = useState([
    { id: 1, competencia: 'Janeiro/2023', vencimento: '20/02/2023', valor: 'R$ 65,00', status: 'Pago' },
    { id: 2, competencia: 'Fevereiro/2023', vencimento: '20/03/2023', valor: 'R$ 65,00', status: 'Pago' },
    { id: 3, competencia: 'Março/2023', vencimento: '20/04/2023', valor: 'R$ 65,00', status: 'Pendente' },
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
      toast({
        title: 'Pagamento registrado',
        description: 'O pagamento do DAS foi registrado com sucesso.',
      });
      setIsLoading(false);
      // Resetar formulário
      setValor('');
      setNumeroDas('');
      setComprovante(null);
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Imposto DAS</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Cadastrar Pagamento de DAS</h2>
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

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="bg-emerald-800 hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Salvando...' : 'Registrar Pagamento'}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Informações Importantes</h2>
              <div className="space-y-3 text-sm">
                <p>O DAS (Documento de Arrecadação do Simples Nacional) deve ser pago mensalmente pelos MEIs até o dia 20 de cada mês.</p>
                <p>O valor atual do DAS para MEI é de R$ 65,00, que inclui:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>R$ 61,60 para o INSS (Previdência)</li>
                  <li>R$ 5,00 para o ISS (Serviços)</li>
                  <li>R$ 1,00 para o ICMS (Comércio e Indústria)</li>
                </ul>
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
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                        <span className="ml-1">Ver</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ImpostoDAS; 