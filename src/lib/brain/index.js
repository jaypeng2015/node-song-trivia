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

  studyBillboard(message) {
    return hippocampus.studyBillboard(this.bot, message);
  }

  guessByClue(message) {
    return frontalLobe.guessByClue(this.bot, message);
  }

  guessArtistByTrack(message, track) {
    return frontalLobe.guessArtistByTrack(this.bot, message, track);
  }

  chat(message) {
    return occipitalLobe.chat(message);
  }
}

module.exports = Brain;
