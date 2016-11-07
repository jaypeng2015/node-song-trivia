const logger = require('../../../lib/logger');

const chat = (bot, message) => {
  logger.debug('Someone said something to me', message);
  const { text, user } = message;
  if ((/h(i|ello)/i).test(text)) {
    bot.reply(message, `Hi, <@${user}>`);
  } else {
    bot.reply(message, 'Sorry I can\'t understand this.');
  }
};

module.exports = {
  chat,
};
