const MTProto = require('@mtproto/core');
const {sleep} = require('@mtproto/core/src/utils/common');

class API {
    /**
     * @param {string} api_id
     * @param {string} api_hash
     * @param {string} storageFile
     * */
    constructor(api_id, api_hash, storageFile) {
        this.mtproto = new MTProto({
            api_id: api_id,
            api_hash: api_hash,
            storageOptions: {
                path: storageFile,
            },
        });
    }

    async call(method, params, options = {}) {
        try {
            return await this.mtproto.call(method, params, options);
        } catch (error) {
            console.log(`${method} error:`, error);

            const {error_code, error_message} = error;

            if (error_code === 420) {
                const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
                const ms = seconds * 1000;

                await sleep(ms);

                return this.call(method, params, options);
            }

            if (error_code === 303) {
                const [type, dcIdAsString] = error_message.split('_MIGRATE_');

                const dcId = Number(dcIdAsString);

                // If auth.sendCode call on incorrect DC need change default DC, because
                // call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
                if (type === 'PHONE') {
                    await this.mtproto.setDefaultDc(dcId);
                } else {
                    Object.assign(options, {dcId});
                }

                return this.call(method, params, options);
            }

            return Promise.reject(error);
        }
    }

    async getUser(userId,) {
        try {
            return await this.call('users.getUsers', {
                id: [
                    {
                        _: 'inputUser',
                        user_id: userId,
                        access_hash: 0, // Access hash is optional but recommended for more details
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    }

    async resolvePublicChat(username) {
        const result = await this.call('contacts.resolveUsername', {
            username: username.replace('@', ''), // убираем '@'
        });
        const chat = result.chats[0]; // Первый найденный результат

        return {chat_id: chat.id, access_hash: chat.access_hash};
    }

    async getChatHistory(chat_id, access_hash, offset_id) {
        try {
            return await this.call('messages.getHistory', {
                peer: {
                    _: 'inputPeerChannel',
                    channel_id: chat_id,
                    access_hash: access_hash
                },
                limit: 100,
                offset_id: offset_id
            });
        } catch (error) {
            console.error('Error fetching chat history:', error);
            return null;
        }
    }


    async sendMessageFromChat({channel_id, msg_id, user_id, channel_access_hash}, message) {
        try {
            return await this.call('messages.sendMessage', {
                clear_draft: true,
                peer: {
                    _: 'inputPeerUserFromMessage',
                    peer: {
                        _: 'inputPeerChannel', // Assuming the chat is a group or channel
                        channel_id: channel_id,
                        access_hash: channel_access_hash,
                    },
                    msg_id: msg_id,
                    user_id: user_id,
                },
                message: message,
                random_id: this.generateRandomId(),
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    generateRandomId() {
        return Math.ceil(Math.random() * 0xffffff) + Math.ceil(Math.random() * 0xffffff);
    }
}

module.exports = API;