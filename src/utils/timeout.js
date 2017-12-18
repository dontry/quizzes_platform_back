const timeout = (duration) => new Promise((res, rej) => {
  setTimeout(() => {
    res();
  }, duration);
});

module.exports = timeout;
