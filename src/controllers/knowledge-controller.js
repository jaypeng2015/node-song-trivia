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

  learnArtist(artist) {
    const name = _.trimStart(_.trimStart(_.toUpper(_.trim(artist), '>'), signals.start));
    return Artist.findOne({ where: { name } })
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
    const name = _.trimStart(_.trimStart(_.toUpper(_.trim(track), '>'), signals.start));
    return Track.findOne({ where: { name } })
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

  match(Module, clue, callback) {
    if (!_.includes(clue, '_')) {
      callback();
      return;
    }

    Module.findAll()
      .then((artists) => {
        const names = clue.split(' ');
        const found = _.filter(artists, (artist) => {
          const artistNames = artist.name.split(' ');
          if (names.length !== artistNames.length) {
            return false;
          }

          let index = 0;
          let match = true;
          _.forEach(names, (name) => {
            const prefix = _.trimEnd(name, '_');
            const target = artistNames[index];
            if (target.length !== name.length || !_.startsWith(artistNames[index], prefix)) {
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
