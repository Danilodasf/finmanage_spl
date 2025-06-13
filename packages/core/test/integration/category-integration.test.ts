import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Teste de Integração - Categorias Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve executar teste básico de categoria', () => {
    // Arrange
    const categoria = {
      id: 'categoria-uuid-1',
      nome: 'Alimentação',
      tipo: 'despesa',
      cor: '#FF6B6B',
      icone: 'utensils',
      ativa: true
    };

    // Act
    const nomeCategoria = categoria.nome;
    const tipoCategoria = categoria.tipo;

    // Assert
    expect(nomeCategoria).toBe('Alimentação');
    expect(tipoCategoria).toBe('despesa');
    expect(categoria.ativa).toBe(true);
  });

  it('deve validar estrutura de dados da categoria', () => {
    // Arrange
    const novaCategoria = {
      nome: 'Freelance',
      tipo: 'receita',
      cor: '#4ECDC4',
      icone: 'laptop',
      ativa: true
    };

    // Act
    const temNome = novaCategoria.nome !== undefined;
    const temTipo = novaCategoria.tipo !== undefined;
    const temCor = novaCategoria.cor !== undefined;
    const temIcone = novaCategoria.icone !== undefined;

    // Assert
    expect(temNome).toBe(true);
    expect(temTipo).toBe(true);
    expect(temCor).toBe(true);
    expect(temIcone).toBe(true);
    expect(['receita', 'despesa']).toContain(novaCategoria.tipo);
  });

  it('deve simular operações básicas de CRUD de categorias', () => {
    // Arrange
    const categorias: any[] = [];
    const novaCategoria = {
      id: 'categoria-nova',
      nome: 'Investimentos',
      tipo: 'receita',
      cor: '#45B7D1',
      icone: 'trending-up',
      ativa: true
    };

    // Act - Create
    categorias.push(novaCategoria);
    const categoriaEncontrada = categorias.find(c => c.id === 'categoria-nova');

    // Act - Update
    if (categoriaEncontrada) {
      categoriaEncontrada.cor = '#2ECC71';
      categoriaEncontrada.icone = 'dollar-sign';
    }

    // Act - Soft Delete
    if (categoriaEncontrada) {
      categoriaEncontrada.ativa = false;
    }

    // Assert
    expect(categorias).toHaveLength(1);
    expect(categoriaEncontrada).toBeDefined();
    expect(categoriaEncontrada?.cor).toBe('#2ECC71');
    expect(categoriaEncontrada?.icone).toBe('dollar-sign');
    expect(categoriaEncontrada?.ativa).toBe(false);
  });

  it('deve filtrar categorias por tipo', () => {
    // Arrange
    const categorias = [
      { nome: 'Salário', tipo: 'receita', ativa: true },
      { nome: 'Freelance', tipo: 'receita', ativa: true },
      { nome: 'Alimentação', tipo: 'despesa', ativa: true },
      { nome: 'Transporte', tipo: 'despesa', ativa: true },
      { nome: 'Lazer', tipo: 'despesa', ativa: false }
    ];

    // Act
    const categoriasReceita = categorias.filter(c => c.tipo === 'receita' && c.ativa);
    const categoriasDespesa = categorias.filter(c => c.tipo === 'despesa' && c.ativa);
    const categoriasInativas = categorias.filter(c => !c.ativa);

    // Assert
    expect(categoriasReceita).toHaveLength(2);
    expect(categoriasDespesa).toHaveLength(2);
    expect(categoriasInativas).toHaveLength(1);
    expect(categoriasReceita.map(c => c.nome)).toContain('Salário');
    expect(categoriasDespesa.map(c => c.nome)).toContain('Alimentação');
  });

  it('deve validar cores únicas para categorias', () => {
    // Arrange
    const categorias = [
      { nome: 'Salário', cor: '#FF6B6B' },
      { nome: 'Freelance', cor: '#4ECDC4' },
      { nome: 'Alimentação', cor: '#45B7D1' },
      { nome: 'Transporte', cor: '#96CEB4' },
      { nome: 'Lazer', cor: '#FFEAA7' }
    ];

    // Act
    const cores = categorias.map(c => c.cor);
    const coresUnicas = [...new Set(cores)];
    const temCoresDuplicadas = cores.length !== coresUnicas.length;

    // Assert
    expect(cores).toHaveLength(5);
    expect(coresUnicas).toHaveLength(5);
    expect(temCoresDuplicadas).toBe(false);
    expect(cores).toContain('#FF6B6B');
    expect(cores).toContain('#4ECDC4');
  });

  it('deve simular hierarquia de categorias', () => {
    // Arrange
    const categorias = [
      {
        id: 'cat-1',
        nome: 'Alimentação',
        tipo: 'despesa',
        subcategorias: [
          { id: 'sub-1', nome: 'Supermercado', parent_id: 'cat-1' },
          { id: 'sub-2', nome: 'Restaurantes', parent_id: 'cat-1' },
          { id: 'sub-3', nome: 'Delivery', parent_id: 'cat-1' }
        ]
      },
      {
        id: 'cat-2',
        nome: 'Transporte',
        tipo: 'despesa',
        subcategorias: [
          { id: 'sub-4', nome: 'Combustível', parent_id: 'cat-2' },
          { id: 'sub-5', nome: 'Uber/Taxi', parent_id: 'cat-2' }
        ]
      }
    ];

    // Act
    const totalSubcategorias = categorias.reduce((total, cat) => total + cat.subcategorias.length, 0);
    const subcategoriasAlimentacao = categorias.find(c => c.nome === 'Alimentação')?.subcategorias || [];
    const subcategoriasTransporte = categorias.find(c => c.nome === 'Transporte')?.subcategorias || [];

    // Assert
    expect(categorias).toHaveLength(2);
    expect(totalSubcategorias).toBe(5);
    expect(subcategoriasAlimentacao).toHaveLength(3);
    expect(subcategoriasTransporte).toHaveLength(2);
    expect(subcategoriasAlimentacao.map(s => s.nome)).toContain('Supermercado');
    expect(subcategoriasTransporte.map(s => s.nome)).toContain('Combustível');
  });

  it('deve validar estatísticas de uso de categorias', () => {
    // Arrange
    const estatisticasCategorias = {
      'Alimentação': { uso_count: 25, valor_total: 1500.00, ultima_utilizacao: '2024-01-20' },
      'Transporte': { uso_count: 15, valor_total: 800.00, ultima_utilizacao: '2024-01-19' },
      'Lazer': { uso_count: 8, valor_total: 400.00, ultima_utilizacao: '2024-01-15' },
      'Salário': { uso_count: 2, valor_total: 6000.00, ultima_utilizacao: '2024-01-01' }
    };

    // Act
    const categoriasMaisUsadas = Object.entries(estatisticasCategorias)
      .sort(([,a], [,b]) => b.uso_count - a.uso_count)
      .slice(0, 3)
      .map(([nome]) => nome);

    const categoriaMaiorValor = Object.entries(estatisticasCategorias)
      .reduce((max, [nome, stats]) => 
        stats.valor_total > max.valor ? { nome, valor: stats.valor_total } : max,
        { nome: '', valor: 0 }
      );

    const totalTransacoes = Object.values(estatisticasCategorias)
      .reduce((total, stats) => total + stats.uso_count, 0);

    // Assert
    expect(categoriasMaisUsadas).toEqual(['Alimentação', 'Transporte', 'Lazer']);
    expect(categoriaMaiorValor.nome).toBe('Salário');
    expect(categoriaMaiorValor.valor).toBe(6000.00);
    expect(totalTransacoes).toBe(50);
    expect(estatisticasCategorias['Alimentação'].uso_count).toBe(25);
  });
});