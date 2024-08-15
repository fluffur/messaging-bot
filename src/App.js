const fs = require("node:fs").promises;
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

    async getHistory(outputFile, hundreds = 1) {
        const chatName = prompt('Write chat name: ')
        const data = await this.api.resolvePublicChat(chatName);
        if (!data) {
            console.error('Chat not found', chatName)
            return;
        }

        const {chat_id, access_hash} = data;
        console.log(`Chat ID: ${chat_id}, Access Hash: ${access_hash}`);

        await fs.access(outputFile, fs.constants.R_OK);

        let offsetId = 0;
        for (let i = 0; i < hundreds; i++) {
            const history = await this.api.getChatHistory(chat_id, access_hash, offsetId);
            const messages = history.messages;
            console.log(messages);

            if (messages.length <= 0) {
                break;
            }

            const extractedMessages = messages.map(message => ({
                id: message.id,
                from_id: message.from_id,
                message: message.message,
                date: message.date
            }));

            console.log(extractedMessages);
            let file;
            file = await fs.readFile(outputFile);
            const data = JSON.parse(file.toString());
            data.push(...extractedMessages);
            await fs.writeFile(outputFile, JSON.stringify(data));

            offsetId = messages[messages.length - 1].id;
        }
        console.log('Done');
    }
}

module.exports = App;