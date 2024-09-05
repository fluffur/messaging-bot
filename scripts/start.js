require('dotenv').config();
const {TelegramClient} = require('telegram');
const {StoreSession} = require('telegram/sessions');
const CliApp = require('../src/App');

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const sessionName = process.env.SESSION_NAME;
const storeSession = new StoreSession(sessionName);

(async () => {
  const client = new TelegramClient(storeSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  const app = new CliApp(client);
  await app.logIn();
  await app.startMessaging();

})();