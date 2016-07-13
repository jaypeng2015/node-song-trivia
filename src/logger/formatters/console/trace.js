module.exports = (frames) => {
  return frames.map((frame) => {
    const ref = frame.native ? 'native' : `${frame.file}:${frame.line}:${frame.column}`;
    return `${frame.function} (${ref})`;
  });
};
