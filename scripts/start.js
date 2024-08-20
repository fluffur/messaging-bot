require('dotenv').config();
const path = require("node:path");
const Auth = require("../src/Servies/Auth");
const API = require("../src/Servies/API");
const App = require("../src/App");
const fs = require("node:fs").promises;
const prompt = require("prompt-sync")({sigint: true});

(async () => {
    console.time('Время выполнения');

    const api = new API(process.env.API_ID, process.env.API_HASH, path.resolve(__dirname, '../data/1.json'));
    const auth = new Auth(api);

    const app = new App(api, auth);
    await app.checkAuth(process.env.PHONE_NUMBER);

    const chatName = prompt(
        'Введите название чата, из которого нужно отправить сообщения пользователям: '
    )
    const hundreds = prompt('Введите количество сотен сообщений для получения из истории чата: ')
    const users = await app.getUsersFromHistory(chatName, parseInt(hundreds));
    await fs.writeFile(path.join(__dirname, '../users.json'), JSON.stringify(users));

    // TODO: Протестировать отправку сообщений
    // const message = prompt('Введите сообщение, которое вы хотите отправить пользователям: ');
    // await app.sendMessageToUsersFromChat(users, message)

    console.timeEnd('Время выполнения');

})();


