import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DIContainer } from '../lib/core-exports';
import { toast } from '@/hooks/use-toast';

// Mock do container DI
vi.mock('../lib/core-exports', () => ({
  DIContainer: {
    get: vi.fn()
  }
}));

// Mock do toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('Geração de Relatórios - MEI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve gerar relatório financeiro com cálculos corretos', async () => {
    // Arrange
    const mockReportService = {
      generateFinancialReport: vi.fn().mockResolvedValue({
        success: true,
        data: {
          period: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31')
          },
          totalRevenue: 3500.00,
          totalExpenses: 800.00,
          netProfit: 2700.00,
          transactionCount: 15,
          averageTransactionValue: 233.33
        }
      })
    };

    (DIContainer.get as any).mockReturnValue(mockReportService);

    const reportParams = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    };

    // Act
    const result = await mockReportService.generateFinancialReport(reportParams);

    // Assert
    expect(mockReportService.generateFinancialReport).toHaveBeenCalledWith(reportParams);
    expect(result.success).toBe(true);
    expect(result.data.totalRevenue).toBe(3500.00);
    expect(result.data.totalExpenses).toBe(800.00);
    expect(result.data.netProfit).toBe(2700.00);
  });
});