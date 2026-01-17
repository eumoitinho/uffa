const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByGoogleId(googleId) {
    const result = await pool.query(
      'SELECT id, name, email, photo, created_at, updated_at FROM users WHERE google_id = $1',
      [googleId]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, photo, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create({ name, email, password, photo }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, photo)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, photo, created_at`,
      [name, email, hashedPassword, photo || null]
    );
    return result.rows[0];
  }

  static async createFromGoogle({ name, email, googleId, photo }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, photo, google_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, photo, created_at`,
      [name || null, email, null, photo || null, googleId]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name) {
      fields.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }

    if (data.email) {
      fields.push(`email = $${paramCount}`);
      values.push(data.email);
      paramCount++;
    }

    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      fields.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (data.photo !== undefined) {
      fields.push(`photo = $${paramCount}`);
      values.push(data.photo);
      paramCount++;
    }

    if (data.googleId) {
      fields.push(`google_id = $${paramCount}`);
      values.push(data.googleId);
      paramCount++;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, name, email, photo, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;
