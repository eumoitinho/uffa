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
| POST | `/api/auth/login` | Login de usuário |
| POST | `/api/auth/register` | Registro de usuário |

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

## Estrutura do Banco de Dados

### Tabela `users`
- `id` (UUID) - Chave primária
- `name` (VARCHAR) - Nome do usuário
- `email` (VARCHAR) - Email único
- `password` (VARCHAR) - Senha hash
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
- `delete_synced` (BOOLEAN) - Flag de sincronização
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
