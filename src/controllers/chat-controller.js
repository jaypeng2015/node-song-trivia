const logger = require('../logger');

class MentionController {

  constructor(bot) {
    this.bot = bot;
  }

  response(message) {
    logger.info('Someone said something to me', message);
    const { text, user } = message;
    if ((/h(i|ello)/i).test(text)) {
      this.bot.reply(message, `Hi, <@${user}>`);
    }
  }
}

module.exports = MentionController;
