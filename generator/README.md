# Generator danych (emulator czujnika)

Program konsolowy w Node.js (20+, bez zależności), który wysyła wyniki pomiarów do aplikacji przez `POST /api/measurements` z kluczem czujnika w nagłówku `X-API-Key`.

Klucz API nie jest zapisany w kodzie: podaje się go parametrem `--key` albo zmienną środowiskową `ZAI_API_KEY`. Klucz dostaje administrator jednorazowo przy rejestracji czujnika w aplikacji.

## Parametry

| Parametr | Opis | Domyślnie |
| --- | --- | --- |
| `--api` / `ZAI_API_URL` | adres aplikacji | – |
| `--key` / `ZAI_API_KEY` | klucz API czujnika | – |
| `--mode` | `history` (wyniki z przeszłości) lub `live` (bieżące wyniki w stałych odstępach) | `history` |
| `--count` | liczba wyników | 24 (history), bez końca (live) |
| `--interval` | odstęp między wynikami w sekundach | 3600 (history), 10 (live) |
| `--end` | history: czas ostatniego wyniku (ISO 8601) | teraz |
| `--source` | `random`, `walk`, `sine` lub `open-meteo` | `random` |
| `--min`, `--max` | przedział dla `random` i `walk` | 0, 100 |
| `--step` | maksymalny krok dla `walk` | 1 |
| `--offset`, `--amplitude`, `--period`, `--noise` | sinusoida dla `sine` (okres w sekundach) | 50, 20, 86400, 0 |
| `--lat`, `--lon`, `--variable` | lokalizacja i zmienna dla `open-meteo` | Warszawa, `temperature_2m` |
| `--decimals` | miejsca po przecinku | 2 |
| `--dry-run` | tylko wypisuje wartości, nic nie wysyła | – |

Zmienne `open-meteo`: `temperature_2m`, `relative_humidity_2m`, `pressure_msl`, `surface_pressure`, `wind_speed_10m`, `precipitation`, `cloud_cover`. Dane pochodzą z [Open-Meteo](https://open-meteo.com/) (bez klucza): w trybie `history` są to odczyty godzinowe z ostatnich dni, w trybie `live` bieżący odczyt.

## Przykłady

```bash
# 48 godzinowych wyników z przeszłości z rzeczywistej temperatury w Warszawie
ZAI_API_KEY=... node zai-generator.mjs --api https://moja-app.onrender.com --source open-meteo --count 48

# wynik co 30 s, błądzenie losowe w przedziale 15–25
node zai-generator.mjs --api http://localhost:3000 --key ... --mode live --interval 30 --source walk --min 15 --max 25

# sinusoida z szumem, 100 wyników co 15 minut
node zai-generator.mjs --api http://localhost:3000 --key ... --source sine --count 100 --interval 900 --noise 1.5
```

Wynik odrzucony przez serwer (np. wartość spoza przedziału serii) jest wypisywany jako `[REJECTED]` z komunikatem serwera. Odmowa z kodem 401 (zły lub wyrejestrowany klucz) przerywa pracę generatora.
