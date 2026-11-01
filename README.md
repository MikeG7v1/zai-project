# ZAI – serie pomiarowe z czujników IoT

## Wymagania

- Node.js 20+
- PostgreSQL 14+

## Uruchomienie

Backend:

```bash
cd backend
cp .env.example .env        # uzupełnij DATABASE_URL i dane administratora
npm install
npm run migrate
npm run create-admin
npm run dev
```

Aplikacja działa pod `http://localhost:3000`.

Generator danych (parametry: `node zai-generator.mjs --help`):

```bash
cd generator
node zai-generator.mjs --api http://localhost:3000 --key <klucz API czujnika>
```
