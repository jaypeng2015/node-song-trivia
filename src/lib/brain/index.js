const learn = require('./learn');
const guess = require('./guess');

class Brain {

  constructor(bot) {
    this.bot = bot;
  }

  learnArtist(message, answers) {
    return learn.learnArtist(this.bot, message, answers);
  }

  learnTrack(message, answers) {
    return learn.learnTrack(this.bot, message, answers);
  }

  studyBillboard(message) {
    return learn.studyBillboard(this.bot, message);
  }

  guessByClue(message) {
    return guess.guessByClue(this.bot, message);
  }

  guessArtistByTrack(message, track) {
    return guess.guessArtistByTrack(this.bot, message, track);
  }
}

module.exports = Brain;
