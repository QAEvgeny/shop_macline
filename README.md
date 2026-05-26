# shop_macline

MacLine - учебная архитектура интернет-магазина техники Apple.

Проект уже состоит из двух частей:

- frontend: витрина магазина в файлах `index.html`, `styles.css`, `app.js`, `api.js`, `config.js`;
- backend: сервер на Python + FastAPI + SQLite в папке `backend`.

Простыми словами: frontend показывает магазин покупателю, backend хранит товары
и принимает заказы.

## Что уже работает

- каталог товаров с поиском, фильтрами и сортировкой;
- реальные product-фото в карточках товаров с запасной CSS-иконкой;
- избранное и корзина с сохранением в браузере;
- оформление заявки;
- API товаров: `GET /api/products`;
- API создания заказа: `POST /api/orders`;
- SQLite-база `backend/shop.db`, которая создается автоматически;
- сохранение заказов в базу;
- просмотр заказов через `GET /api/admin/orders`;
- заготовка для Telegram/email-уведомлений через переменные окружения.

## Как запустить

Откройте PowerShell в папке проекта:

```powershell
cd C:\projects\mac_line\shop_macline
```

Установите зависимости:

```powershell
python -m pip install -r backend\requirements.txt
```

Запустите сервер:

```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Откройте сайт:

```text
http://127.0.0.1:8000
```

Документация API откроется здесь:

```text
http://127.0.0.1:8000/docs
```

Проверка, что backend жив:

```text
http://127.0.0.1:8000/api/health
```

## Что происходит при первом запуске

FastAPI запускает backend.

SQLite создает файл базы:

```text
backend/shop.db
```

Если товаров еще нет, backend добавляет стартовый каталог из файла:

```text
backend/seed_data.py
```

После этого сайт берет товары уже через API, а не из демо-массива в браузере.

## Как проверить заказ

1. Откройте `http://127.0.0.1:8000`.
2. Добавьте товар в корзину.
3. Оформите заявку.
4. Откройте:

```text
http://127.0.0.1:8000/api/admin/orders
```

Там появится созданный заказ.

## Telegram-уведомления

Секреты не хранятся в браузере. Это правильно: Telegram-токен должен жить на
backend.

Перед запуском сервера можно задать переменные:

```powershell
$env:TELEGRAM_BOT_TOKEN="ваш_token"
$env:TELEGRAM_CHAT_ID="ваш_chat_id"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Если переменные не заданы, заказ просто сохранится в SQLite.

## Email-уведомления

Для SMTP-отправки можно задать:

```powershell
$env:SMTP_HOST="smtp.example.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="user@example.com"
$env:SMTP_PASSWORD="password"
$env:SMTP_FROM="orders@example.com"
$env:ORDER_EMAIL_TO="manager@example.com"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Если SMTP не настроен, заказ все равно сохранится в базе.

## Важные файлы

- `backend/main.py` - входная точка FastAPI, API-роуты и отдача frontend;
- `backend/database.py` - создание SQLite-базы, товары, заказы;
- `backend/schemas.py` - описание данных API;
- `backend/services/notifications.py` - Telegram/email-уведомления;
- `backend/seed_data.py` - стартовые товары;
- `config.js` - frontend-настройка API.

## Следующие шаги

1. Добавить простую админку для просмотра заказов в браузере.
2. Сделать редактирование товаров через API.
3. Добавить авторизацию администратора.
4. Перейти с SQLite на PostgreSQL перед публичным запуском.
5. Выложить backend и frontend на хостинг.
6. Подключить домен и HTTPS.
7. Подключить оплату и реальные правила доставки.
