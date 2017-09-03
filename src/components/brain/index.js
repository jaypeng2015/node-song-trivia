const _ = require('lodash');
const hippocampus = require('./hippocampus');
const frontalLobe = require('./frontal-lobe');
const occipitalLobe = require('./occipital-lobe');

class Brain {
  constructor(bot) {
    this.bot = bot;
  }

  learnArtist(message, answers) {
    return hippocampus.learnArtist(this.bot, message, answers);
  }

  learnTrack(message, answers) {
    return hippocampus.learnTrack(this.bot, message, answers);
  }

  guessByClue(message) {
    return frontalLobe.guessByClue(this.bot, message);
  }

  guessArtistByTrack(message, track) {
    return frontalLobe.guessArtistByTrack(this.bot, message, track);
  }

  chat(message) {
    const text = message.text;
    if (_.includes(text, 'scrape billboard')
     && !_.includes('I can only beat other players if I know more than them.')) {
      return this.scrapeBillboard(message);
    }

    return occipitalLobe.chat(this.bot, message);
  }

  scrapeBillboard(message) {
    return hippocampus.scrapeBillboard(this.bot, message);
  }
}

module.exports = Brain;
