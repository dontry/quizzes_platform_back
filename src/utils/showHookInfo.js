/* istanbul ignore */
module.exports = function() {
  return function(hook) {
    console.info(`Hooks: ${JSON.stringify(hook)}`);
  };
};
