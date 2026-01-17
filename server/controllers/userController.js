const User = require('../models/User');

const userController = {
  async getById(req, res) {
    try {
      const { id } = req.params;
      if (req.userId !== id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;
      if (req.userId !== id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const updatedUser = await User.update(id, { name, email, password });

      res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async getPhoto(req, res) {
    try {
      const { id } = req.params;
      if (req.userId !== id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ photo: user.photo });
    } catch (error) {
      console.error('Erro ao buscar foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async uploadPhoto(req, res) {
    try {
      const { id } = req.params;
      if (req.userId !== id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma foto enviada' });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // URL da foto (ajuste conforme sua configuração)
      const photoUrl = `/uploads/${req.file.filename}`;

      await User.update(id, { photo: photoUrl });

      res.json({ photoUrl });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = userController;
