const BELVO_BASE_URL = (process.env.BELVO_BASE_URL || 'https://sandbox.belvo.com').replace(/\/+$/, '');
const BELVO_SECRET_ID = process.env.BELVO_SECRET_ID;
const BELVO_SECRET_PASSWORD = process.env.BELVO_SECRET_PASSWORD;

const buildUrl = (path) => {
  if (path.startsWith('http')) {
    return path;
  }
  return `${BELVO_BASE_URL}${path}`;
};

const requestBelvo = async ({ path, method = 'POST', body, useBasicAuth = false }) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (useBasicAuth) {
    if (!BELVO_SECRET_ID || !BELVO_SECRET_PASSWORD) {
      throw new Error('Belvo credentials not configured');
    }
    const token = Buffer.from(`${BELVO_SECRET_ID}:${BELVO_SECRET_PASSWORD}`).toString('base64');
    headers.Authorization = `Basic ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Belvo error ${response.status}: ${errorText}`);
  }

  return response.json();
};

const createWidgetAccessToken = async ({ name, cpf, cnpj, callbackUrls, termsUrl, branding, purpose }) => {
  if (!BELVO_SECRET_ID || !BELVO_SECRET_PASSWORD) {
    throw new Error('Belvo credentials not configured');
  }

  const identificationInfo = [
    {
      type: 'CPF',
      number: cpf,
      name,
    },
  ];

  if (cnpj) {
    identificationInfo.push({
      type: 'CNPJ',
      number: cnpj,
      name,
    });
  }

  return requestBelvo({
    path: '/api/token/',
    method: 'POST',
    body: {
      id: BELVO_SECRET_ID,
      password: BELVO_SECRET_PASSWORD,
      scopes: 'read_institutions,write_links,read_consents,write_consents,write_consent_callback,delete_consents',
      stale_in: '300d',
      fetch_resources: ['ACCOUNTS', 'TRANSACTIONS', 'OWNERS', 'BILLS', 'INVESTMENTS', 'INVESTMENT_TRANSACTIONS'],
      widget: {
        purpose,
        openfinance_feature: 'consent_link_creation',
        callback_urls: callbackUrls,
        consent: {
          terms_and_conditions_url: termsUrl,
          permissions: ['REGISTER', 'ACCOUNTS', 'CREDIT_CARDS', 'CREDIT_OPERATIONS'],
          identification_info: identificationInfo,
        },
        branding,
        theme: [],
      },
    },
  });
};

const fetchTransactions = async ({ linkId, dateFrom, dateTo }) => {
  const response = await requestBelvo({
    path: '/api/transactions/',
    method: 'POST',
    useBasicAuth: true,
    body: {
      link: linkId,
      date_from: dateFrom,
      date_to: dateTo,
    },
  });

  if (Array.isArray(response)) {
    return response;
  }

  const results = [...(response.results || [])];

  let next = response.next;
  while (next) {
    const pageResponse = await requestBelvo({
      path: next,
      method: 'GET',
      useBasicAuth: true,
    });
    results.push(...(pageResponse.results || []));
    next = pageResponse.next;
  }

  return results;
};

module.exports = {
  createWidgetAccessToken,
  fetchTransactions,
};
