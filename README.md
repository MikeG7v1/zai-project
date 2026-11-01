# ZAI – serie pomiarowe z czujników IoT

Aplikacja internetowa do zbierania i prezentacji wyników pomiarów przesyłanych przez czujniki (emulowane generatorem) w wielu seriach. Projekt z przedmiotu Zaawansowane Aplikacje Internetowe (26Z).

## Struktura

| Katalog | Zawartość |
| --- | --- |
| `backend/` | REST API (Node.js, Express 5, PostgreSQL, Knex) |
| `generator/` | generator danych – emulator czujnika ([opis parametrów](generator/README.md)) |

## Architektura backendu

Żądanie przechodzi przez kolejne warstwy w `backend/src/`:

| Katalog | Odpowiedzialność |
| --- | --- |
| `routes/` | mapowanie ścieżek i metod HTTP na kontrolery i middleware |
| `middleware/` | uwierzytelnianie, negocjacja formatu, nagłówki bezpieczeństwa, obsługa błędów |
| `controllers/` | odczyt żądania, wywołanie serwisu, wysłanie odpowiedzi |
| `validators/` | sprawdzenie poprawności danych wejściowych (ciało żądania, parametry); błędy jako 400 |
| `parsers/` | zamiana poprawnych danych wejściowych na obiekty dziedziny (np. tekst daty na `Date`) |
| `services/` | logika biznesowa: reguły serii, czujników, pomiarów i logowania |
| `models/` | dostęp do bazy danych (Knex), mapowanie wierszy na obiekty |
| `views/` | reprezentacja JSON zwracana przez API |
| `domain/` | stałe i limity dziedziny |

## Uruchomienie lokalne (backend)

Wymagania: Node.js 20+, PostgreSQL 14+.

```bash
cd backend
cp .env.example .env        # uzupełnij DATABASE_URL i dane administratora
npm install
npm run migrate             # tworzy strukturę bazy
npm run create-admin        # tworzy konto administratora z ADMIN_USERNAME / ADMIN_PASSWORD
npm run dev
```

Sprawdzenie: `curl http://localhost:3000/api/health` zwraca `{"status":"ok"}`.
