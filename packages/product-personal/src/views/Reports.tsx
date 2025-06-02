import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ReportController, ReportData, ReportFilters } from '@/controllers/ReportController';
import { CategoryController } from '@/controllers/CategoryController';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, Search, CalendarDays, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from '@/lib/AuthContext';
import { Category } from '@/lib/services/CategoryService';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    type: 'ambos'
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await CategoryController.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const data = await ReportController.generateReport(filters);
      setReportData(data);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (reportData) {
      setIsExporting(true);
      try {
        await ReportController.exportToPDF(reportData);
      } catch (error) {
        console.error('Erro ao exportar relatório:', error);
      } finally {
        setIsExporting(false);
      }
    }
  };

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  if (isLoadingCategories) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-lg">Carregando categorias...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-800">Relatórios</h1>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-emerald-800 mb-4">Filtros do Relatório</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <div className="flex flex-col space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.startDate && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {filters.startDate ? (
                        format(filters.startDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2 border-b">
                      <Input
                        type="date"
                        value={filters.startDate.toISOString().split('T')[0]}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          if (!isNaN(newDate.getTime())) {
                            setFilters({...filters, startDate: newDate});
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => date && setFilters({...filters, startDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <div className="flex flex-col space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.endDate && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {filters.endDate ? (
                        format(filters.endDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2 border-b">
                      <Input
                        type="date"
                        value={filters.endDate.toISOString().split('T')[0]}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          if (!isNaN(newDate.getTime())) {
                            setFilters({...filters, endDate: newDate});
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => date && setFilters({...filters, endDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select 
                value={filters.type} 
                onValueChange={(value: 'receita' | 'despesa' | 'ambos') => 
                  setFilters({...filters, type: value})
                }
                disabled={isLoading}
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
                disabled={isLoading}
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
            <Button 
              onClick={handleGenerateReport} 
              className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Gerar Relatório
                </>
              )}
            </Button>
            {reportData && (
              <Button 
                onClick={handleExportPDF} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Exportar PDF
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {reportData && (
          <>
            <Card className="p-6">
              <h2 className="text-lg font-medium text-emerald-800 mb-4">Resumo do Período</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Receitas</p>
                  <p className="text-2xl font-bold text-blue-600">
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
                    reportData.summary.saldo >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    R$ {reportData.summary.saldo.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-emerald-800">
                  Transações ({reportData.transactions.length})
                </h2>
              </div>
              
              {reportData.transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma transação encontrada para os filtros selecionados.
                </p>
              ) : (
                <div className="overflow-x-auto">
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
                          <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <span className={transaction.type === 'receita' ? 'text-blue-600' : 'text-red-600'}>
                              {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                            </span>
                          </TableCell>
                          <TableCell>{transaction.description || '-'}</TableCell>
                          <TableCell>{getCategoryName(transaction.category_id)}</TableCell>
                          <TableCell className="text-right">
                            <span className={transaction.type === 'receita' ? 'text-blue-600' : 'text-red-600'}>
                              R$ {transaction.value.toFixed(2)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Reports; 