const Transaction = require('../models/Transaction');

const transactionController = {
  async getAll(req, res) {
    try {
      const { userId } = req.params;
      const transactions = await Transaction.findByUserId(userId);
      res.json(transactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async getById(req, res) {
    try {
      const { userId, transactionId } = req.params;
      const transaction = await Transaction.findById(userId, transactionId);

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.json(transaction);
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async create(req, res) {
    try {
      const { userId } = req.params;
      const { id, name, type, amount, date, category, reference, deleteSynced } = req.body;

      if (!name || !type || !amount || !date) {
        return res.status(400).json({ error: 'Nome, tipo, valor e data são obrigatórios' });
      }

      const transaction = await Transaction.create(userId, {
        id,
        name,
        type,
        amount,
        date,
        category,
        reference,
        deleteSynced
      });

      res.status(201).json(transaction);
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async update(req, res) {
    try {
      const { userId, transactionId } = req.params;
      const { name, type, amount, date, category, reference, deleteSynced } = req.body;

      const existingTransaction = await Transaction.findById(userId, transactionId);

      if (!existingTransaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      const transaction = await Transaction.update(userId, transactionId, {
        name,
        type,
        amount,
        date,
        category,
        reference,
        deleteSynced
      });

      res.json(transaction);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async delete(req, res) {
    try {
      const { userId, transactionId } = req.params;

      const deleted = await Transaction.delete(userId, transactionId);

      if (!deleted) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.json({ message: 'Transação excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = transactionController;
