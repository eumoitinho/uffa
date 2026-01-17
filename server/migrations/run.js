const pool = require('../config/database');

const createTables = async () => {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    // Criar tabela de usuários
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
    console.log('Tabela users criada com sucesso');

    await pool.query(`
      ALTER TABLE users
        ALTER COLUMN name DROP NOT NULL,
        ALTER COLUMN password DROP NOT NULL,
        ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
    `);

    // Criar tabela de transações
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
        source VARCHAR(50) DEFAULT 'manual',
        external_id VARCHAR(255),
        link_id VARCHAR(255),
        account_id VARCHAR(255),
        institution VARCHAR(255),
        delete_synced BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela transactions criada com sucesso');

    await pool.query(`
      ALTER TABLE transactions
        ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual',
        ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS link_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS account_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS institution VARCHAR(255);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS openfinance_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        link_id VARCHAR(255) NOT NULL,
        institution VARCHAR(255),
        access_mode VARCHAR(50) DEFAULT 'recurrent',
        status VARCHAR(50) DEFAULT 'active',
        last_synced_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, link_id)
      );
    `);
    console.log('Tabela openfinance_links criada com sucesso');

    // Criar índices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_external_source
        ON transactions(user_id, source, external_id);
      CREATE INDEX IF NOT EXISTS idx_openfinance_links_user_id ON openfinance_links(user_id);
    `);
    console.log('Índices criados com sucesso');

    console.log('Migrations executadas com sucesso!');
    await pool.end();
  } catch (error) {
    console.error('Erro ao executar migrations:', error);
    await pool.end();
    throw error;
  }
};

createTables().catch(console.error);
