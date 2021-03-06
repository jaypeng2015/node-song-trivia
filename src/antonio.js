const _ = require('lodash');
const Botkit = require('botkit');
const Brain = require('./components/brain');
const config = require('./config');
const logger = require('./lib/logger');
const messageCache = require('./lib/cache');
const models = require('./models');

class Antonio {
  constructor() {
    const token = config.get('botkit:token');
    const debug = config.get('botkit:debug');
    this.controller = Botkit.slackbot({ debug, retry: Infinity });
    this.bot = this.controller.spawn({ token }).startRTM();
    this.brain = new Brain(this.bot);
  }

  async listen() {
    await models.sequelize.sync({});
    this.controller.on('reaction_added', (bot, event) => (this.reactionAdded(event)));
    this.controller.hears(/^A new game has begun!/i, [
      'ambient',
    ], (bot, message) => {
      if (message.team && message.channel) {
        logger.info(`Game started by ${message.user} on channel ${message.channel} of ${message.team}`);
        bot.reply(message, `I am ready! <@${message.user}>`);
      }
    });

    this.controller.hears(/^The game is over!/, [
      'ambient',
    ], (bot, message) => this.heardGameStopped(message));

    this.controller.hears(/^&gt;(.+)/i, [
      'ambient',
    ], (bot, message) => this.heardGuess(message));

    this.controller.hears(/^Okay, here’s a clue: `([^-]+) - ([^(]+).*`$/i, [
      'ambient',
    ], (bot, message) => this.heardClue(message));

    this.controller.on([
      'direct_message',
      'direct_mention',
      'mention',
    ], (bot, message) => this.heardSomethingElse(message));
  }

  async reactionAdded(event) {
    const { item, reaction } = event;
    if (item.type === 'message' && (reaction === 'musical_note' || reaction === 'art')) {
      const history = await messageCache.get(item.ts);
      if (history) {
        const answers = _.compact([history.match[1], history.match[2]]);
        if (answers.length === 1) {
          if (reaction === 'musical_note') {
            const track = await this.brain.learnTrack(history, answers[0]);
            await this.brain.guessArtistByTrack(history, track);
          } else {
            await this.brain.learnArtist(history, answers[0]);
          }
        } else {
          // ignore answers like "artist - track" or "track - artist"
          // 'cause the bot don't know which is which, and people prefer one answer because that is faster
        }
      }
    }
  }

  heardGameStopped(message) {
    if (message.team && message.channel) {
      logger.info(`Game stopped by ${message.user} on channel ${message.channel} of ${message.team}`);
      this.bot.reply(message, 'Good game!');
    }
  }

  async heardGuess(message) {
    await messageCache.set(message.ts, message, '30s');
    logger.debug('message saved', message);
  }

  heardClue(message) {
    logger.info('It\'s time to guess!', message);
    this.brain.guessByClue(message);
  }

  heardSomethingElse(message) {
    this.brain.chat(message);
  }
}

module.exports = Antonio;
