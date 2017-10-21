const _ = require('lodash');
const logger = require('../../../lib/logger');
const models = require('../../../models');
const webScrapper = require('../../../web-scrapper');

const { Artist, Track } = models;

module.exports.learnArtist = async (bot, message, name) => {
  const found = await Artist.findOne({ where: { name: { $ilike: name } } });
  if (found) {
    logger.info(`I knew this artist: ${name}`);
    return found;
  }

  const newArtist = await Artist.create({ name });
  logger.info(`Leant a new artist: ${newArtist.name}`);
  // bot.reply(message, `Leant a new artist: ${newArtist.name}`);
  return newArtist;
};

module.exports.learnTrack = async (bot, message, name) => {
  const found = await Track.findOne({ where: { name: { $ilike: name } } });
  if (found) {
    logger.info(`I knew this track: ${name}`);
    return found;
  }

  const newTrack = await Track.create({ name });
  logger.info(`Leant a new track: ${newTrack.name}`);
  // bot.reply(message, `Leant a new track: ${newTrack.name}`);
  return newTrack;
};

const learnPair = async (bot, message, record) => {
  const { artist, track } = record;
  let trackInstance;
  let artistInstance;
  let found;
  if (_.isEmpty(track)) {
    trackInstance = null;
  } else {
    found = await Track.findOne({ where: { name: { $ilike: track } } });
    if (found) {
      logger.info(`I knew this track: ${track}`);
      trackInstance = found;
    } else {
      logger.info(`Leant a new track: ${track}`, record);
      // bot.reply(message, `Leant a new track: ${track}`);
      trackInstance = await Track.create({ name: track });
    }
  }

  if (_.isEmpty(artist)) {
    artistInstance = null;
  } else {
    found = await Artist.findOne({ where: { name: { $ilike: artist } } });
    if (found) {
      logger.info(`I knew this artist: ${artist}`);
      artistInstance = found;
    } else {
      logger.info(`Leant a new artist: ${artist}`);
      // bot.reply(message, `Leant a new artist: ${artist}`);
      artistInstance = await Artist.create({ name: artist });
    }
  }

  if (!(artistInstance && trackInstance)) {
    return record;
  }

  const artists = await trackInstance.getArtists({ where: { name: { ilike: artistInstance.name } } });
  if (_.isEmpty(artists)) {
    await trackInstance.addArtist(artistInstance);
    logger.info('Added new relationship', record);
    // bot.reply(message, `Added new relationship: ${artist} => ${track}`);
    return record;
  }

  return record;
};

module.exports.scrapeBillboard = async (bot, message) => {
  logger.info('Started scraping billboard', { user: message.user });
  bot.reply(message, 'Started scraping billboard.');
  try {
    const records = await webScrapper.scrapeBillboard();
    for (const record of records) { // eslint-disable-line no-restricted-syntax
      await learnPair(bot, message, record); // eslint-disable-line no-await-in-loop
    }
    bot.reply(message, 'Finished scraping billboard.');
  } catch (err) {
    logger.error('Something went wrong while scrapping billboard', err);
    bot.reply(message, `Something went wrong while scrapping billboard. <@${message.user}>`);
  }
};
