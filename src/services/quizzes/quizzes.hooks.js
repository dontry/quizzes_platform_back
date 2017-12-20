const hydrate = require('feathers-sequelize/hooks/hydrate');

function includeQuestion() {
  return function (hook) {
    const Question = hook.app.get('models').Question;
    const association = {
      include: [{
        model: Question
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
    all: [includeQuestion()]
  },
  after: {
    all: [includeQuestion()]
  }
};
