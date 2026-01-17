const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT * FROM transactions
       WHERE user_id = $1
       ORDER BY date DESC`,
      [userId]
    );
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      amount: parseFloat(row.amount),
      date: row.date.toISOString().split('T')[0],
      category: row.category,
      reference: row.reference,
      deleteSynced: row.delete_synced
    }));
  }

  static async findById(userId, transactionId) {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [transactionId, userId]
    );
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        amount: parseFloat(row.amount),
        date: row.date.toISOString().split('T')[0],
        category: row.category,
        reference: row.reference,
        deleteSynced: row.delete_synced
      };
    }
    return null;
  }

  static async create(userId, data) {
    const id = data.id || uuidv4();
    const result = await pool.query(
      `INSERT INTO transactions (id, user_id, name, type, amount, date, category, reference, delete_synced)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        userId,
        data.name,
        data.type,
        data.amount,
        data.date,
        data.category || null,
        data.reference || null,
        data.deleteSynced !== undefined ? data.deleteSynced : true
      ]
    );
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      amount: parseFloat(row.amount),
      date: row.date.toISOString().split('T')[0],
      category: row.category,
      reference: row.reference,
      deleteSynced: row.delete_synced
    };
  }

  static async update(userId, transactionId, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name) {
      fields.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }

    if (data.type) {
      fields.push(`type = $${paramCount}`);
      values.push(data.type);
      paramCount++;
    }

    if (data.amount !== undefined) {
      fields.push(`amount = $${paramCount}`);
      values.push(data.amount);
      paramCount++;
    }

    if (data.date) {
      fields.push(`date = $${paramCount}`);
      values.push(data.date);
      paramCount++;
    }

    if (data.category !== undefined) {
      fields.push(`category = $${paramCount}`);
      values.push(data.category);
      paramCount++;
    }

    if (data.reference !== undefined) {
      fields.push(`reference = $${paramCount}`);
      values.push(data.reference);
      paramCount++;
    }

    if (data.deleteSynced !== undefined) {
      fields.push(`delete_synced = $${paramCount}`);
      values.push(data.deleteSynced);
      paramCount++;
    }

    if (fields.length === 0) {
      return await this.findById(userId, transactionId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(transactionId);
    values.push(userId);

    const result = await pool.query(
      `UPDATE transactions SET ${fields.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        amount: parseFloat(row.amount),
        date: row.date.toISOString().split('T')[0],
        category: row.category,
        reference: row.reference,
        deleteSynced: row.delete_synced
      };
    }
    return null;
  }

  static async delete(userId, transactionId) {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [transactionId, userId]
    );
    return result.rowCount > 0;
  }

  static async upsertExternal(userId, transactions) {
    if (!transactions || transactions.length === 0) {
      return 0;
    }

    const values = [];
    const placeholders = transactions.map((transaction) => {
      const placeholder = [
        userId,
        transaction.name,
        transaction.type,
        transaction.amount,
        transaction.date,
        transaction.category || null,
        transaction.reference || null,
        transaction.source || 'belvo',
        transaction.externalId,
        transaction.linkId || null,
        transaction.accountId || null,
        transaction.institution || null,
        transaction.deleteSynced !== undefined ? transaction.deleteSynced : true,
      ];
      values.push(...placeholder);
      const startIndex = values.length - placeholder.length + 1;
      const indexes = placeholder.map((_, idx) => `$${startIndex + idx}`);
      return `(${indexes.join(', ')})`;
    });

    const result = await pool.query(
      `INSERT INTO transactions (
        user_id,
        name,
        type,
        amount,
        date,
        category,
        reference,
        source,
        external_id,
        link_id,
        account_id,
        institution,
        delete_synced
      )
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (user_id, source, external_id) DO NOTHING`,
      values
    );

    return result.rowCount;
  }
}

module.exports = Transaction;
