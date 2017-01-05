const logger = require('../../../lib/logger');

const chat = (bot, message) => {
  logger.debug('Someone said something to me', message);
  const { text, user } = message;
  if ((/h(i|ello)/i).test(text)) {
    bot.reply(message, `Hi, <@${user}>`);
  } else if ((/help/i).test(text)) {
    bot.reply(message, '*_I can only beat other players if I know more than them._* \n' +
      'For each other one\'s guess, spotifyquizbot will give a reaction: \n' +
      ' - :art: means the point for guessing the *_artist_* of the current song is taken, I will just learn this new artist\n' +
      ' - :musical_note: means the point for guessing the *_title_* of the current song is taken, I will learn this song and try to guess it\'s artist\n' +
      ' - :x: means it was all wrong, and I will do thing for it\n' +
      'Here is some thing else you can help me to learn more: \n' +
      ' - *_scrape billboard_* - e.g. _hey @antonio, scrape billboard!_\n' +
      'Have fun!');
  } else {
    bot.reply(message, 'Sorry I can\'t understand this.');
  }
};

module.exports = {
  chat,
};
