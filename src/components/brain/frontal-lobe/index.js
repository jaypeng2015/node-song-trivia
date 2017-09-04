const _ = require('lodash');
const logger = require('../../../lib/logger');
const models = require('../../../models');

const NEGATIVES = [
  'This is really hard, isn\'t it?',
  'Who knows a song like this?',
  'Oh deer, this is too hard :sob:',
  'Wat!?',
  'I bet you\'ve never heard of this one before!',
  'Oh, come on!',
];

const { Artist, Track } = models;

const match = async (Module, clue) => {
  if (!_.includes(clue, '_')) {
    return { name: clue };
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

module.exports.guessArtistByTrack = async (bot, message, track) => {
  const artists = await track.getArtists();
  artists.forEach((artist) => {
    bot.reply(message, `>${artist.name}`);
  });
};

module.exports.guessByClue = async (bot, message) => {
  const clues = message.match;
  try {
    const results = await Promise.all([
      match(Artist, _.trim(clues[1])),
      match(Track, _.trim(clues[2])),
    ]);

    const guesses = _.compact(_.flatten(results));
    if (_.isEmpty(guesses)) {
      bot.reply(message, NEGATIVES[_.random(0, NEGATIVES.length)]);
    } else {
      _.forEach(guesses, (guess) => {
        logger.info('make a guess', `>${guess.name}`);
        bot.reply(message, `>${guess.name}`);
      });
    }
  } catch (err) {
    logger.error('Something wrong', err);
  }
};
