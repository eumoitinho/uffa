# UFFA Backend - API PostgreSQL

Backend API para o aplicativo UFFA de finanças pessoais.

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Instalação

1. Instale as dependências:
```bash
cd server
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```
Inclua `GOOGLE_CLIENT_ID` e `JWT_SECRET` para autenticação. Para Open Finance, configure também as variáveis `BELVO_*` e `FRONTEND_URL`.

3. Crie o banco de dados PostgreSQL:
```sql
CREATE DATABASE uffa_db;
```

4. Execute as migrations:
```bash
npm run migrate
```

5. Inicie o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/google` | Login/registro via Google |

Body esperado:
```json
{ "credential": "<google_id_token>" }
```

### Autorização

As rotas sob `/api/users` exigem `Authorization: Bearer <token>`, retornado no login via Google.

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users/:id` | Buscar usuário por ID |
| PUT | `/api/users/:id` | Atualizar usuário |
| GET | `/api/users/:id/photo` | Buscar foto do perfil |
| POST | `/api/users/:id/photo` | Upload de foto |

### Transações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users/:userId/transactions` | Listar transações |
| GET | `/api/users/:userId/transactions/:id` | Buscar transação |
| POST | `/api/users/:userId/transactions` | Criar transação |
| PUT | `/api/users/:userId/transactions/:id` | Atualizar transação |
| DELETE | `/api/users/:userId/transactions/:id` | Excluir transação |

### Open Finance (Belvo)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/openfinance/widget-token` | Gerar token do Hosted Widget |
| POST | `/api/openfinance/links` | Registrar link criado pelo widget |
| GET | `/api/openfinance/links` | Listar links do usuário |
| POST | `/api/openfinance/sync` | Sincronizar transações |
| POST | `/api/openfinance/webhook` | Webhook de eventos Belvo |

Exemplo de body para gerar token:
```json
{ "name": "Seu Nome", "cpf": "00000000000" }
```

## Estrutura do Banco de Dados

### Tabela `users`
- `id` (UUID) - Chave primária
- `name` (VARCHAR) - Nome do usuário
- `email` (VARCHAR) - Email único
- `password` (VARCHAR) - Senha hash (nullable)
- `google_id` (VARCHAR) - ID da conta Google
- `photo` (TEXT) - URL da foto
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabela `transactions`
- `id` (UUID) - Chave primária
- `user_id` (UUID) - FK para users
- `name` (VARCHAR) - Nome da transação
- `type` (VARCHAR) - Tipo (Renda/Gasto)
- `amount` (DECIMAL) - Valor
- `date` (DATE) - Data
- `category` (VARCHAR) - Categoria
- `reference` (TEXT) - Descrição
- `source` (VARCHAR) - Origem (manual/belvo)
- `external_id` (VARCHAR) - ID externo do provedor
- `link_id` (VARCHAR) - Link Belvo relacionado
- `account_id` (VARCHAR) - Conta Belvo relacionada
- `institution` (VARCHAR) - Instituição Belvo
- `delete_synced` (BOOLEAN) - Flag de sincronização
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tabela `openfinance_links`
- `id` (UUID) - Chave primária
- `user_id` (UUID) - FK para users
- `link_id` (VARCHAR) - ID do link Belvo
- `institution` (VARCHAR) - Instituição conectada
- `access_mode` (VARCHAR) - Tipo de link (recurrent/single)
- `status` (VARCHAR) - Status do link
- `last_synced_at` (TIMESTAMP) - Última sincronização
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
