# Messaging Bot

## Перед запуском

### Регистрация
Зарегестрируйте приложение на [официальном сайте Telegram](https://my.telegram.org/auth).
Скопируйте оттуда `api_id` и `api_hash`.
### Заполнение данных 
В корневой папкк проекта создайте файл `.env` со следующими данными:
```dotenv
API_ID=
API_HASH=
SESSION_NAME=messaging-session
```
Заполните пустые места вашими `api_id`, `api_hash` и номером телефона, который вы вводили при регистрации.    
## Запуск
```shell
docker compose up -d --build
docker compose run app sh

/usr/src/app # npm install
/usr/src/app # npm run start 

> start
> node scripts/start.js

[2024-08-31T01:57:26.398] [INFO] - [Running gramJS version 2.24.10]
[2024-08-31T01:57:26.412] [INFO] - [Connecting to 149.154.167.50:80/TCPFull...]
[2024-08-31T01:57:26.562] [INFO] - [Connection to 149.154.167.50:80/TCPFull complete!]
[2024-08-31T01:57:26.570] [INFO] - [Using LAYER 184 for initial connect]
? Введите название чата:  phpgeeks
? Введите сколько примерно сообщений из истории нужно получить:  100
Прочитано сообщений 100, Найдено пользователей 24
? Введите сообщение:  hi
? 24 пользователям будет отправлено сообщение, продолжить? No

```