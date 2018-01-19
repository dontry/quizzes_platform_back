const {
  AbilityBuilder,
  Ability
} = require('casl');
const {
  Forbidden
} = require('feathers-errors');
const TYPE_KEY = Symbol.for('type');
const toSequelizeQuery = require('../utils/toSequelizeQuery');

Ability.addAlias('update', 'patch');
Ability.addAlias('read', ['get', 'find']);
Ability.addAlias('remove', 'delete');

function subjectName(subject) {
  if (!subject || typeof subject === 'string') {
    return subject;
  }
  return subject[TYPE_KEY];
}

function defineAbilitiesFor(user) {
  const {
    rules,
    can
  } = AbilityBuilder.extract();


  if (user) {
    const role = user.role;
    switch (role) {
      case 'USER':
        can(['read','update'], 'users', {
          id: user.id
        });
        can(['read','create','remove','update'], 'quizzes', {
          author: user.id
        });
        can(['read','create','remove','update'], 'questions');
        can(['read','remove'], 'answers');
        break;
      case 'ADMIN':
        can(['read','create','remove'], ['users', 'quizzes', 'questions', 'answers']);
        break;
      case 'SUPER':
        can('manage', ['users', 'quizzes', 'questions', 'answers']);
        break;
      default:
        break;
    }
  } else {
    can('read', ['quizzes', 'questions']);
  }
  return new Ability(rules, {
    subjectName
  });
}

function canReadQuery(query) {
  return query !== null;
}

module.exports = function authorize(name = null) {
  return async(hook) => {
    const action = hook.method;
    const service = name ? hook.app.service(name) : hook.service;
    const serviceName = name || hook.path;
    const ability = defineAbilitiesFor(hook.params.user);
    const throwUnlessCan = (action, resource) => {
      if (ability.cannot(action, resource)) {
        throw new Forbidden(`You are not allowed to ${action} ${serviceName}`);
      }
    };

    hook.params.ability = ability;

    if (hook.method === 'create') {
      hook.data[TYPE_KEY] = serviceName;
      const user = hook.params.user;
      if (serviceName === 'quizzes' && user.role === 'USER') {
        hook.data = Object.assign(hook.data, {
          author: user.id
        });
      }
      throwUnlessCan('create', hook.data);
    }
    //Not get service
    if (!hook.id) {
      const rules = hook.params.ability.rulesFor(action, serviceName);
      const query = toSequelizeQuery(rules);
      if (canReadQuery(query)) {
        Object.assign(hook.params.query, query);
      }
      return hook;
    }

    /*
      Additionally I added a check for get action, if requested action
      equals get then I can just return what was fetched for authorization
      check. Also pay attention that it’s possible to pass service name into
      hook and if it’s omitted, hook will authorize the service for which this
      hook is executed.
    */
    const params = Object.assign({}, hook.params, {
      provider: null
    }); //provider: null???
    const result = await service.get(hook.id, params);

    result[TYPE_KEY] = serviceName;
    throwUnlessCan('get', result);

    if (action === 'get') {
      hook.result = result;
    }

    return hook;
  };
};
