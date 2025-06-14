import { supabase } from '../supabase';

/**
 * Serviço para gerenciar uploads de arquivos no Supabase Storage
 */
export class SupabaseStorageService {
  private static readonly BUCKET_NAME = 'comprovantes';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  /**
   * Faz upload de um comprovante para o Supabase Storage
   * @param file Arquivo a ser enviado
   * @param dasId ID do pagamento DAS
   * @returns URL pública do arquivo ou erro
   */
  static async uploadComprovante(file: File, dasId: string): Promise<{ url: string | null; error: string | null }> {
    try {
      // Validar tipo de arquivo
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        return {
          url: null,
          error: 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG.'
        };
      }

      // Validar tamanho do arquivo
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          url: null,
          error: 'Arquivo muito grande. Tamanho máximo: 5MB.'
        };
      }

      // Obter usuário atual
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return {
          url: null,
          error: 'Usuário não autenticado'
        };
      }

      // Gerar nome único para o arquivo
      const fileExtension = file.name.split('.').pop();
      const fileName = `${user.user.id}/${dasId}_${Date.now()}.${fileExtension}`;

      console.log(`[SupabaseStorageService] Fazendo upload do arquivo: ${fileName}`);

      // Fazer upload do arquivo
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('[SupabaseStorageService] Erro no upload:', error);
        return {
          url: null,
          error: `Erro no upload: ${error.message}`
        };
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log(`[SupabaseStorageService] Upload realizado com sucesso: ${urlData.publicUrl}`);

      return {
        url: urlData.publicUrl,
        error: null
      };
    } catch (error) {
      console.error('[SupabaseStorageService] Erro inesperado no upload:', error);
      return {
        url: null,
        error: `Erro inesperado: ${(error as Error).message}`
      };
    }
  }

  /**
   * Remove um comprovante do Supabase Storage
   * @param url URL do arquivo a ser removido
   * @returns Sucesso ou erro
   */
  static async deleteComprovante(url: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Extrair o caminho do arquivo da URL
      const urlParts = url.split('/');
      const fileName = urlParts.slice(-2).join('/'); // user_id/filename

      console.log(`[SupabaseStorageService] Removendo arquivo: ${fileName}`);

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        console.error('[SupabaseStorageService] Erro ao remover arquivo:', error);
        return {
          success: false,
          error: `Erro ao remover arquivo: ${error.message}`
        };
      }

      console.log(`[SupabaseStorageService] Arquivo removido com sucesso`);
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('[SupabaseStorageService] Erro inesperado ao remover arquivo:', error);
      return {
        success: false,
        error: `Erro inesperado: ${(error as Error).message}`
      };
    }
  }

  /**
   * Gera uma URL assinada para visualização privada do arquivo
   * @param url URL pública do arquivo
   * @param expiresIn Tempo de expiração em segundos (padrão: 1 hora)
   * @returns URL assinada ou erro
   */
  static async getSignedUrl(url: string, expiresIn: number = 3600): Promise<{ signedUrl: string | null; error: string | null }> {
    try {
      // Extrair o caminho do arquivo da URL
      const urlParts = url.split('/');
      const fileName = urlParts.slice(-2).join('/'); // user_id/filename

      console.log(`[SupabaseStorageService] Gerando URL assinada para: ${fileName}`);

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(fileName, expiresIn);

      if (error) {
        console.error('[SupabaseStorageService] Erro ao gerar URL assinada:', error);
        return {
          signedUrl: null,
          error: `Erro ao gerar URL assinada: ${error.message}`
        };
      }

      return {
        signedUrl: data.signedUrl,
        error: null
      };
    } catch (error) {
      console.error('[SupabaseStorageService] Erro inesperado ao gerar URL assinada:', error);
      return {
        signedUrl: null,
        error: `Erro inesperado: ${(error as Error).message}`
      };
    }
  }
}