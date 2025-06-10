# Dados de Teste - FinManage Diarista

Este documento contém comandos SQL para popular o banco de dados com dados fictícios.

## 1. Inserção de Usuários de Teste

```sql
-- Nota: Os usuários devem ser criados através do sistema de autenticação do Supabase
-- Estes são apenas os perfis que serão associados aos usuários

-- Inserir perfis de teste (assumindo que os usuários já foram criados via auth)
-- Substitua os UUIDs pelos IDs reais dos usuários criados

INSERT INTO profiles (id, first_name, last_name, email, avatar_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Maria', 'Silva', 'maria.silva@email.com', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'),
('22222222-2222-2222-2222-222222222222', 'João', 'Santos', 'joao.santos@email.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('33333333-3333-3333-3333-333333333333', 'Ana', 'Costa', 'ana.costa@email.com', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150')
ON CONFLICT (id) DO NOTHING;
```

## 2. Categorias de Teste

```sql
-- Categorias para Maria Silva (Diarista)
INSERT INTO categories (id, user_id, name, type, color, icon) VALUES
('cat-001', '11111111-1111-1111-1111-111111111111', 'Limpeza Residencial', 'receita', '#10B981', 'Home'),
('cat-002', '11111111-1111-1111-1111-111111111111', 'Limpeza Comercial', 'receita', '#3B82F6', 'Building'),
('cat-003', '11111111-1111-1111-1111-111111111111', 'Limpeza Pós-Obra', 'receita', '#F59E0B', 'Hammer'),
('cat-004', '11111111-1111-1111-1111-111111111111', 'Organização', 'receita', '#8B5CF6', 'Archive'),
('cat-005', '11111111-1111-1111-1111-111111111111', 'Produtos de Limpeza', 'despesa', '#EF4444', 'ShoppingCart'),
('cat-006', '11111111-1111-1111-1111-111111111111', 'Transporte', 'despesa', '#F97316', 'Car'),
('cat-007', '11111111-1111-1111-1111-111111111111', 'Equipamentos', 'despesa', '#6B7280', 'Tool'),
('cat-008', '11111111-1111-1111-1111-111111111111', 'Alimentação', 'despesa', '#84CC16', 'Coffee'),

-- Categorias para João Santos (Diarista)
('cat-101', '22222222-2222-2222-2222-222222222222', 'Limpeza Doméstica', 'receita', '#10B981', 'Home'),
('cat-102', '22222222-2222-2222-2222-222222222222', 'Jardinagem', 'receita', '#22C55E', 'Flower'),
('cat-103', '22222222-2222-2222-2222-222222222222', 'Manutenção', 'receita', '#F59E0B', 'Wrench'),
('cat-104', '22222222-2222-2222-2222-222222222222', 'Materiais', 'despesa', '#EF4444', 'Package'),
('cat-105', '22222222-2222-2222-2222-222222222222', 'Combustível', 'despesa', '#F97316', 'Fuel'),

-- Categorias para Ana Costa (Diarista)
('cat-201', '33333333-3333-3333-3333-333333333333', 'Limpeza Geral', 'receita', '#10B981', 'Sparkles'),
('cat-202', '33333333-3333-3333-3333-333333333333', 'Cuidado de Idosos', 'receita', '#EC4899', 'Heart'),
('cat-203', '33333333-3333-3333-3333-333333333333', 'Cuidado Infantil', 'receita', '#8B5CF6', 'Baby'),
('cat-204', '33333333-3333-3333-3333-333333333333', 'Suprimentos', 'despesa', '#EF4444', 'ShoppingBag')
ON CONFLICT (id) DO NOTHING;
```

## 3. Clientes de Teste

```sql
-- Clientes para Maria Silva
INSERT INTO clientes (id, user_id, nome, telefone, email, endereco, localizacao, observacoes) VALUES
('cli-001', '11111111-1111-1111-1111-111111111111', 'Família Oliveira', '(11) 98765-4321', 'oliveira.familia@email.com', 'Rua das Flores, 123 - Vila Madalena', 'São Paulo, SP', 'Casa de 3 quartos, tem cachorro'),
('cli-002', '11111111-1111-1111-1111-111111111111', 'Dr. Carlos Mendes', '(11) 99876-5432', 'carlos.mendes@clinica.com', 'Av. Paulista, 1000 - Sala 1205', 'São Paulo, SP', 'Consultório médico, limpeza semanal'),
('cli-003', '11111111-1111-1111-1111-111111111111', 'Sra. Beatriz Lima', '(11) 97654-3210', 'beatriz.lima@email.com', 'Rua Augusta, 456 - Consolação', 'São Paulo, SP', 'Apartamento pequeno, idosa'),
('cli-004', '11111111-1111-1111-1111-111111111111', 'Empresa TechStart', '(11) 96543-2109', 'contato@techstart.com', 'Rua Inovação, 789 - Vila Olímpia', 'São Paulo, SP', 'Escritório com 20 funcionários'),
('cli-005', '11111111-1111-1111-1111-111111111111', 'Família Rodriguez', '(11) 95432-1098', 'rodriguez@email.com', 'Alameda Santos, 321 - Jardins', 'São Paulo, SP', 'Casa grande, 2 andares'),

-- Clientes para João Santos
('cli-101', '22222222-2222-2222-2222-222222222222', 'Dona Maria Aparecida', '(11) 94321-0987', 'maria.aparecida@email.com', 'Rua do Bosque, 567 - Moema', 'São Paulo, SP', 'Casa com jardim grande'),
('cli-102', '22222222-2222-2222-2222-222222222222', 'Sr. Roberto Silva', '(11) 93210-9876', 'roberto.silva@email.com', 'Av. Rebouças, 890 - Pinheiros', 'São Paulo, SP', 'Apartamento cobertura'),
('cli-103', '22222222-2222-2222-2222-222222222222', 'Família Nascimento', '(11) 92109-8765', 'nascimento.fam@email.com', 'Rua das Palmeiras, 234 - Brooklin', 'São Paulo, SP', 'Casa com piscina'),

-- Clientes para Ana Costa
('cli-201', '33333333-3333-3333-3333-333333333333', 'Sr. José Pereira', '(11) 91098-7654', 'jose.pereira@email.com', 'Rua da Paz, 678 - Ipiranga', 'São Paulo, SP', 'Idoso, mora sozinho'),
('cli-202', '33333333-3333-3333-3333-333333333333', 'Família Almeida', '(11) 90987-6543', 'almeida.familia@email.com', 'Av. Ibirapuera, 345 - Ibirapuera', 'São Paulo, SP', 'Casal com 2 crianças pequenas'),
('cli-203', '33333333-3333-3333-3333-333333333333', 'Sra. Helena Santos', '(11) 89876-5432', 'helena.santos@email.com', 'Rua Vergueiro, 901 - Liberdade', 'São Paulo, SP', 'Apartamento, trabalha muito')
ON CONFLICT (id) DO NOTHING;
```

## 4. Agendamentos de Teste

```sql
-- Agendamentos para Maria Silva
INSERT INTO agendamentos (id, user_id, cliente_id, categoria_id, data_agendada, hora_inicio, hora_fim, status, valor_acordado, observacoes) VALUES
('agd-001', '11111111-1111-1111-1111-111111111111', 'cli-001', 'cat-001', '2024-01-15', '08:00', '12:00', 'concluido', 120.00, 'Limpeza completa da casa'),
('agd-002', '11111111-1111-1111-1111-111111111111', 'cli-002', 'cat-002', '2024-01-16', '14:00', '17:00', 'concluido', 150.00, 'Limpeza do consultório'),
('agd-003', '11111111-1111-1111-1111-111111111111', 'cli-003', 'cat-001', '2024-01-18', '09:00', '11:00', 'concluido', 80.00, 'Limpeza semanal'),
('agd-004', '11111111-1111-1111-1111-111111111111', 'cli-004', 'cat-002', '2024-01-20', '07:00', '11:00', 'em_andamento', 200.00, 'Limpeza do escritório'),
('agd-005', '11111111-1111-1111-1111-111111111111', 'cli-005', 'cat-003', '2024-01-22', '08:00', '16:00', 'em_andamento', 300.00, 'Limpeza pós-reforma'),

-- Agendamentos para João Santos
('agd-101', '22222222-2222-2222-2222-222222222222', 'cli-101', 'cat-101', '2024-01-17', '08:00', '12:00', 'concluido', 100.00, 'Limpeza e jardinagem'),
('agd-102', '22222222-2222-2222-2222-222222222222', 'cli-102', 'cat-102', '2024-01-19', '14:00', '18:00', 'concluido', 180.00, 'Manutenção do jardim'),
('agd-103', '22222222-2222-2222-2222-222222222222', 'cli-103', 'cat-103', '2024-01-21', '09:00', '13:00', 'em_andamento', 250.00, 'Reparo na piscina'),

-- Agendamentos para Ana Costa
('agd-201', '33333333-3333-3333-3333-333333333333', 'cli-201', 'cat-202', '2024-01-16', '10:00', '14:00', 'concluido', 160.00, 'Cuidado e limpeza'),
('agd-202', '33333333-3333-3333-3333-333333333333', 'cli-202', 'cat-203', '2024-01-18', '15:00', '19:00', 'concluido', 140.00, 'Cuidado das crianças'),
('agd-203', '33333333-3333-3333-3333-333333333333', 'cli-203', 'cat-201', '2024-01-20', '08:00', '12:00', 'em_andamento', 120.00, 'Limpeza semanal')
ON CONFLICT (id) DO NOTHING;
```

## 5. Serviços Realizados

```sql
-- Serviços para Maria Silva
INSERT INTO servicos (id, user_id, cliente_id, categoria_id, data, valor, status, descricao, localizacao) VALUES
('srv-001', '11111111-1111-1111-1111-111111111111', 'cli-001', 'cat-001', '2024-01-15', 120.00, 'CONCLUIDO', 'Limpeza completa: 3 quartos, 2 banheiros, sala, cozinha', 'Rua das Flores, 123 - Vila Madalena'),
('srv-002', '11111111-1111-1111-1111-111111111111', 'cli-002', 'cat-002', '2024-01-16', 150.00, 'CONCLUIDO', 'Limpeza de consultório médico', 'Av. Paulista, 1000 - Sala 1205'),
('srv-003', '11111111-1111-1111-1111-111111111111', 'cli-003', 'cat-001', '2024-01-18', 80.00, 'CONCLUIDO', 'Limpeza semanal de apartamento', 'Rua Augusta, 456 - Consolação'),
('srv-004', '11111111-1111-1111-1111-111111111111', 'cli-001', 'cat-004', '2024-01-08', 100.00, 'CONCLUIDO', 'Organização de armários e despensa', 'Rua das Flores, 123 - Vila Madalena'),
('srv-005', '11111111-1111-1111-1111-111111111111', 'cli-005', 'cat-001', '2024-01-10', 180.00, 'CONCLUIDO', 'Limpeza de casa grande - 2 andares', 'Alameda Santos, 321 - Jardins'),

-- Serviços para João Santos
('srv-101', '22222222-2222-2222-2222-222222222222', 'cli-101', 'cat-101', '2024-01-17', 100.00, 'CONCLUIDO', 'Limpeza geral da casa', 'Rua do Bosque, 567 - Moema'),
('srv-102', '22222222-2222-2222-2222-222222222222', 'cli-102', 'cat-102', '2024-01-19', 180.00, 'CONCLUIDO', 'Manutenção completa do jardim', 'Av. Rebouças, 890 - Pinheiros'),
('srv-103', '22222222-2222-2222-2222-222222222222', 'cli-101', 'cat-102', '2024-01-12', 80.00, 'CONCLUIDO', 'Poda de árvores e plantas', 'Rua do Bosque, 567 - Moema'),

-- Serviços para Ana Costa
('srv-201', '33333333-3333-3333-3333-333333333333', 'cli-201', 'cat-202', '2024-01-16', 160.00, 'CONCLUIDO', 'Cuidado de idoso e limpeza da casa', 'Rua da Paz, 678 - Ipiranga'),
('srv-202', '33333333-3333-3333-3333-333333333333', 'cli-202', 'cat-203', '2024-01-18', 140.00, 'CONCLUIDO', 'Cuidado de crianças e organização', 'Av. Ibirapuera, 345 - Ibirapuera'),
('srv-203', '33333333-3333-3333-3333-333333333333', 'cli-203', 'cat-201', '2024-01-14', 90.00, 'CONCLUIDO', 'Limpeza completa do apartamento', 'Rua Vergueiro, 901 - Liberdade')
ON CONFLICT (id) DO NOTHING;
```

## 6. Gastos de Serviços

```sql
-- Gastos para os serviços de Maria Silva
INSERT INTO gastos_servicos (id, servico_id, user_id, categoria_id, descricao, valor, data) VALUES
('gst-001', 'srv-001', '11111111-1111-1111-1111-111111111111', 'cat-005', 'Produtos de limpeza multiuso', 25.00, '2024-01-15'),
('gst-002', 'srv-001', '11111111-1111-1111-1111-111111111111', 'cat-006', 'Transporte (Uber)', 18.00, '2024-01-15'),
('gst-003', 'srv-002', '11111111-1111-1111-1111-111111111111', 'cat-005', 'Desinfetante hospitalar', 35.00, '2024-01-16'),
('gst-004', 'srv-003', '11111111-1111-1111-1111-111111111111', 'cat-005', 'Produtos básicos de limpeza', 20.00, '2024-01-18'),
('gst-005', 'srv-004', '11111111-1111-1111-1111-111111111111', 'cat-008', 'Almoço durante o serviço', 15.00, '2024-01-08'),
('gst-006', 'srv-005', '11111111-1111-1111-1111-111111111111', 'cat-005', 'Kit completo de limpeza', 45.00, '2024-01-10'),
('gst-007', 'srv-005', '11111111-1111-1111-1111-111111111111', 'cat-006', 'Transporte ida e volta', 30.00, '2024-01-10'),

-- Gastos para os serviços de João Santos
('gst-101', 'srv-101', '22222222-2222-2222-2222-222222222222', 'cat-104', 'Produtos de limpeza', 22.00, '2024-01-17'),
('gst-102', 'srv-102', '22222222-2222-2222-2222-222222222222', 'cat-104', 'Ferramentas de jardinagem', 40.00, '2024-01-19'),
('gst-103', 'srv-102', '22222222-2222-2222-2222-222222222222', 'cat-105', 'Combustível para equipamentos', 25.00, '2024-01-19'),
('gst-104', 'srv-103', '22222222-2222-2222-2222-222222222222', 'cat-104', 'Sacos para lixo verde', 12.00, '2024-01-12'),

-- Gastos para os serviços de Ana Costa
('gst-201', 'srv-201', '33333333-3333-3333-3333-333333333333', 'cat-204', 'Produtos de higiene', 30.00, '2024-01-16'),
('gst-202', 'srv-202', '33333333-3333-3333-3333-333333333333', 'cat-204', 'Material para atividades infantis', 25.00, '2024-01-18'),
('gst-203', 'srv-203', '33333333-3333-3333-3333-333333333333', 'cat-204', 'Produtos de limpeza básicos', 18.00, '2024-01-14')
ON CONFLICT (id) DO NOTHING;
```

## 7. Transações Manuais Adicionais

```sql
-- Transações adicionais para Maria Silva
INSERT INTO transactions (id, user_id, type, date, value, description, category_id, status_pagamento) VALUES
('txn-001', '11111111-1111-1111-1111-111111111111', 'despesa', '2024-01-05', 150.00, 'Compra de aspirador de pó profissional', 'cat-007', 'pago'),
('txn-002', '11111111-1111-1111-1111-111111111111', 'despesa', '2024-01-12', 80.00, 'Reposição de produtos de limpeza', 'cat-005', 'pago'),
('txn-003', '11111111-1111-1111-1111-111111111111', 'receita', '2024-01-25', 200.00, 'Serviço extra - limpeza de evento', 'cat-001', 'pendente'),

-- Transações adicionais para João Santos
('txn-101', '22222222-2222-2222-2222-222222222222', 'despesa', '2024-01-08', 120.00, 'Manutenção de equipamentos', 'cat-104', 'pago'),
('txn-102', '22222222-2222-2222-2222-222222222222', 'receita', '2024-01-25', 300.00, 'Projeto de paisagismo', 'cat-102', 'pago'),

-- Transações adicionais para Ana Costa
('txn-201', '33333333-3333-3333-3333-333333333333', 'despesa', '2024-01-10', 60.00, 'Curso de primeiros socorros', 'cat-204', 'pago'),
('txn-202', '33333333-3333-3333-3333-333333333333', 'receita', '2024-01-22', 180.00, 'Plantão noturno - cuidado de idoso', 'cat-202', 'pendente')
ON CONFLICT (id) DO NOTHING;
```

## 8. Dados Históricos (Mês Anterior)

```sql
-- Serviços do mês anterior para análise de histórico
INSERT INTO servicos (id, user_id, cliente_id, categoria_id, data, valor, status, descricao, localizacao) VALUES
-- Maria Silva - Dezembro 2023
('srv-hist-001', '11111111-1111-1111-1111-111111111111', 'cli-001', 'cat-001', '2023-12-15', 120.00, 'CONCLUIDO', 'Limpeza de fim de ano', 'Rua das Flores, 123'),
('srv-hist-002', '11111111-1111-1111-1111-111111111111', 'cli-002', 'cat-002', '2023-12-20', 150.00, 'CONCLUIDO', 'Limpeza especial de final de ano', 'Av. Paulista, 1000'),
('srv-hist-003', '11111111-1111-1111-1111-111111111111', 'cli-003', 'cat-001', '2023-12-22', 80.00, 'CONCLUIDO', 'Limpeza pré-natal', 'Rua Augusta, 456'),

-- João Santos - Dezembro 2023
('srv-hist-101', '22222222-2222-2222-2222-222222222222', 'cli-101', 'cat-101', '2023-12-18', 100.00, 'CONCLUIDO', 'Limpeza de final de ano', 'Rua do Bosque, 567'),
('srv-hist-102', '22222222-2222-2222-2222-222222222222', 'cli-102', 'cat-102', '2023-12-28', 200.00, 'CONCLUIDO', 'Preparação do jardim para verão', 'Av. Rebouças, 890'),

-- Ana Costa - Dezembro 2023
('srv-hist-201', '33333333-3333-3333-3333-333333333333', 'cli-201', 'cat-202', '2023-12-16', 160.00, 'CONCLUIDO', 'Cuidado especial de fim de ano', 'Rua da Paz, 678'),
('srv-hist-202', '33333333-3333-3333-3333-333333333333', 'cli-202', 'cat-203', '2023-12-23', 140.00, 'CONCLUIDO', 'Cuidado durante as festas', 'Av. Ibirapuera, 345')
ON CONFLICT (id) DO NOTHING;

-- Transações históricas correspondentes
INSERT INTO transactions (id, user_id, type, date, value, description, category_id, status_pagamento, servico_id, is_auto_generated) VALUES
('txn-hist-001', '11111111-1111-1111-1111-111111111111', 'receita', '2023-12-15', 120.00, 'Limpeza de fim de ano', 'cat-001', 'pago', 'srv-hist-001', true),
('txn-hist-002', '11111111-1111-1111-1111-111111111111', 'receita', '2023-12-20', 150.00, 'Limpeza especial de final de ano', 'cat-002', 'pago', 'srv-hist-002', true),
('txn-hist-003', '11111111-1111-1111-1111-111111111111', 'receita', '2023-12-22', 80.00, 'Limpeza pré-natal', 'cat-001', 'pago', 'srv-hist-003', true),
('txn-hist-101', '22222222-2222-2222-2222-222222222222', 'receita', '2023-12-18', 100.00, 'Limpeza de final de ano', 'cat-101', 'pago', 'srv-hist-101', true),
('txn-hist-102', '22222222-2222-2222-2222-222222222222', 'receita', '2023-12-28', 200.00, 'Preparação do jardim para verão', 'cat-102', 'pago', 'srv-hist-102', true),
('txn-hist-201', '33333333-3333-3333-3333-333333333333', 'receita', '2023-12-16', 160.00, 'Cuidado especial de fim de ano', 'cat-202', 'pago', 'srv-hist-201', true),
('txn-hist-202', '33333333-3333-3333-3333-333333333333', 'receita', '2023-12-23', 140.00, 'Cuidado durante as festas', 'cat-203', 'pago', 'srv-hist-202', true)
ON CONFLICT (id) DO NOTHING;
```

## 9. Comandos de Verificação

```sql
-- Verificar dados inseridos
SELECT 'Profiles' as tabela, COUNT(*) as total FROM profiles
UNION ALL
SELECT 'Categories' as tabela, COUNT(*) as total FROM categories
UNION ALL
SELECT 'Clientes' as tabela, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'Agendamentos' as tabela, COUNT(*) as total FROM agendamentos
UNION ALL
SELECT 'Serviços' as tabela, COUNT(*) as total FROM servicos
UNION ALL
SELECT 'Gastos Serviços' as tabela, COUNT(*) as total FROM gastos_servicos
UNION ALL
SELECT 'Transactions' as tabela, COUNT(*) as total FROM transactions;

-- Verificar receitas por usuário
SELECT 
    p.first_name || ' ' || p.last_name as usuario,
    SUM(CASE WHEN t.type = 'receita' THEN t.value ELSE 0 END) as total_receitas,
    SUM(CASE WHEN t.type = 'despesa' THEN t.value ELSE 0 END) as total_despesas,
    SUM(CASE WHEN t.type = 'receita' THEN t.value ELSE -t.value END) as saldo_liquido
FROM profiles p
LEFT JOIN transactions t ON p.id = t.user_id
GROUP BY p.id, p.first_name, p.last_name
ORDER BY total_receitas DESC;

-- Verificar serviços por status
SELECT 
    status,
    COUNT(*) as quantidade,
    SUM(valor) as valor_total
FROM servicos
GROUP BY status
ORDER BY quantidade DESC;
```

## 10. Comandos de Limpeza (Para Resetar os Dados)

```sql
-- ⚠️ CUIDADO: Estes comandos removem TODOS os dados de teste
-- Execute apenas se quiser limpar completamente o banco

-- Desabilitar triggers temporariamente
SET session_replication_role = replica;

-- Limpar dados na ordem correta (respeitando foreign keys)
DELETE FROM gastos_servicos;
DELETE FROM transactions WHERE is_auto_generated = true OR id LIKE 'txn-%';
DELETE FROM agendamentos;
DELETE FROM servicos;
DELETE FROM clientes;
DELETE FROM categories;
DELETE FROM profiles WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333'
);

-- Reabilitar triggers
SET session_replication_role = DEFAULT;

-- Verificar limpeza
SELECT 'Dados removidos com sucesso' as status;
```

## Resumo dos Dados de Teste

### Usuários Criados:
- **Maria Silva**: Diarista especializada em limpeza residencial e comercial
- **João Santos**: Diarista com foco em limpeza doméstica e jardinagem
- **Ana Costa**: Diarista especializada em cuidado de idosos e crianças

### Estatísticas dos Dados:
- **3 usuários** com perfis completos
- **13 categorias** (receitas e despesas)
- **11 clientes** distribuídos entre os usuários
- **12 agendamentos** (alguns concluídos, outros em andamento)
- **12 serviços** realizados
- **14 gastos** associados aos serviços
- **Transações automáticas** geradas pelos triggers
- **Dados históricos** para análise de tendências

### Funcionalidades Testadas:
- ✅ Criação de perfis de usuário
- ✅ Gestão de categorias personalizadas
- ✅ Cadastro e gestão de clientes
- ✅ Sistema de agendamentos
- ✅ Registro de serviços realizados
- ✅ Controle de gastos por serviço
- ✅ Geração automática de transações
- ✅ Relatórios financeiros
- ✅ Histórico de atividades

Estes dados fornecem uma base sólida para testar todas as funcionalidades do sistema FinManage Diarista em ambiente de desenvolvimento.