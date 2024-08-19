const {sleep} = require("@mtproto/core/src/utils/common");
const prompt = require("prompt-sync")({sigint: true});

class App {
    /**
     * @param {API} api
     * @param {Auth} auth
     * */
    constructor(api, auth) {
        this.api = api;
        this.auth = auth;
    }

    async checkAuth(phone) {
        const user = await this.auth.getUser();
        if (!user) {

            const {phone_code_hash} = await this.auth.sendCode(phone)
            const code = prompt('Enter the code you received: ');

            try {
                const signInResult = await this.auth.signIn({
                    code,
                    phone,
                    phone_code_hash,
                });

                if (signInResult._ === 'auth.authorizationSignUpRequired') {
                    await this.auth.signUp({
                        phone,
                        phone_code_hash,
                    });
                }
            } catch (error) {
                if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
                    console.log(`error:`, error);
                }
            }
        }
    }

    async getUsersFromHistory(chatName, hundreds = 1) {

        const data = await this.api.resolvePublicChat(chatName);
        if (!data) {
            console.error('Chat not found', chatName)
            return;
        }

        const {chat_id, access_hash} = data;
        console.log(`Chat ID: ${chat_id}, Access Hash: ${access_hash}`);


        let offsetId = 0;
        const users = new Set();
        for (let i = 0; i < hundreds; i++) {
            const history = await this.api.getChatHistory(chat_id, access_hash, offsetId);

            const messages = history.messages;

            await console.log(users.size, i)
            if (messages.length <= 0) {
                break;
            }

            const hundredUsers = messages
                .filter(message => message.from_id && message.from_id.user_id)
                .map(message => message.from_id.user_id);

            users.add(...hundredUsers);

            offsetId = messages[messages.length - 1].id;
            await sleep(550);
        }
        return Array.from(users);
    }

    async sendMessageToUsers(users, message) {
        for (const userId of users) {
            await this.api.sendMessage(userId, message);
            await sleep(1000);
        }
    }
}

module.exports = App;