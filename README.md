# Fitly (Body ID) — MVP

Мобильное приложение с рекомендацией размера одежды по профилю тела пользователя ("Body ID").
Полное ТЗ и история решений — в [`../FITLY_TZ.md`](../FITLY_TZ.md).

## Запуск

1. Установи зависимости:

   ```bash
   npm install
   ```

2. Скопируй `.env.example` в `.env` и заполни ключами своего Supabase-проекта:

   ```bash
   cp .env.example .env
   ```

3. Запусти приложение:

   ```bash
   npx expo start
   ```

Открой в Expo Go на телефоне (отсканировать QR) или в эмуляторе.

## Стек
- React Native + Expo Router, TypeScript
- Supabase (auth, Postgres) — клиент в `lib/supabase.ts`
- MediaPipe Pose (добавится на этапе фото-скана) — см. `FITLY_TZ.md`, Этап 4
