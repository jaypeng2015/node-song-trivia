# Slack Bot - Song Trivia The Legend

[![Dependency Status](https://david-dm.org/jaypeng2015/node-song-trivia-bot/status.svg)](https://david-dm.org/jaypeng2015/node-song-trivia-bot)
[![devDependency Status](https://david-dm.org/jaypeng2015/node-song-trivia-bot/dev-status.svg)](https://david-dm.org/jaypeng2015/node-song-trivia-bot?type=dev)

A slack bot who want's to win a song trivia game.

# Getting started
 - git clone https://github.com/jaypeng2015/node-song-trivia-bot.git
 - npm install
 - install [postgres](https://www.postgresql.org/)
 - Add a config.local.json file in /src/config/data folder, override any defualt configurations in config.defaults.json. Especially `botkit:token`, which reference to [Slackbot Token](https://api.slack.com/docs/oauth-test-tokens). By doing this you also add this bot to your slack group.
 - npm start
 - Invite this bot to your game channel
 - Enjoy the song trivia game

# How the game runs
 - There's another bot (called host) who hosts this trivia game, and the rule looks like this:
  - The host bot starts the game and say something into the channel (The start signal in the configuration file), and this bot knows the game begins.
  - The host takes answers start with `>`, and the text after the prefix will be considered as an artist or a track name, or both if the format is `name - name`. If the guesser gets the right answer, the host will react with different reactions (configurated in the configurations file as `reaction-artist` or `reaction-track`)
  - This bot will learn from the right answers and remember them by store into the database.
  - If no right answer after a new song starts 30s, the host will give a clue looks like this

  ```T_____ S____ - I K___ Y__ W___ T______```

  And this bot will make guesses based on it's knowledge.
 - The host will end the game by another signal and show final scores. Hopefully this bot will win the game.
 - To see more about the host bot, please visit [here](https://github.com/nicgordon/spotifyquizbot)
