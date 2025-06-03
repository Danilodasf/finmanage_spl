import React, { useState, useRef } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from '@/hooks/use-toast';

const Reports: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const chartRef1 = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  
  // Dados simulados para demonstração
  const monthlyData = [
    { name: 'Jan', receitas: 4000, despesas: 2400 },
    { name: 'Fev', receitas: 3000, despesas: 1398 },
    { name: 'Mar', receitas: 2000, despesas: 9800 },
    { name: 'Abr', receitas: 2780, despesas: 3908 },
    { name: 'Mai', receitas: 1890, despesas: 4800 },
    { name: 'Jun', receitas: 2390, despesas: 3800 },
  ];
  
  const categoryData = [
    { name: 'Vendas', value: 5000 },
    { name: 'Serviços', value: 3000 },
    { name: 'Materiais', value: 2000 },
    { name: 'Aluguel', value: 1500 },
    { name: 'Impostos', value: 1000 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const exportToPDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Título
      pdf.setFontSize(18);
      pdf.text('Relatório Financeiro MEI', pageWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Período: ${period === 'month' ? 'Mensal' : period === 'quarter' ? 'Trimestral' : 'Anual'}`, pageWidth / 2, 22, { align: 'center' });
      
      // Data do relatório
      const today = new Date();
      pdf.setFontSize(10);
      pdf.text(`Gerado em: ${today.toLocaleDateString('pt-BR')}`, pageWidth - 20, 10, { align: 'right' });
      
      // Resumo financeiro
      pdf.setFontSize(14);
      pdf.text('Resumo Financeiro', 14, 35);
      
      pdf.setFontSize(12);
      pdf.text('Total de Receitas: R$ 15.060,00', 14, 45);
      pdf.text('Total de Despesas: R$ 10.306,00', 14, 52);
      pdf.text('Lucro Líquido: R$ 4.754,00', 14, 59);
      
      // Informações adicionais
      pdf.setFontSize(10);
      pdf.text('Este relatório é uma simulação e não representa dados reais.', 14, pageHeight - 10);
      
      // Salvar o PDF
      pdf.save(`relatorio-mei-${period}-${today.toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF exportado com sucesso",
        description: "O relatório foi gerado e salvo no seu dispositivo.",
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Relatórios MEI</h1>
          
          <div className="flex space-x-4">
            <Select value={period} onValueChange={(value: 'month' | 'quarter' | 'year') => setPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="quarter">Trimestral</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportToPDF}>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6" ref={chartRef1}>
            <h3 className="text-lg font-medium text-black mb-4">Receitas vs Despesas</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="receitas" fill="#3b82f6" name="Receitas" />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-6" ref={chartRef2}>
            <h3 className="text-lg font-medium text-black mb-4">Distribuição por Categoria</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        
          <Card className="p-6" ref={summaryRef}>
            <h3 className="text-lg font-medium text-black mb-4">Resumo Financeiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-600">Total de Receitas</h4>
                <p className="text-2xl font-bold text-blue-600">R$ 15.060,00</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-600">Total de Despesas</h4>
                <p className="text-2xl font-bold text-red-600">R$ 10.306,00</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-600">Lucro Líquido</h4>
                <p className="text-2xl font-bold text-green-600">R$ 4.754,00</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports; 