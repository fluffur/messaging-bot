class Auth {
    /**
     * @param {API} api
     * */
    constructor(api) {
        this.api = api;
    }

    async getUser() {
        try {
            return await this.api.call('users.getFullUser', {
                id: {
                    _: 'inputUserSelf',
                },
            });
        } catch (error) {
            return null;
        }
    }

    sendCode(phone) {
        return this.api.call('auth.sendCode', {
            phone_number: phone,
            settings: {
                _: 'codeSettings',
            },
        });
    }

    signIn({ code, phone, phone_code_hash }) {
        return this.api.call('auth.signIn', {
            phone_code: code,
            phone_number: phone,
            phone_code_hash: phone_code_hash,
        });
    }

    signUp({ phone, phone_code_hash }) {
        return this.api.call('auth.signUp', {
            phone_number: phone,
            phone_code_hash: phone_code_hash,
            first_name: 'MTProto',
            last_name: 'Core',
        });
    }
}

module.exports = Auth;