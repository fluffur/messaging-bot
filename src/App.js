const input = require('input');
const {Api, TelegramClient} = require('telegram');
const {sleep} = require('telegram/Helpers');

class App {

  /**
   * @param {TelegramClient} client
   */
  constructor(client) {
    this.client = client;
  }

  async start() {
    await this.client.start({
      phoneNumber: async () => await input.text('Введите номер телефона: '),
      password: async () => await input.text('Введите пароль: '),
      phoneCode: async () => await input.text('Введите код подтверждения: '),
      onError: (err) => console.log(err),
    });
    this.client.session.save();
  }

  /**
   * @param {bigInt.BigInteger | string | number | Api.PeerUser | Api.PeerChat | Api.PeerChannel | Api.InputPeerEmpty | Api.InputPeerSelf | Api.InputPeerChat | Api.InputPeerUser | Api.InputPeerChannel | Api.InputPeerUserFromMessage | Api.InputPeerChannelFromMessage | Api.User | Api.Chat | Api.Channel | Api.UserEmpty | Api.ChatEmpty | Api.ChatForbidden | Api.ChannelForbidden | Api.UserFull | Api.messages.ChatFull | Api.ChatFull | Api.ChannelFull | Api.InputChannelEmpty | Api.InputChannel | Api.InputChannelFromMessage | Api.InputUserEmpty | Api.InputUserSelf | Api.InputUser | Api.InputUserFromMessage} peer
   * @param {number} messagesCount
   */
  async getUsersFromHistory(peer, messagesCount) {

    const queryCount = Math.ceil(messagesCount / 100);

    const usernameSet = new Set();

    let offsetId = 0;

    for (let i = 0; i < queryCount; i++) {
      const result = await this.client.invoke(
          new Api.messages.GetHistory({
            peer: peer,
            limit: 100,
            offsetId: offsetId,
          }),
      );
      const messages = result.messages;

      const users = result.users;

      offsetId = messages[messages.length - 1].id;

      for (const user of users) {
        const username = user.username;
        if (username !== undefined && username !== null) {
          usernameSet.add(user.username);
        }
      }

      const messagesCount = (i + 1) * 100;
      console.info(
          `Прочитано сообщений ${messagesCount}, Найдено пользователей ${usernameSet.size}`);

      await sleep(800);
    }
    return Array.from(usernameSet);
  }

  /**
   * @param {string[]} users
   * @param {string | Api.Message} message
   */
  async sendMessageToUsers(users, message) {
    await this.client.connect();
    for (const user of users) {
      await this.client.sendMessage(user, {message: message});
      console.info(`Пользователю ${user} отправлено сообщение: ${message}`);
      await sleep(1000);
    }
  }
}

module.exports = App;