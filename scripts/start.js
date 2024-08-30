require('dotenv').config();
const {TelegramClient, Api} = require('telegram');
const {StoreSession} = require('telegram/sessions');
const input = require('input');
const App = require('../src/App');

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const storeSession = new StoreSession(process.env.SESSION_NAME);
s
(async () => {
  const client = new TelegramClient(storeSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  const app = new App(client);
  await app.start();

  const peer = await input.text('Введите название чата: ');
  const queryCount = await input.text(
      'Введите сколько примерно сообщений из истории нужно получить: ');

  const users = await app.getUsersFromHistory(peer, queryCount);
  console.info(`Найдено ${users.length} пользователей`);
  const message = await input.text('Введите сообщение: ');

  const answer = await input.confirm(
      `${users.length} пользователям будет отправлено сообщение, продолжить?`);

  if (!answer) {
    return;
  }
  await app.sendMessageToUsers(users, message);
})();