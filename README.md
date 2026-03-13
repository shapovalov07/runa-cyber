# RUNA Cyber Club (Next.js)

Сайт перенесен на Next.js с маршрутизацией и серверным API для отправки заявок франшизы в Telegram.

## Запуск

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env.local` на основе `.env.example`:

```bash
cp .env.example .env.local
```

3. Заполнить переменные:

- `TELEGRAM_BOT_TOKEN` - токен Telegram-бота
- `TELEGRAM_CHAT_ID` - id чата/группы, куда отправлять заявки

4. Запустить dev-сервер:

```bash
npm run dev
```

Сайт: `http://localhost:3000`

## Telegram: как получить chat id

- Для личного чата: написать боту и получить id через `getUpdates`.
- Для группы: добавить бота в группу, отправить сообщение и получить id группы через `getUpdates` (обычно отрицательный id).

## Маршруты

- `/` - главная
- `/clubs` - наши клубы
- `/tournaments` - кибертурниры
- `/franchise` - франшизы + форма
- `/contacts` - контакты

## API

- `POST /api/franchise` - принимает JSON формы и отправляет сообщение в Telegram

## Docker (порт 3030)

1. Убедиться, что заполнен `.env.local`:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

2. Собрать и запустить:

```bash
docker compose up --build -d
```

3. Открыть сайт:

- `http://localhost:3030`

4. Остановить контейнер:

```bash
docker compose down
```
