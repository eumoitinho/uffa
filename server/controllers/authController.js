const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const isValidPassword = await User.comparePassword(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'uffa_secret_key',
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          photo: user.photo
        },
        token
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      const existingUser = await User.findByEmail(email);

      if (existingUser) {
        return res.status(409).json({ error: 'Usuário já cadastrado' });
      }

      const user = await User.create({ name, email, password });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'uffa_secret_key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          photo: user.photo
        },
        token
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = authController;
