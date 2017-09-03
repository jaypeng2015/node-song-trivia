const _ = require('lodash');
const logger = require('../../../lib/logger');
const models = require('../../../models');
const signals = require('../../../config').get('signals');

const { Artist, Track } = models;

const match = async (Module, clue) => {
  if (!_.includes(clue, '_')) {
    return null;
  }

  const instances = await Module.findAll();
  const names = clue.split(' ');
  const found = _.filter(instances, (instance) => {
    const instanceNames = _.toUpper(instance.name).split(' ');
    if (names.length !== instanceNames.length) {
      return false;
    }

    let index = 0;
    let isMatch = true;
    _.forEach(names, (name) => {
      const prefix = _.trimEnd(name, '_');
      const target = instanceNames[index];
      if (target.length !== name.length || !_.startsWith(instanceNames[index], prefix)) {
        isMatch = false;
      }

      index += 1;
    });

    return isMatch;
  });

  return found;
};

const guessArtistByTrack = async (bot, message, track) => {
  const artists = await track.getArtists();
  artists.forEach((artist) => {
    bot.reply(message, `>${artist.name}`);
  });
};

const guessByClue = async (bot, message) => {
  const clues = message.text.split('-');
  if (clues.length === 2) {
    const artistClue = _.toUpper(_.trim(_.trimStart(clues[0], signals.clue)));
    const trackClue = _.toUpper(_.trim(clues[1]));
    try {
      const results = await Promise.all([
        match(Artist, artistClue),
        match(Track, trackClue),
      ]);

      _.forEach(results, (result) => {
        _.forEach(result, (guess) => {
          logger.info('make a guess', `>${guess.name}`);
          bot.reply(message, `>${guess.name}`);
        });
      });
    } catch (err) {
      logger.error('Something wrong', err);
    }
  }
};

module.exports = {
  guessByClue,
  guessArtistByTrack,
};
