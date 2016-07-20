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
    this.gameStarted = false;
    this.knowledgeController = new KnowledgeController(this.bot);
    this.chatController = new ChatController(this.bot);
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
          'direct_message',
          'message_received',
        ], (bot, message) => {
          this.gameStarted = true;
          logger.info(`Game started by ${message.user}`);
          bot.reply(message, `I am ready! <@${message.user}>`);
        });

        this.controller.hears(signals.end, [
          'direct_message',
          'message_received',
        ], (bot, message) => {
          this.gameStarted = false;
          logger.info(`Game stopped by ${message.user}`);
          bot.reply(message, 'Good game!');
        });

        this.controller.hears(`${signals.guess}*`, [
          'direct_message',
          'message_received',
        ], (bot, message) => {
          // if (this.gameStarted) {
          messageCache.put(message.ts, message.text, 10000);
          logger.debug('message saved', message);
          // }
        });

        this.controller.hears(`${signals.clue}*`, [
          'direct_message',
          'message_received',
        ], (bot, message) => {
          logger.info('It\'s time to guess!', message);
          // if (this.gameStarted) {
          this.knowledgeController.guess(message);
          // }
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
