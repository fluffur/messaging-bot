const path = require('path');
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


    async resolvePublicChat(username) {
        try {
            const result = await this.call('contacts.resolveUsername', {
                username: username.replace('@', ''), // убираем '@'
            });
            const chat = result.chats[0]; // Первый найденный результат
            console.log('Chat ID:', chat.id);
            console.log('Access Hash:', chat.access_hash);
            return {chat_id: chat.id, access_hash: chat.access_hash};
        } catch (error) {
            console.error('Error resolving public chat:', error);
            return null;
        }
    }

    async getChatHistory(chat_id, access_hash, offsetId) {
        try {
            return await this.call('messages.getHistory', {
                peer: {
                    _: 'inputPeerChannel',
                    channel_id: chat_id,
                    access_hash: access_hash
                },
                limit: 100,
                offset_id: offsetId
            });
        } catch (error) {
            console.error('Error fetching chat history:', error);
            return null;
        }
    }
}

module.exports = API;