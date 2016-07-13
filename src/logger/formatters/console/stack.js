const pretty = require('fancy-errors/lib/pretty');

const FRAMES_DEPTH_LIMIT = 4;

module.exports = (text) => {
  const wrapped = new Error();
  wrapped.stack = text;

  // NOTE: it monkey-patches the `wrapper` error. Not nice indeed.
  pretty(wrapped);

  const frames = wrapped.stack.split('↳');

  let result = frames.slice(0, FRAMES_DEPTH_LIMIT + 1).join('↳');
  if (frames.length > FRAMES_DEPTH_LIMIT) {
    result += `\x1b[1;34mAdditional ${frames.length - FRAMES_DEPTH_LIMIT - 1} internal frames hidden\u001b[0m\n`;
  }

  return result;
};
