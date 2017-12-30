const hydrate = require('feathers-sequelize/hooks/hydrate');

function includeAnswer() {
  return function (hook) {
    const Answer = hook.app.get('models').Answer;
    const association = {
      include: [{
        model: Answer,
        as: 'answers'
      }]
    };
    switch (hook.type) {
      case 'before':
        hook.params.sequelize = Object.assign(association, {
          raw: false
        });
        return Promise.resolve(hook);
      case 'after':
        hydrate(association).call(this, hook);
        break;
    }
  };
}
module.exports = {
  before: {
    all: [includeAnswer()]
  },
  after: {
    all: [includeAnswer()]
  }
};
