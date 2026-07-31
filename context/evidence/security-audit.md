# Audyt zależności — 31 lipca 2026

Starter został zaktualizowany w granicach zaplanowanych wersji głównych:

- Astro `6.3.1` → `6.4.8`;
- Supabase CLI → `2.111.0`;
- Wrangler → `4.118.0`;
- lockfile odświeżony przez `npm update` i `npm install`.

Liczba zgłoszeń `npm audit` spadła z 22 (w tym 1 critical) do 11 bez critical.
Produkcyjny `npm audit --omit=dev` raportuje cztery zależne zgłoszenia w Astro,
esbuild i sharp. Automatyczna poprawka wymaga Astro 7.1.6 i adaptera Cloudflare
14, co jest świadomie poza sprintem: plan wymaga pozostania na Astro 6.

Przed aktualizacją do Astro 7 należy wykonać osobny upgrade z testami adaptera
Cloudflare. W MVP nie są używane view transitions, dynamiczne nazwy atrybutów
ani upload/przetwarzanie niezaufanych obrazów, co ogranicza ekspozycję na
zgłoszone ścieżki XSS/libvips, ale nie zastępuje przyszłej aktualizacji.
