const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Função para obter info do usuário via access_token
const getUserInfoFromAccessToken = async (accessToken) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error('Falha ao obter informações do usuário');
  }
  return response.json();
};

const authController = {
  async googleLogin(req, res) {
    try {
      const { token, tokenType, credential } = req.body;
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        return res.status(500).json({ error: 'JWT_SECRET não configurado' });
      }

      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'GOOGLE_CLIENT_ID não configurado' });
      }

      // Suporta tanto o formato antigo (credential) quanto o novo (token + tokenType)
      const authToken = token || credential;
      const authType = tokenType || 'credential';

      if (!authToken) {
        return res.status(400).json({ error: 'Token do Google é obrigatório' });
      }

      let googleId, email, name, photo, emailVerified;

      if (authType === 'access_token') {
        // Usar access_token para obter info do usuário
        try {
          const userInfo = await getUserInfoFromAccessToken(authToken);
          googleId = userInfo.sub;
          email = userInfo.email;
          name = userInfo.name;
          photo = userInfo.picture;
          emailVerified = userInfo.email_verified;
        } catch (error) {
          console.error('Erro ao obter userinfo:', error);
          return res.status(401).json({ error: 'Access token do Google inválido' });
        }
      } else {
        // Usar credential (ID token) - método original
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: authToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          googleId = payload?.sub;
          email = payload?.email;
          name = payload?.name;
          photo = payload?.picture;
          emailVerified = payload?.email_verified;
        } catch (error) {
          return res.status(401).json({ error: 'Token do Google inválido' });
        }
      }

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
      const jwtToken = jwt.sign(
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
        token: jwtToken,
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
