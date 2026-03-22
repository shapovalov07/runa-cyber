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
  - можно указать несколько id через запятую, пробел, `;` или перенос строки
  - пример: `TELEGRAM_CHAT_ID=-1001111111111,-1002222222222,123456789`

4. Учетные данные админки хранятся в `data/cms/admin.json` в виде массива пользователей `users`:

- `login` - логин администратора
- `password` - пароль администратора
- `firstName` - имя администратора
- `lastName` - фамилия администратора
- `role` - роль пользователя (`owner` или `admin`)

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
- `PATCH /api/admin/profile` - обновить профиль текущего пользователя
- `GET /api/admin/users` - список пользователей админки (только `owner`)
- `POST /api/admin/users` - создать пользователя админки (только `owner`)
- `PATCH /api/admin/users/:login` - сбросить пароль администратора или сменить пароль своего owner-аккаунта (только `owner`)
- `DELETE /api/admin/users/:login` - удалить пользователя админки (только `owner`)
- `GET /api/admin/history` - история изменений администраторов (только `owner`)
- `GET /api/news` - получить список новостей
- `POST /api/news` - создать новость (нужны `x-admin-login` и `x-admin-password` или поля `login/password` в `multipart/form-data`)
- `DELETE /api/news/:id` - удалить новость (нужны заголовки `x-admin-login` и `x-admin-password`)
- `GET /api/gallery` - получить фото галереи (опционально `?section=home|clubs|tournaments`)
- `POST /api/gallery` - добавить фото (форма `multipart/form-data`, поля `login`, `password`, `section`)
- `DELETE /api/gallery/:id` - удалить фото (нужны заголовки `x-admin-login` и `x-admin-password`)
- `GET /api/tournament-events` - получить список мероприятий раздела «Кибертурниры»
- `POST /api/tournament-events` - создать мероприятие (доступно `admin` и `owner`)
- `DELETE /api/tournament-events/:id` - удалить мероприятие (доступно `admin` и `owner`)

## CMS хранилище

- Новости: `data/cms/news.json`
- Галерея: `data/cms/gallery.json`
- Мероприятия кибертурниров: `data/cms/tournament-events.json`
- Админ-доступ + роли + история действий: `data/cms/admin.json`
- Загруженные фото новостей: `public/uploads/news/`
- Загруженные фото галереи: `public/uploads/gallery/`
- Загруженные фото мероприятий: `public/uploads/tournament-events/`

## Docker локально (порт 3030)

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

## Docker на сервере через Nginx Proxy Manager

Используйте отдельный файл `docker-compose.server.yml`, если контейнер должен работать за Nginx Proxy Manager во внешней Docker-сети `proxy`.

Серверный контейнер должен обновляться из заранее собранного Docker image, а не пересобираться на сервере. Это позволяет:

- обновлять код отдельно от CMS-данных
- не трогать новости, мероприятия и загруженные фото
- не зависеть от тяжелой сборки на слабом сервере

Данные админки хранятся на сервере отдельно и не попадают в git:

- `./.runtime/server-cms` -> `/app/data/cms`
- `./.runtime/server-uploads` -> `/app/public/uploads`

При деплое контейнер пересоздается, но эти папки остаются на сервере, поэтому контент из админки не теряется.

### Первый запуск на сервере

Нужны:

- заполненный `.env.local` на сервере
- папка проекта на сервере
- Docker и внешняя сеть `proxy`

Если раньше сервер уже работал через `./.runtime/local-cms` и `./.runtime/local-uploads`, новый deploy-скрипт сам перенесет эти данные в `./.runtime/server-cms` и `./.runtime/server-uploads` при первом запуске.

### Обычный деплой с локальной машины на сервер

На локальной машине запустите:

```bash
DEPLOY_HOST=root@45.11.92.25 \
DEPLOY_PATH=/root/runa-cyber/runa-cyber \
npm run deploy:server
```

Опционально:

```bash
DEPLOY_PORT=22
DEPLOY_IMAGE=runa-cyber-club:prod
DEPLOY_PLATFORM=linux/amd64
```

Что делает `npm run deploy:server`:

1. Собирает Docker image локально.
2. Отправляет его на сервер через `docker load`.
3. Создает сеть `proxy`, если ее еще нет.
4. Поднимает контейнер через `docker-compose.server.yml` без сборки на сервере.
5. Сохраняет серверные новости, мероприятия и загруженные фото в `./.runtime/server-*`.

### Ручной запуск на сервере

Если image уже загружен на сервер, контейнер можно перезапустить вручную:

```bash
DOCKER_IMAGE=runa-cyber-club:prod docker compose -f docker-compose.server.yml up -d --no-build --force-recreate --remove-orphans
```

В этом режиме контейнер не публикует порт наружу через `ports`, а только открывает `3030` внутри Docker-сети через `expose`, чтобы к нему мог подключаться Nginx Proxy Manager.

В Nginx Proxy Manager в качестве `Forward Hostname / IP` укажите `runa-cyber-club`, а в качестве `Forward Port` укажите `3030`.
