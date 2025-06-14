# Instruções de Uso do Banco de Dados - Produto MEI

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `product-mei` com as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_APP_ENV=development
```

### 2. Estrutura do Banco

O banco de dados do produto MEI possui as seguintes tabelas principais:

- **profiles**: Perfis dos usuários
- **categories**: Categorias de receitas e despesas
- **clientes**: Cadastro de clientes
- **vendas**: Registro de vendas realizadas
- **transactions**: Transações financeiras gerais

### 3. Aplicação do Schema

Para aplicar o schema do banco de dados, execute os comandos SQL contidos no arquivo `database-schema.md`.

### 4. População de Dados de Teste

Para popular o banco com dados de teste, execute os comandos SQL contidos no arquivo `test-data-population.md`.

## Segurança

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado, garantindo que:
- Usuários só podem acessar seus próprios dados
- Políticas específicas controlam operações de SELECT, INSERT, UPDATE e DELETE

### Políticas de Acesso

Cada tabela possui políticas que verificam se `auth.uid() = user_id`, garantindo isolamento de dados entre usuários.

## Uso no Código

### Configuração do Cliente Supabase

O cliente Supabase é configurado no arquivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Operações Básicas

#### Inserir Cliente
```typescript
const { data, error } = await supabase
  .from('clientes')
  .insert({
    nome: 'Nome do Cliente',
    email: 'cliente@email.com',
    telefone: '(11) 99999-9999'
  })
```

#### Registrar Venda
```typescript
const { data, error } = await supabase
  .from('vendas')
  .insert({
    cliente_id: 'uuid-do-cliente',
    descricao: 'Descrição da venda',
    valor: 100.00,
    data_venda: '2024-01-15',
    status: 'pago'
  })
```

#### Listar Vendas
```typescript
const { data, error } = await supabase
  .from('vendas')
  .select(`
    *,
    clientes(nome, email)
  `)
  .order('data_venda', { ascending: false })
```

#### Gerenciar Pagamentos DAS
```typescript
// Inserir pagamento DAS
const { data, error } = await supabase
  .from('imposto_das')
  .insert({
    competencia: '2024-01',
    vencimento: '2024-02-20',
    valor: 66.60,
    status: 'Pendente'
  })

// Atualizar com comprovante
const { data, error } = await supabase
  .from('imposto_das')
  .update({
    status: 'Pago',
    data_pagamento: '2024-02-15',
    comprovante_url: 'url-do-comprovante'
  })
  .eq('id', 'uuid-do-pagamento')
```

## Supabase Storage

### Configuração do Storage

O sistema utiliza o Supabase Storage para armazenar comprovantes de pagamento do DAS. O bucket `comprovantes` está configurado com:

- **Acesso privado**: Apenas usuários autenticados podem acessar
- **Políticas RLS**: Usuários só podem acessar seus próprios arquivos
- **Tipos permitidos**: JPG, JPEG, PNG, WebP, PDF
- **Tamanho máximo**: 5MB por arquivo

### Operações com Storage

#### Upload de Comprovante
```typescript
// Upload de arquivo
const file = event.target.files[0]
const fileName = `${user.id}/${Date.now()}_${file.name}`

const { data, error } = await supabase.storage
  .from('comprovantes')
  .upload(fileName, file)

if (data) {
  const publicUrl = supabase.storage
    .from('comprovantes')
    .getPublicUrl(fileName).data.publicUrl
}
```

#### Obter URL Assinada
```typescript
// Para visualizar arquivo privado
const { data, error } = await supabase.storage
  .from('comprovantes')
  .createSignedUrl(fileName, 3600) // 1 hora de validade

if (data) {
  window.open(data.signedUrl, '_blank')
}
```

#### Deletar Comprovante
```typescript
// Deletar arquivo do storage
const { error } = await supabase.storage
  .from('comprovantes')
  .remove([fileName])
```

### Estrutura de Pastas

Os arquivos são organizados por usuário:
```
comprovantes/
├── {user_id}/
│   ├── {timestamp}_comprovante_das_2024_01.pdf
│   ├── {timestamp}_comprovante_das_2024_02.jpg
│   └── ...
```

### Validações

O sistema implementa as seguintes validações:
- **Tipo de arquivo**: Apenas imagens (JPG, JPEG, PNG, WebP) e PDFs
- **Tamanho**: Máximo 5MB
- **Segurança**: RLS garante isolamento entre usuários
- **Nomenclatura**: Inclui timestamp para evitar conflitos