-- Primeiro, remover a restrição de chave estrangeira existente
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
 
-- Atualizar a coluna para usar a tabela profiles como referência
ALTER TABLE categories 
ADD CONSTRAINT categories_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) ON DELETE CASCADE; 