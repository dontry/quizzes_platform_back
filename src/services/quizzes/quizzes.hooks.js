const hydrate = require('feathers-sequelize/hooks/hydrate');
const {
  authenticate
} = require('@feathersjs/authentication').hooks;
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

function addAttributeAuthor() {
  return function (hook) {
    if (hook.params.user) {
      hook.data = Object.assign(hook.data, {
        author: hook.params.user.id
      });
    }
  }
}


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
    find: [includeQuestion()],
    get: [includeQuestion()],
    create: [],
    update: [includeQuestion()],
    patch: [includeQuestion()],
    remove: [includeQuestion()]
  },

  after: {
    all: [includeQuestion()]
  }
};
