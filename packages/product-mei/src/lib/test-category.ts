import { SupabaseMeiCategoryService } from './services/SupabaseMeiCategoryService';
import { testSupabaseConnection } from './supabase';

/**
 * Função para testar a criação de categoria manualmente
 */
export async function testCreateCategory() {
  console.log('Iniciando teste de criação de categoria...');
  
  try {
    // Testar conexão com o Supabase primeiro
    const isConnected = await testSupabaseConnection();
    
    if (!isConnected) {
      console.error('Não foi possível conectar ao Supabase. Abortando teste.');
      return false;
    }
    
    const categoryService = new SupabaseMeiCategoryService();
    
    // Criar uma categoria de teste
    const result = await categoryService.create({
      name: 'Categoria de Teste',
      type: 'receita',
      color: '#ff0000'
    });
    
    if (result.error) {
      console.error('Erro ao criar categoria de teste:', result.error);
      return false;
    }
    
    console.log('Categoria de teste criada com sucesso:', result.data);
    return true;
  } catch (error) {
    console.error('Erro durante o teste de criação de categoria:', error);
    return false;
  }
} 