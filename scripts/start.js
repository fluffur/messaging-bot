require('dotenv').config();
const {TelegramClient} = require('telegram');
const {StoreSession} = require('telegram/sessions');
const App = require('../src/App');

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const storeSession = new StoreSession(process.env.SESSION_NAME);

(async () => {
  const client = new TelegramClient(storeSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  const app = new App(client);
  await app.start();
  await app.startMessaging();

})();