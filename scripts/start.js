require('dotenv').config();
const path = require("node:path");
const Auth = require("../src/Servies/Auth");
const API = require("../src/Servies/API");
const App = require("../src/App");
const fs = require("node:fs").promises;
const prompt = require("prompt-sync")({sigint: true});

(async () => {

    const api = new API(process.env.API_ID, process.env.API_HASH, path.resolve(__dirname, '../data/1.json'));
    const auth = new Auth(api);

    const app = new App(api, auth);
    await app.checkAuth(process.env.PHONE_NUMBER);

    console.time('Execution Time');
    const chatName = prompt('Write chat name: ')
    const users = await app.getUsersFromHistory(chatName, 5000);
    console.timeEnd('Execution Time');
    console.log('Users found: ', users);
    await fs.writeFile(path.join(__dirname, '../users.json'), JSON.stringify(users));

    // const message = prompt('Type message: ');
    // await app.sendMessageToUsers(users, message);
})();


