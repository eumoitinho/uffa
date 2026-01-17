const OpenFinanceLink = require('../models/OpenFinanceLink');
const Transaction = require('../models/Transaction');
const { createWidgetAccessToken, fetchTransactions } = require('../services/belvoService');

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
const WIDGET_URL = 'https://widget.belvo.io/';

const buildCallbackUrls = () => {
  const callbackBase = `${FRONTEND_URL}/openfinance/connect`;
  return {
    success: `${callbackBase}?state=success`,
    exit: `${callbackBase}?state=exit`,
    event: `${callbackBase}?state=error`,
  };
};

const mapTransactionType = (transactionType, amount) => {
  const normalizedType = (transactionType || '').toString().toLowerCase();
  const outflowHints = ['outflow', 'debit', 'payment', 'saida'];
  const isOutflow = amount < 0 || outflowHints.some((hint) => normalizedType.includes(hint));
  return isOutflow ? 'Gasto' : 'Renda';
};

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split('T')[0];
};

const mapBelvoTransaction = (transaction, link) => {
  const amountValue = Number(transaction.amount);
  if (Number.isNaN(amountValue)) {
    return null;
  }

  if (!transaction.id) {
    return null;
  }

  const normalizedAmount = Math.abs(amountValue);
  const date =
    normalizeDate(transaction.value_date) ||
    normalizeDate(transaction.accounting_date) ||
    normalizeDate(transaction.date) ||
    normalizeDate(transaction.purchase_date);

  if (!date) {
    return null;
  }

  const category = Array.isArray(transaction.category)
    ? transaction.category[0]
    : transaction.category?.value || transaction.category || null;

  return {
    name: transaction.description || transaction.merchant || transaction.reference || 'Transação',
    type: mapTransactionType(transaction.type, amountValue),
    amount: normalizedAmount,
    date,
    category,
    reference: transaction.reference || transaction.merchant || transaction.description || null,
    source: 'belvo',
    externalId: transaction.id,
    linkId: link.link_id,
    accountId: transaction.account?.id || transaction.account || null,
    institution: link.institution || null,
    deleteSynced: true,
  };
};

const openFinanceController = {
  async widgetToken(req, res) {
    try {
      const { name, cpf, cnpj } = req.body;
      const userId = req.userId;

      if (!name || !cpf) {
        return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
      }

      const sanitizedCpf = cpf.replace(/\D/g, '');
      const sanitizedCnpj = cnpj ? cnpj.replace(/\D/g, '') : null;

      if (sanitizedCpf.length !== 11) {
        return res.status(400).json({ error: 'CPF inválido' });
      }

      if (sanitizedCnpj && sanitizedCnpj.length !== 14) {
        return res.status(400).json({ error: 'CNPJ inválido' });
      }

      const response = await createWidgetAccessToken({
        name,
        cpf: sanitizedCpf,
        cnpj: sanitizedCnpj,
        callbackUrls: buildCallbackUrls(),
        termsUrl: `${FRONTEND_URL}/openfinance`,
        branding: {
          company_icon: `${FRONTEND_URL}/logo-png.png`,
          company_logo: `${FRONTEND_URL}/logo-png.png`,
          company_name: 'UFFA',
          company_terms_url: `${FRONTEND_URL}/terms`,
          overlay_background_color: '#F0F2F4',
          social_proof: true,
        },
        purpose:
          'Organização financeira personalizada com insights e controle de gastos e entradas.',
      });

      if (!response?.access) {
        return res.status(500).json({ error: 'Não foi possível gerar o token do widget' });
      }

      const widgetUrl = `${WIDGET_URL}?access_token=${response.access}&locale=pt&access_mode=recurrent&external_id=${encodeURIComponent(
        userId
      )}`;

      res.json({
        accessToken: response.access,
        widgetUrl,
      });
    } catch (error) {
      console.error('Erro ao gerar token do widget Belvo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async registerLink(req, res) {
    try {
      const { link, institution, accessMode } = req.body;
      const userId = req.userId;

      if (!link) {
        return res.status(400).json({ error: 'Link é obrigatório' });
      }

      const savedLink = await OpenFinanceLink.create({
        userId,
        linkId: link,
        institution,
        accessMode,
      });

      res.status(201).json(savedLink);
    } catch (error) {
      console.error('Erro ao registrar link Open Finance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async listLinks(req, res) {
    try {
      const links = await OpenFinanceLink.findByUserId(req.userId);
      res.json(links);
    } catch (error) {
      console.error('Erro ao listar links Open Finance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async sync(req, res) {
    try {
      const { linkId, dateFrom, dateTo } = req.body;
      const userId = req.userId;

      const links = linkId
        ? [await OpenFinanceLink.findByLinkId(linkId)].filter(Boolean)
        : await OpenFinanceLink.findByUserId(userId);

      if (!links.length) {
        return res.json({ synced: 0 });
      }

      const from = dateFrom || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const to = dateTo || new Date().toISOString().split('T')[0];

      let totalSynced = 0;

      for (const link of links) {
        if (link.user_id && link.user_id !== userId) {
          continue;
        }
        const transactions = await fetchTransactions({
          linkId: link.link_id,
          dateFrom: from,
          dateTo: to,
        });

        const mappedTransactions = transactions
          .map((transaction) => mapBelvoTransaction(transaction, link))
          .filter(Boolean);

        const inserted = await Transaction.upsertExternal(userId, mappedTransactions);
        totalSynced += inserted;
        await OpenFinanceLink.updateLastSynced(link.link_id);
      }

      res.json({ synced: totalSynced });
    } catch (error) {
      console.error('Erro ao sincronizar transações Open Finance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async webhook(req, res) {
    try {
      const secret = process.env.BELVO_WEBHOOK_SECRET;
      const authHeader = req.headers.authorization;

      if (secret && authHeader !== `Bearer ${secret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { webhook_type: webhookType, link_id: linkId, external_id: externalId } = req.body || {};

      if (webhookType !== 'TRANSACTIONS') {
        return res.json({ status: 'ignored' });
      }

      let link = null;
      if (linkId) {
        link = await OpenFinanceLink.findByLinkId(linkId);
      }

      const userId = externalId || link?.user_id;
      if (!userId || !link) {
        return res.json({ status: 'unknown_link' });
      }

      const transactions = await fetchTransactions({
        linkId: link.link_id,
        dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
      });

      const mappedTransactions = transactions
        .map((transaction) => mapBelvoTransaction(transaction, link))
        .filter(Boolean);

      await Transaction.upsertExternal(userId, mappedTransactions);
      await OpenFinanceLink.updateLastSynced(link.link_id);

      res.json({ status: 'ok' });
    } catch (error) {
      console.error('Erro ao processar webhook Belvo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },
};

module.exports = openFinanceController;
