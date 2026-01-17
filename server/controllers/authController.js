const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
  async googleLogin(req, res) {
    try {
      const { credential } = req.body;
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        return res.status(500).json({ error: 'JWT_SECRET não configurado' });
      }

      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'GOOGLE_CLIENT_ID não configurado' });
      }

      if (!credential) {
        return res.status(400).json({ error: 'Credencial do Google é obrigatória' });
      }

      let payload;
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (error) {
        return res.status(401).json({ error: 'Token do Google inválido' });
      }

      const googleId = payload?.sub;
      const email = payload?.email;
      const name = payload?.name;
      const photo = payload?.picture;
      const emailVerified = payload?.email_verified;

      if (!googleId || !email || !emailVerified) {
        return res.status(400).json({ error: 'Conta Google inválida ou não verificada' });
      }

      let user = await User.findByGoogleId(googleId);
      let isNewUser = false;

      if (!user) {
        const existingByEmail = await User.findByEmail(email);
        if (existingByEmail) {
          const updates = { googleId };
          if (!existingByEmail.name && name) {
            updates.name = name;
          }
          if (!existingByEmail.photo && photo) {
            updates.photo = photo;
          }
          user = await User.update(existingByEmail.id, updates);
        } else {
          isNewUser = true;
          user = await User.createFromGoogle({
            name,
            email,
            googleId,
            photo,
          });
        }
      } else {
        const updates = {};
        if (!user.name && name) {
          updates.name = name;
        }
        if (!user.photo && photo) {
          updates.photo = photo;
        }
        if (!user.email && email) {
          updates.email = email;
        }
        if (Object.keys(updates).length > 0) {
          user = await User.update(user.id, updates);
        }
      }

      const needsOnboarding = !user?.name || user.name.trim().length < 2;
      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          photo: user.photo,
        },
        token,
        needsOnboarding,
        isNewUser,
      });
    } catch (error) {
      console.error('Erro no login com Google:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },
};

module.exports = authController;
