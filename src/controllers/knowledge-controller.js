const _ = require('lodash');
const async = require('async');

const signals = require('../config').get('signals');
const logger = require('../logger');
const models = require('../models');

const Artist = models.Artist;
const Track = models.Track;

class KnowledgeController {

  constructor(bot) {
    this.bot = bot;
  }

  learn(record) {
    const { artist, track } = record;
    return Track.findOne({ where: { name: { $ilike: track } } })
      .then((found) => {
        if (found) {
          logger.info(`I knew this track: ${track}`);
          return found;
        }

        logger.info(`Leant a new track: ${track}`, record);
        return Track.create({ name: track });
      })
      .then((trackInstance) => {
        if (_.isEmpty(artist)) {
          logger.info(`billboard: no artist for this track: ${trackInstance.name}`);
          return { trackInstance, artistInstance: null };
        }

        return Artist.findOne({ where: { name: { $ilike: artist } } })
          .then((found) => {
            if (found) {
              logger.info(`I knew this artist: ${artist}`);
              return found;
            }

            logger.info(`Leant a new artist: ${artist}`);
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
                    return record;
                  });
              }

              return record;
            });
        }

        logger.info('No artist info for this track', record);
        return record;
      });
  }

  learnArtist(artist) {
    const name = _.trim(_.trimStart(_.toUpper(_.trim(artist)), signals.guess));
    return Artist.findOne({ where: { name: { $ilike: name } } })
      .then((found) => {
        if (!found) {
          return Artist.create({ name })
            .then((newArtist) => {
              logger.info(`Leant a new artist: ${newArtist.name}`);
              return newArtist;
            });
        }

        return found;
      });
  }

  learnTrack(track) {
    const name = _.trim(_.trimStart(_.toUpper(_.trim(track)), signals.guess));
    return Track.findOne({ where: { name: { $ilike: name } } })
      .then((found) => {
        if (!found) {
          return Track.create({ name })
            .then((newTrack) => {
              logger.info(`Leant a new artist: ${newTrack.name}`);
              return newTrack;
            });
        }

        return found;
      });
  }

  guess(message) {
    const clues = message.text.split('-');
    if (clues.length === 2) {
      const artistClue = _.toUpper(_.trim(_.trimStart(clues[0], signals.clue)));
      const trackClue = _.toUpper(_.trim(clues[1]));
      async.parallel([
        (callback) => {
          this.match(Artist, artistClue, callback);
        },
        (callback) => {
          this.match(Track, trackClue, callback);
        },
      ], (err, results) => {
        if (err) {
          logger.error('Something wrong', err);
          return;
        }

        _.forEach(results, (result) => {
          _.forEach(result, (guess) => {
            logger.info('make a guess', `>${guess.name}`);
            this.bot.reply(message, `>${guess.name}`);
          });
        });
      });
    }
  }

  guessArtistByTrack(message, track) {
    track.getArtists()
      .then((artists) => {
        artists.forEach((artist) => {
          this.bot.reply(message, `>${artist.name}`);
        });
      });
  }

  match(Module, clue, callback) {
    if (!_.includes(clue, '_')) {
      callback();
      return;
    }

    Module.findAll()
      .then((instances) => {
        const names = clue.split(' ');
        const found = _.filter(instances, (instance) => {
          const instanceNames = _.toUpper(instance.name).split(' ');
          if (names.length !== instanceNames.length) {
            return false;
          }

          let index = 0;
          let match = true;
          _.forEach(names, (name) => {
            const prefix = _.trimEnd(name, '_');
            const target = instanceNames[index];
            if (target.length !== name.length || !_.startsWith(instanceNames[index], prefix)) {
              match = false;
            }
            ++index;
          });

          return match;
        });

        callback(null, found);
      });
  }

}

module.exports = KnowledgeController;
