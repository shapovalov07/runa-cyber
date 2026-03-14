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

4. Учетные данные админки хранятся в `data/cms/admin.json` в виде массива пользователей `users`:

- `login` - логин администратора
- `password` - пароль администратора
- `firstName` - имя администратора
- `lastName` - фамилия администратора

5. Запустить dev-сервер:

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
- `/admin` - админка (публикация новостей и управление галереей)

## API

- `POST /api/franchise` - принимает JSON формы и отправляет сообщение в Telegram
- `POST /api/admin/login` - проверка логина и пароля администратора
- `GET /api/news` - получить список новостей
- `POST /api/news` - создать новость (нужны `x-admin-login` и `x-admin-password` или поля `login/password` в `multipart/form-data`)
- `DELETE /api/news/:id` - удалить новость (нужны заголовки `x-admin-login` и `x-admin-password`)
- `GET /api/gallery` - получить фото галереи
- `POST /api/gallery` - добавить фото (форма `multipart/form-data`, поля `login` и `password`)
- `DELETE /api/gallery/:id` - удалить фото (нужны заголовки `x-admin-login` и `x-admin-password`)

## CMS хранилище

- Новости: `data/cms/news.json`
- Галерея: `data/cms/gallery.json`
- Админ-доступ: `data/cms/admin.json`
- Загруженные фото новостей: `public/uploads/news/`
- Загруженные фото галереи: `public/uploads/gallery/`

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
