import app from './app';
// import logger from './api/lib/logger';

const port = process.env.INTERNAL_PORT || 3000;

app.listen(port, (error) => {
  if (error) {
    // logger.error(error);
    console.log(error);
  } else {
    // logger.info(`==> 🌎  Listening on port ${port}. Open up ${ho st}:${port}/ in your browser.`);
    console.log(`==> 🌎  Listening on port ${port}.`);
  }
});
