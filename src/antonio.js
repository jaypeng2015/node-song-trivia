const Botkit = require('botkit');
const messageCache = require('memory-cache');

const config = require('./config');
const logger = require('./logger');
const models = require('./models');

const Brain = require('./lib/brain');

class Antonio {

  constructor() {
    const token = config.get('botkit:token');
    this.controller = Botkit.slackbot({ debug: false });
    this.bot = this.controller.spawn({ token }).startRTM();
    this.gameStarted = {};
    this.brain = new Brain(this.bot);
  }

  listen() {
    models.sequelize.sync({})
      .then(() => {
        this.controller.on('reaction_added', (bot, event) => (this.reactionAdded(event)));

        const signals = config.get('signals');
        this.controller.hears(`${signals.start}*`, [
          'ambient',
        ], (bot, message) => {
          if (message.team && message.channel) {
            const teamStatus = this.gameStarted[message.team];
            if (teamStatus) {
              teamStatus[message.channel] = true;
            } else {
              this.gameStarted[message.team] = {
                [message.channel]: true,
              };
            }
            logger.info(`Game started by ${message.user} on channel ${message.channel} of ${message.team}`);
            bot.reply(message, `I am ready! <@${message.user}>`);
          }
        });

        this.controller.hears(signals.end, [
          'ambient',
        ], (bot, message) => this.heardGameStarted(message));

        this.controller.hears(`${signals.guess}*`, [
          'ambient',
        ], (bot, message) => this.heardGuess(message));

        this.controller.hears(`${signals.clue}*`, [
          'ambient',
        ], (bot, message) => this.heardClue(message));

        this.controller.on([
          'direct_message',
          'direct_mention',
          'mention',
        ], (bot, message) => this.heardSomethingElse(message));
      });
  }

  isGameStarted(team, channel) {
    const teamStatus = this.gameStarted[team];
    return teamStatus ? teamStatus[channel] : false;
  }

  reactionAdded(event) {
    const { item, reaction } = event;
    if (item.type === 'message' && (reaction === 'musical_note' || reaction === 'art')) {
      const history = messageCache.get(item.ts);
      if (history) {
        const answers = history.text.split('-');
        if (answers.length === 1) {
          if (reaction === 'musical_note') {
            this.brain.learnTrack(history, answers[0])
              .then((track) => {
                this.brain.guessArtistByTrack(history, track);
              });
          } else {
            this.brain.learnArtist(history, answers[0]).end();
          }
        } else {
          // ignore answers like "artist - track" or "track - artist"
          // 'cause the bot don't know which is which, and people prefer one answer because that is faster
        }
      }
    }
  }

  heardGameStarted(message) {
    if (message.team && message.channel) {
      const teamStatus = this.gameStarted[message.team];
      if (teamStatus) {
        teamStatus[message.channel] = false;
      } else {
        this.gameStarted[message.team] = {
          [message.channel]: false,
        };
      }
      logger.info(`Game stopped by ${message.user} on channel ${message.channel} of ${message.team}`);
      this.bot.reply(message, 'Good game!');
    }
  }

  heardGuess(message) {
    if (this.isGameStarted(message.team, message.channel)) {
      messageCache.put(message.ts, message, 10000);
      logger.debug('message saved', message);
    }
  }

  heardClue(message) {
    if (this.isGameStarted(message.team, message.channel)) {
      logger.info('It\'s time to guess!', message);
      this.brain.guessByClue(message);
    }
  }

  heardSomethingElse(message) {
    this.brain.chat(message);
  }
}

module.exports = Antonio;
