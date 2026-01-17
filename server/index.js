require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Rodar migrations automaticamente no startup
const runMigrations = async () => {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        google_id VARCHAR(255),
        photo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      ALTER TABLE users
        ALTER COLUMN name DROP NOT NULL,
        ALTER COLUMN password DROP NOT NULL,
        ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(100),
        reference TEXT,
        delete_synced BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    `);
    console.log('Migrations executadas com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migrations:', error.message);
  }
};

runMigrations();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api', routes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint de diagnóstico do banco
app.get('/diag', async (req, res) => {
  try {
    const result = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    const tables = result.rows.map(r => r.table_name);
    res.json({ status: 'ok', tables, dbConnected: true });
  } catch (error) {
    res.json({ status: 'error', error: error.message, dbConnected: false });
  }
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
});
