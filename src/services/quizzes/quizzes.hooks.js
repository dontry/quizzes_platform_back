const hydrate = require('feathers-sequelize/hooks/hydrate');
const {
  authenticate
} = require('feathers-authentication').hooks;
const {
  restrictToOwner
} = require('feathers-authentication-hooks');

const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: 'id',
    ownerField: 'author'
  })
];


function includeQuestion() {
  return function (hook) {
    const Question = hook.app.get('models').Question;
    const association = {
      include: [{
        model: Question,
        as: 'questions'
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
    find: [...restrict, includeQuestion()],
    get: [...restrict, includeQuestion()],
    update: [...restrict, includeQuestion()],
    patch: [...restrict, includeQuestion()],
    remove: [...restrict, includeQuestion()]
  },

  after: {
    all: [includeQuestion()]
  }
};
