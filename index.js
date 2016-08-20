const webScrapperConfig = require('./src/config').get('web-scrapper');
const MrTrivia = require('./src/trivia');

const mrTrivia = new MrTrivia();
if (webScrapperConfig.activated) {
  mrTrivia.study();
}

mrTrivia.listen();
