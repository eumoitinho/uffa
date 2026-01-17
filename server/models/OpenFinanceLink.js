const pool = require('../config/database');

class OpenFinanceLink {
  static async create({ userId, linkId, institution, accessMode }) {
    const result = await pool.query(
      `INSERT INTO openfinance_links (user_id, link_id, institution, access_mode)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, link_id)
       DO UPDATE SET institution = EXCLUDED.institution, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, linkId, institution || null, accessMode || 'recurrent']
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT * FROM openfinance_links
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findByLinkId(linkId) {
    const result = await pool.query(
      `SELECT * FROM openfinance_links
       WHERE link_id = $1`,
      [linkId]
    );
    return result.rows[0];
  }

  static async updateLastSynced(linkId) {
    const result = await pool.query(
      `UPDATE openfinance_links
       SET last_synced_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE link_id = $1
       RETURNING *`,
      [linkId]
    );
    return result.rows[0];
  }
}

module.exports = OpenFinanceLink;
