const hydrate = require('feathers-sequelize/hooks/hydrate');
const {
  authenticate
} = require('@feathersjs/authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const {
  restrictToOwner,
  queryWithCurrentUser,
} = require('feathers-authentication-hooks');
const {
  hashPassword
} = require('@feathersjs/authentication-local').hooks;
const permissions = require('feathers-permissions').hooks;

const permissionOption = {
  roles: ['ADMIN', 'SUPER'],
  on: 'user',
  field: 'role'
};

const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: 'id',
    ownerField: 'id'
  })
];

const permission = [
  permissions.checkPermissions(permissionOption),
  permissions.isPermitted((req, res, next) => {
    console.info('PERMISSION: ' + JSON.stringify(next));
  })
];

const restrictToCurrentUser = [
  queryWithCurrentUser({
    idField: 'id',
    as: 'id'
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
    find: [includeQuiz()],
    get: [],
    create: [hashPassword()],
    update: [hashPassword()],
    patch: [hashPassword()],
    remove: []
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
