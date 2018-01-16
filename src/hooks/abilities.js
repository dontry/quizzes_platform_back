const {
  AbilityBuilder,
  Ability
} = require('casl');
const {
  Forbidden
} = require('feathers-errors');
const toSequelizeQuery = require('../utils/toSequelizeQuery');

Ability.addAlias('update', 'patch');
Ability.addAlias('read', ['get', 'find']);
Ability.addAlias('remove', 'delete')

function defineAbilitiesFor(user) {
  const {
    rules,
    can
  } = AbilityBuilder.extract();

  can('read', ['quizzes', 'questions'])

  if (user) {
    can('manage', ['quizzes'], {
      author: user.id
    })
    can(['read', 'update'], 'users', {
      id: user.id
    })
  }
  return new Ability(rules);
}

module.exports = function authorize(servicename) {
  return async(hook) => {
    const action = hook.method;
    const service = name ? hook.app.service(name) : hook.service;
    const serviceName = name || hook.path;

    hook.params.ability = defineAbilitiesFor(hook.params.user);

    if (!hook.id) {
      const rules = hook.params.ability.rulesFor(action, serviceName);
      Object.assign(hook.params.query, toSequelizeQuery(rules))
      return hook;
    }
  };
}
