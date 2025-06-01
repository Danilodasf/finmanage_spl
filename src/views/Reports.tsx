
import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ReportController, ReportData, ReportFilters } from '@/controllers/ReportController';
import { CategoryController } from '@/controllers/CategoryController';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, Search } from 'lucide-react';

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    type: 'ambos'
  });

  const categories = CategoryController.getCategories();

  const handleGenerateReport = () => {
    const data = ReportController.generateReport(filters);
    setReportData(data);
  };

  const handleExportPDF = () => {
    if (reportData) {
      ReportController.exportToPDF(reportData);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros do Relatório</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate.toISOString().split('T')[0]}
                onChange={(e) => setFilters({
                  ...filters,
                  startDate: new Date(e.target.value)
                })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate.toISOString().split('T')[0]}
                onChange={(e) => setFilters({
                  ...filters,
                  endDate: new Date(e.target.value)
                })}
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select 
                value={filters.type} 
                onValueChange={(value: 'receita' | 'despesa' | 'ambos') => 
                  setFilters({...filters, type: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambos">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={filters.categoryId || 'all'} 
                onValueChange={(value) => 
                  setFilters({...filters, categoryId: value === 'all' ? undefined : value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={handleGenerateReport} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Gerar Relatório
            </Button>
            {reportData && (
              <Button 
                onClick={handleExportPDF} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </Button>
            )}
          </div>
        </Card>

        {reportData && (
          <>
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo do Período</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Receitas</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {reportData.summary.totalReceitas.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Despesas</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {reportData.summary.totalDespesas.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Saldo</p>
                  <p className={`text-2xl font-bold ${
                    reportData.summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    R$ {reportData.summary.saldo.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Transações ({reportData.transactions.length})
                </h2>
              </div>
              
              {reportData.transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma transação encontrada para os filtros selecionados.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            transaction.type === 'receita' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          R$ {transaction.value.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Reports;
