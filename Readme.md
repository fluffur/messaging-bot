# Messaging Bot

## Перед запуском

### Регистрация
Зарегестрируйте приложение на [этом сайте](https://my.telegram.org/auth).
Скопируйте оттуда `api_id` и `api_hash`.
### Заполнение данных 
В корневой папкк проекта создайте файл `.env` со следующими данными:
```dotenv
API_ID=
API_HASH=
PHONE_NUMBER=
```
Заполните пустые места вашими `api_id`, `api_hash` и номером телефона, который вы вводили при регистрации.    
## Запуск
```shell
docker compose up -d --build
docker compose exec app sh

/usr/src/app # npm install
/usr/src/app # npm run start 

> start
> node scripts/start.js

Введите название чата, из которого нужно отправить сообщения пользователям: @phpgeeks
Введите количество сотен сообщений для получения из истории чата: 500
...
```