# UFFA

UFFA is a personal finance web app with offline-friendly transactions, charts, and education content. The project is split into a React frontend and a Node/Express + PostgreSQL backend.

## Features

- Google sign-in only (account created on first login)
- Onboarding para confirmar nome e foto de perfil
- Transaction CRUD with categories and filters
- Balance, budget, and charts
- News and education pages
- Offline storage via IndexedDB and sync on reconnect
- Profile photo upload

## Tech stack

- Frontend: React (CRA), Mantine UI, Redux Toolkit, Axios
- Backend: Node.js, Express, PostgreSQL, Multer, JWT
- Storage: IndexedDB for offline data

## Project structure

- `src/` frontend code
- `public/` static assets
- `server/` backend API and migrations
- `build/` production build output

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Backend setup

1. Install dependencies:
   `cd server && npm install`
2. Create `.env` in `server/` (see Environment variables).
3. Create the database and run migrations:
   `npm run migrate`
4. Start the API:
   `npm run dev`

### Frontend setup

1. Install dependencies:
   `npm install`
2. Create `.env` in the project root if needed.
3. Start the app:
   `npm start`

Note: `npm start` uses HTTPS by default and expects `cert.pem` and `cert-key.pem` in the project root. Adjust the `start` script if you do not need HTTPS.

## Environment variables

Frontend (`.env`):

- `REACT_APP_API_URL` - API base URL (default: `http://localhost:3001/api`)
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth client ID

Backend (`server/.env`):

- `PORT` - API port (default: `3001`)
- `DB_HOST` - database host
- `DB_PORT` - database port (default: `5432`)
- `DB_NAME` - database name (default: `uffa_db`)
- `DB_USER` - database user
- `DB_PASSWORD` - database password
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (must match frontend)
- `UPLOAD_DIR` - upload folder (default: `./uploads`)
- `BELVO_BASE_URL` - Belvo API base URL (use sandbox for testing)
- `BELVO_SECRET_ID` - Belvo secret ID
- `BELVO_SECRET_PASSWORD` - Belvo secret password
- `BELVO_WEBHOOK_SECRET` - Token para autenticação do webhook (opcional)
- `FRONTEND_URL` - URL base do frontend (para callbacks do widget)

## Google OAuth setup

1. Create an OAuth client ID in Google Cloud Console.
2. Configure authorized JavaScript origins for your frontend.
3. Set `REACT_APP_GOOGLE_CLIENT_ID` in the frontend `.env` and `GOOGLE_CLIENT_ID` in `server/.env`.

## Belvo Open Finance setup

1. Configure as credenciais `BELVO_SECRET_ID` e `BELVO_SECRET_PASSWORD`.
2. Defina `BELVO_BASE_URL` para `https://sandbox.belvo.com` em testes.
3. Crie um webhook na Belvo apontando para `/api/openfinance/webhook`.
4. Garanta que `FRONTEND_URL` esteja correto para os callbacks do widget.

## Scripts

Root:

- `npm start` - run frontend
- `npm run build` - build frontend
- `npm test` - run frontend tests

Server (`server/`):

- `npm run dev` - run API with nodemon
- `npm start` - run API
- `npm run migrate` - create tables and indexes

## API

See `server/README.md` for endpoint list and database schema.

## Legal pages

- `/privacy` - Política de Privacidade
- `/terms` - Termos de Uso
- `/lgpd` - LGPD
- `/openfinance` - Open Finance

## Open Finance

- `/openfinance/connect` - Conectar contas via Belvo (requer login)

## Changelog

See `CHANGELOG.md`.
