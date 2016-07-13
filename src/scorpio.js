const Botkit = require('botkit');

const config = require('./config');
const logger = require('./logger');
const models = require('./models');

class Scorpio {

  constructor() {
    const token = config.get('botkit:token');
    this.controller = Botkit.slackbot({ debug: true });
    this.bot = this.controller.spawn({ token }).startRTM();
    this.gameOperator = config.get('gameOperator');
    this.gameStarted = false;
  }

  listen() {
    models.sequelize.sync({})
      .then(() => {
        this.controller.on('reaction_added', (bot, event) => {
          logger.info(event);
        });

        this.controller.hears('A new game has begun! May the most musically-knowledgeable win!', [
          'direct_message',
          'message_received',
        ], (bot, message) => {
          this.gameStarted = true;
          bot.reply(message, `I am ready! <@${message.user}>`);
        });

        this.controller.hears('The game is over!', [
          'direct_message',
          'message_received',
        ], (bot, message) => {
          this.gameStarted = false;
          bot.reply(message, 'I am done!');
        });
      });
  }
}

module.exports = Scorpio;
