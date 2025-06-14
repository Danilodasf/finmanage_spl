-- Migração para configurar Supabase Storage para comprovantes
-- Data: 2024-01-15
-- Descrição: Cria bucket e políticas de segurança para armazenar comprovantes de pagamento DAS

-- Criar bucket para comprovantes (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'comprovantes', 
    'comprovantes', 
    false, 
    5242880, -- 5MB em bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Habilitar RLS no storage.objects se não estiver habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de seus próprios comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios comprovantes" ON storage.objects;

-- Política para permitir que usuários vejam apenas seus próprios comprovantes
CREATE POLICY "Usuários podem ver apenas seus próprios comprovantes"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'comprovantes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários façam upload de seus próprios comprovantes
CREATE POLICY "Usuários podem fazer upload de seus próprios comprovantes"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'comprovantes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários atualizem seus próprios comprovantes
CREATE POLICY "Usuários podem atualizar seus próprios comprovantes"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'comprovantes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários deletem seus próprios comprovantes
CREATE POLICY "Usuários podem deletar seus próprios comprovantes"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'comprovantes' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verificar se o bucket foi criado com sucesso
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM storage.buckets 
        WHERE id = 'comprovantes'
    ) THEN
        RAISE NOTICE 'Bucket "comprovantes" configurado com sucesso';
        RAISE NOTICE 'Políticas de segurança aplicadas';
        RAISE NOTICE 'Tipos de arquivo permitidos: JPG, JPEG, PNG, WebP, PDF';
        RAISE NOTICE 'Tamanho máximo: 5MB';
    ELSE
        RAISE EXCEPTION 'Falha ao criar bucket "comprovantes"';
    END IF;
END $$;