require('dotenv').config();
const path = require("node:path");
const Auth = require("../src/Servies/Auth");
const API = require("../src/Servies/API");
const App = require("../src/App");

(async () => {

    const api = new API(process.env.API_ID, process.env.API_HASH, path.resolve(__dirname, '../data/1.json'));
    const auth = new Auth(api);

    const app = new App(api, auth);
    await app.checkAuth(process.env.PHONE_NUMBER);

    await app.getHistory(path.join(__dirname, '../history.json'), 50);

})();


