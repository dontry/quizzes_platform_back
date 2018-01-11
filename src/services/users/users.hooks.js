const hydrate = require('feathers-sequelize/hooks/hydrate');
const {
  authenticate
} = require('@feathersjs/authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const {
  restrictToOwner
} = require('feathers-authentication-hooks');
const {
  hashPassword
} = require('@feathersjs/authentication-local').hooks;
const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: 'id',
    ownerField: 'id'
  })
];

function includeQuiz() {
  return function (hook) {
    const Quiz = hook.app.get('models').Quiz;
    const association = {
      include: [{
        model: Quiz,
        as: 'quizzes'
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
    find: [authenticate('jwt'), includeQuiz()],
    get: [...restrict],
    create: [hashPassword()],
    update: [hashPassword()],
    patch: [...restrict, hashPassword()],
    remove: [...restrict]
  },
  after: {
    all: [
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password')
      ),
      includeQuiz()
    ]
  },
  error: {
    all: []
  }
};
