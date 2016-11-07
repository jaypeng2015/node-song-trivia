const _ = require('lodash');

const logger = require('../../../lib/logger');
const models = require('../../../models');
const signals = require('../../../config').get('signals');
const webScrapper = require('../../../web-scrapper');

const Artist = models.Artist;
const Track = models.Track;

const learnArtist = (bot, message, answers) => {
  const name = _.trim(_.trimStart(_.toUpper(_.trim(answers)), signals.guess));
  return Artist.findOne({ where: { name: { $ilike: name } } })
    .then((found) => {
      if (!found) {
        return Artist.create({ name })
          .then((newArtist) => {
            logger.info(`Leant a new artist: ${newArtist.name}`);
            bot.reply(message, `Leant a new artist: ${newArtist.name}`);
            return newArtist;
          });
      }

      return found;
    });
};

const learnTrack = (bot, message, answers) => {
  const name = _.trim(_.trimStart(_.toUpper(_.trim(answers)), signals.guess));
  return Track.findOne({ where: { name: { $ilike: name } } })
    .then((found) => {
      if (!found) {
        return Track.create({ name })
          .then((newTrack) => {
            logger.info(`Leant a new track: ${newTrack.name}`);
            bot.reply(message, `Leant a new track: ${newTrack.name}`);
            return newTrack;
          });
      }

      return found;
    });
};


const learnPair = (bot, message, record) => {
  const { artist, track } = record;
  return Track.findOne({ where: { name: { $ilike: track } } })
    .then((found) => {
      if (found) {
        logger.info(`I knew this track: ${track}`);
        return found;
      }

      logger.info(`Leant a new track: ${track}`, record);
      bot.reply(message, `Leant a new track: ${track}`);
      return Track.create({ name: track });
    })
    .then((trackInstance) => {
      if (_.isEmpty(artist)) {
        logger.info(`no artist for this track: ${trackInstance.name}`);
        return { trackInstance, artistInstance: null };
      }

      return Artist.findOne({ where: { name: { $ilike: artist } } })
        .then((found) => {
          if (found) {
            logger.info(`I knew this artist: ${artist}`);
            return found;
          }

          logger.info(`Leant a new artist: ${artist}`);
          bot.reply(message, `Leant a new artist: ${artist}`);
          return Artist.create({ name: artist });
        })
        .then((artistInstance) => {
          return { trackInstance, artistInstance };
        });
    })
    .then((result) => {
      const { trackInstance, artistInstance } = result;
      if (artistInstance) {
        return trackInstance.getArtists({ where: { name: { ilike: artistInstance.name } } })
          .then((artists) => {
            if (_.isEmpty(artists)) {
              return trackInstance.addArtist(artistInstance)
                .then(() => {
                  logger.info('Added new relationship', record);
                  bot.reply(message, `Added new relationship: ${artist} => ${track}`);
                  return record;
                });
            }

            return record;
          });
      }

      logger.info('No artist info for this track', record);
      return record;
    });
};

const scrapeBillboard = (bot, message) => {
  bot.reply(message, 'Start scraping billboard.');
  return webScrapper.scrapeBillboard()
    .then((records) => {
      const promises = records.map((record) => () => learnPair(bot, message, record));

      const promise = Promise.resolve();
      promises.reduce((pre, current) => {
        return pre.then(current);
      }, promise)
        .then(() => {
          bot.reply(message, `Finished scraping billboard. <@${message.user}>`);
        })
        .catch((err) => {
          logger.error('Something went wrong while studying', err);
          bot.reply(message, `Something went wrong while studying. <@${message.user}>`);
        });
    })
    .catch((err) => {
      logger.error('Something went wrong while scrapping billboard', err);
      bot.reply(message, `Something went wrong while scrapping billboard. <@${message.user}>`);
    });
};

module.exports = {
  scrapeBillboard,
  learnArtist,
  learnTrack,
};
