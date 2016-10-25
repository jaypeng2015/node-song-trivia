const _ = require('lodash');

const logger = require('../../../logger');
const models = require('../../../models');
const signals = require('../../../config').get('signals');

const Artist = models.Artist;
const Track = models.Track;

const match = (Module, clue) => {
  if (!_.includes(clue, '_')) {
    return Promise.resolve();
  }

  return Module.findAll()
    .then((instances) => {
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

          ++index;
        });

        return isMatch;
      });

      return found;
    });
};

const guessArtistByTrack = (bot, message, track) => {
  track.getArtists()
    .then((artists) => {
      artists.forEach((artist) => {
        bot.reply(message, `>${artist.name}`);
      });
    });
};

const guessByClue = (bot, message) => {
  const clues = message.text.split('-');
  if (clues.length === 2) {
    const artistClue = _.toUpper(_.trim(_.trimStart(clues[0], signals.clue)));
    const trackClue = _.toUpper(_.trim(clues[1]));
    Promise.all([
      match(Artist, artistClue),
      match(Track, trackClue),
    ])
    .then((results) => {
      _.forEach(results, (result) => {
        _.forEach(result, (guess) => {
          logger.info('make a guess', `>${guess.name}`);
          bot.reply(message, `>${guess.name}`);
        });
      });
    })
    .catch((err) => {
      logger.error('Something wrong', err);
    });
  }
};

module.exports = {
  guessByClue,
  guessArtistByTrack,
};
