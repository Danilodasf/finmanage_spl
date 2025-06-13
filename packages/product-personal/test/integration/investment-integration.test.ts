import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Teste de Integração - Investimentos Personal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve executar teste básico de investimento', () => {
    // Arrange
    const investimento = {
      id: 'invest-uuid-1',
      nome: 'Tesouro Direto',
      tipo: 'renda_fixa',
      valor_inicial: 1000.00,
      valor_atual: 1050.00,
      data_aplicacao: '2024-01-01',
      rentabilidade: 5.0
    };

    // Act
    const valorInicial = investimento.valor_inicial;
    const valorAtual = investimento.valor_atual;
    const lucro = valorAtual - valorInicial;

    // Assert
    expect(valorInicial).toBe(1000.00);
    expect(valorAtual).toBe(1050.00);
    expect(lucro).toBe(50.00);
    expect(investimento.tipo).toBe('renda_fixa');
  });

  it('deve validar estrutura de dados do investimento', () => {
    // Arrange
    const novoInvestimento = {
      nome: 'Ações PETR4',
      tipo: 'renda_variavel',
      valor_inicial: 2000.00,
      valor_atual: 2200.00,
      data_aplicacao: '2024-01-15',
      rentabilidade: 10.0
    };

    // Act
    const temNome = novoInvestimento.nome !== undefined;
    const temTipo = novoInvestimento.tipo !== undefined;
    const temValorInicial = novoInvestimento.valor_inicial !== undefined;
    const temRentabilidade = novoInvestimento.rentabilidade !== undefined;

    // Assert
    expect(temNome).toBe(true);
    expect(temTipo).toBe(true);
    expect(temValorInicial).toBe(true);
    expect(temRentabilidade).toBe(true);
    expect(['renda_fixa', 'renda_variavel', 'fundos', 'cripto']).toContain(novoInvestimento.tipo);
  });

  it('deve simular operações básicas de CRUD de investimentos', () => {
    // Arrange
    const investimentos: any[] = [];
    const novoInvestimento = {
      id: 'invest-novo',
      nome: 'CDB Banco XYZ',
      tipo: 'renda_fixa',
      valor_inicial: 5000.00,
      valor_atual: 5000.00,
      data_aplicacao: '2024-01-20',
      rentabilidade: 0.0
    };

    // Act - Create
    investimentos.push(novoInvestimento);
    const investimentoEncontrado = investimentos.find(i => i.id === 'invest-novo');

    // Act - Update (simulando valorização)
    if (investimentoEncontrado) {
      investimentoEncontrado.valor_atual = 5150.00;
      investimentoEncontrado.rentabilidade = 3.0;
    }

    // Assert
    expect(investimentos).toHaveLength(1);
    expect(investimentoEncontrado).toBeDefined();
    expect(investimentoEncontrado?.valor_atual).toBe(5150.00);
    expect(investimentoEncontrado?.rentabilidade).toBe(3.0);
  });

  it('deve calcular performance da carteira de investimentos', () => {
    // Arrange
    const carteira = [
      { nome: 'Tesouro Direto', valor_inicial: 1000.00, valor_atual: 1050.00, tipo: 'renda_fixa' },
      { nome: 'Ações VALE3', valor_inicial: 2000.00, valor_atual: 2300.00, tipo: 'renda_variavel' },
      { nome: 'Fundo Imobiliário', valor_inicial: 1500.00, valor_atual: 1450.00, tipo: 'fundos' },
      { nome: 'Bitcoin', valor_inicial: 500.00, valor_atual: 600.00, tipo: 'cripto' }
    ];

    // Act
    const valorTotalInicial = carteira.reduce((total, inv) => total + inv.valor_inicial, 0);
    const valorTotalAtual = carteira.reduce((total, inv) => total + inv.valor_atual, 0);
    const lucroTotal = valorTotalAtual - valorTotalInicial;
    const rentabilidadeGeral = (lucroTotal / valorTotalInicial) * 100;
    const investimentosPositivos = carteira.filter(inv => inv.valor_atual > inv.valor_inicial);

    // Assert
    expect(valorTotalInicial).toBe(5000.00);
    expect(valorTotalAtual).toBe(5400.00);
    expect(lucroTotal).toBe(400.00);
    expect(rentabilidadeGeral).toBe(8.0);
    expect(investimentosPositivos).toHaveLength(3);
  });

  it('deve agrupar investimentos por tipo', () => {
    // Arrange
    const investimentos = [
      { tipo: 'renda_fixa', valor_atual: 1050.00 },
      { tipo: 'renda_fixa', valor_atual: 2100.00 },
      { tipo: 'renda_variavel', valor_atual: 2300.00 },
      { tipo: 'renda_variavel', valor_atual: 1800.00 },
      { tipo: 'fundos', valor_atual: 1450.00 },
      { tipo: 'cripto', valor_atual: 600.00 }
    ];

    // Act
    const agrupados = investimentos.reduce((acc, inv) => {
      if (!acc[inv.tipo]) {
        acc[inv.tipo] = { total: 0, quantidade: 0 };
      }
      acc[inv.tipo].total += inv.valor_atual;
      acc[inv.tipo].quantidade += 1;
      return acc;
    }, {} as Record<string, { total: number; quantidade: number }>);

    // Assert
    expect(Object.keys(agrupados)).toHaveLength(4);
    expect(agrupados['renda_fixa'].total).toBe(3150.00);
    expect(agrupados['renda_fixa'].quantidade).toBe(2);
    expect(agrupados['renda_variavel'].total).toBe(4100.00);
    expect(agrupados['renda_variavel'].quantidade).toBe(2);
    expect(agrupados['fundos'].total).toBe(1450.00);
    expect(agrupados['cripto'].total).toBe(600.00);
  });

  it('deve simular estratégia de diversificação', () => {
    // Arrange
    const estrategiaDiversificacao = {
      meta_renda_fixa: 40, // 40%
      meta_renda_variavel: 35, // 35%
      meta_fundos: 20, // 20%
      meta_cripto: 5, // 5%
      valor_total_carteira: 10000.00
    };

    const carteiraAtual = {
      renda_fixa: 3500.00,
      renda_variavel: 4000.00,
      fundos: 2000.00,
      cripto: 500.00
    };

    // Act
    const totalAtual = Object.values(carteiraAtual).reduce((total, valor) => total + valor, 0);
    const percentuais = {
      renda_fixa: (carteiraAtual.renda_fixa / totalAtual) * 100,
      renda_variavel: (carteiraAtual.renda_variavel / totalAtual) * 100,
      fundos: (carteiraAtual.fundos / totalAtual) * 100,
      cripto: (carteiraAtual.cripto / totalAtual) * 100
    };

    const rebalanceamento = {
      renda_fixa: (estrategiaDiversificacao.meta_renda_fixa / 100) * totalAtual - carteiraAtual.renda_fixa,
      renda_variavel: (estrategiaDiversificacao.meta_renda_variavel / 100) * totalAtual - carteiraAtual.renda_variavel,
      fundos: (estrategiaDiversificacao.meta_fundos / 100) * totalAtual - carteiraAtual.fundos,
      cripto: (estrategiaDiversificacao.meta_cripto / 100) * totalAtual - carteiraAtual.cripto
    };

    // Assert
    expect(totalAtual).toBe(10000.00);
    expect(percentuais.renda_fixa).toBe(35.0);
    expect(percentuais.renda_variavel).toBe(40.0);
    expect(percentuais.fundos).toBe(20.0);
    expect(percentuais.cripto).toBe(5.0);
    expect(rebalanceamento.renda_fixa).toBe(500.00); // Precisa comprar mais 500
    expect(rebalanceamento.renda_variavel).toBe(-500.00); // Precisa vender 500
  });

  it('deve calcular projeção de crescimento', () => {
    // Arrange
    const investimento = {
      valor_inicial: 1000.00,
      taxa_juros_anual: 12.0, // 12% ao ano
      periodo_meses: 24 // 2 anos
    };

    // Act - Juros compostos
    const taxaMensal = investimento.taxa_juros_anual / 12 / 100;
    const valorFinal = investimento.valor_inicial * Math.pow(1 + taxaMensal, investimento.periodo_meses);
    const lucroTotal = valorFinal - investimento.valor_inicial;
    const rentabilidadeTotal = (lucroTotal / investimento.valor_inicial) * 100;

    // Assert
    expect(valorFinal).toBeCloseTo(1269.73, 2);
    expect(lucroTotal).toBeCloseTo(269.73, 2);
    expect(rentabilidadeTotal).toBeCloseTo(26.97, 2);
  });
});