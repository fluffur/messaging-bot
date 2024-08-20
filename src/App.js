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
        const users = new Map();
        for (let i = 0; i < hundreds; i++) {
            const history = await this.api.getChatHistory(chat_id, access_hash, offsetId);
            for (const historyUser of history.users) {
                const msg = history.messages.find(message => message.from_id && message.from_id.user_id && message.from_id.user_id === historyUser.id);
                if (msg === undefined) {
                    continue;
                }
                users.set(historyUser.id, {
                    channel_access_hash: access_hash,
                    msg_id: msg.id,
                    user_id: historyUser.id,
                    channel_id: chat_id
                });
            }

            // console.log(users);
            console.log(users.size, i);

            offsetId = history.messages[history.messages.length - 1].id;
            await sleep(800);

        }
        return Array.from(users.entries());

    }


    async sendMessageToUsersFromChat(users, message) {
        for (const user of users) {
            const [user_id, params] = user;
            const result = await this.api.sendMessageFromChat({
                channel_access_hash: params.channel_access_hash,
                channel_id: params.channel_id,
                msg_id: params.msg_id,
                user_id: user_id,
                }, message
            );
            console.log(result);
            await sleep(1000);
        }
    }
}

module.exports = App;