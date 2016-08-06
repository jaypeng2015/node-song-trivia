const Botkit = require('botkit');
const messageCache = require('memory-cache');

const config = require('./config');
const logger = require('./logger');
const models = require('./models');

const ChatController = require('./controllers/chat-controller');
const KnowledgeController = require('./controllers/knowledge-controller');

class Scorpio {

  constructor() {
    const token = config.get('botkit:token');
    this.controller = Botkit.slackbot({ debug: false });
    this.bot = this.controller.spawn({ token }).startRTM();
    this.gameOperator = config.get('gameOperator');
    this.gameStarted = {};
    this.knowledgeController = new KnowledgeController(this.bot);
    this.chatController = new ChatController(this.bot);
  }

  isGameStarted(team, channel) {
    const teamStatus = this.gameStarted[team];
    return teamStatus ? teamStatus[channel] : false;
  }

  listen() {
    models.sequelize.sync({})
      .then(() => {
        this.controller.on('reaction_added', (bot, event) => {
          const { item, reaction } = event;
          if (item.type === 'message' && (reaction === 'musical_note' || reaction === 'art')) {
            const history = messageCache.get(item.ts);
            if (history) {
              const answers = history.split('-');
              if (answers.length === 1) {
                if (reaction === 'musical_note') {
                  this.knowledgeController.learnTrack(answers[0], '>').then();
                } else {
                  this.knowledgeController.learnArtist(answers[0], '>').then();
                }
              } else {
                // ignore answers like "artist - track" or "track - artist"
                // 'cause the bot don't know which is which, and people prefer one answer and that is faster
              }
            }
          }
        });

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
        ], (bot, message) => {
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
            bot.reply(message, 'Good game!');
          }
        });

        this.controller.hears(`${signals.guess}*`, [
          'ambient',
        ], (bot, message) => {
          if (this.isGameStarted(message.team, message.channel)) {
            messageCache.put(message.ts, message.text, 10000);
            logger.debug('message saved', message);
          }
        });

        this.controller.hears(`${signals.clue}*`, [
          'ambient',
        ], (bot, message) => {
          if (this.isGameStarted(message.team, message.channel)) {
            logger.info('It\'s time to guess!', message);
            this.knowledgeController.guess(message);
          }
        });

        this.controller.on([
          'direct_message',
          'direct_mention',
          'mention',
        ], (bot, message) => {
          this.chatController.response(message);
        });
      });
  }
}

module.exports = Scorpio;
